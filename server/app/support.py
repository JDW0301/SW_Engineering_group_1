from __future__ import annotations

from .database import db_connection
from .exceptions import AppError


def list_customer_support(user_id: int) -> dict:
    with db_connection() as connection:
        _ensure_role(connection, user_id, "CUSTOMER")
        sessions = _fetch_sessions(connection, "ss.customer_user_id = %s", (user_id,))
        return _build_support_payload(connection, sessions)


def list_operator_support(user_id: int) -> dict:
    with db_connection() as connection:
        _ensure_role(connection, user_id, "OPERATOR")
        sessions = _fetch_sessions(connection, "s.owner_user_id = %s", (user_id,))
        return _build_support_payload(connection, sessions)


def create_support_session(user_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            _ensure_role(connection, user_id, "CUSTOMER")
            _ensure_store_exists(connection, payload["storeId"])
            order_id = payload.get("orderId")
            if order_id is not None:
                _ensure_customer_order(connection, user_id, order_id, payload["storeId"])
            operator_id = _find_store_owner(connection, payload["storeId"])
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO support_session (
                      store_id, customer_user_id, operator_user_id, order_id,
                      session_type, support_status, last_message_at
                    )
                    VALUES (%s, %s, %s, %s, %s, 'IN_PROGRESS', CURRENT_TIMESTAMP)
                    """,
                    (payload["storeId"], user_id, operator_id, order_id, "ORDER" if order_id else "GENERAL"),
                )
                session_id = cursor.lastrowid
                for message in payload.get("initialMessages", []):
                    _insert_message(connection, session_id, user_id, message.get("sender", "SYSTEM"), message.get("content", ""))
            connection.commit()
            sessions = _fetch_sessions(connection, "ss.id = %s", (session_id,))
            return _format_session(connection, sessions[0])
        except Exception:
            connection.rollback()
            raise


def create_support_message(user_id: int, session_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            session = _fetch_session_for_user(connection, user_id, session_id)
            sender_type = "OPERATOR" if session["current_user_role"] == "OPERATOR" else "CUSTOMER"
            message_id = _insert_message(connection, session_id, user_id, sender_type, payload["content"])
            with connection.cursor() as cursor:
                cursor.execute("UPDATE support_session SET last_message_at = CURRENT_TIMESTAMP WHERE id = %s", (session_id,))
            connection.commit()
            return _fetch_message_by_id(connection, message_id)
        except Exception:
            connection.rollback()
            raise


def update_support_status(user_id: int, session_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            session = _fetch_session_for_user(connection, user_id, session_id)
            if session["current_user_role"] != "OPERATOR":
                raise AppError(403, "관리자만 상담 상태를 변경할 수 있습니다.")
            status = payload["status"]
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE support_session
                    SET support_status = %s,
                        closed_at = CASE WHEN %s = 'RESOLVED' THEN CURRENT_TIMESTAMP ELSE closed_at END
                    WHERE id = %s
                    """,
                    (status, status, session_id),
                )
            connection.commit()
            sessions = _fetch_sessions(connection, "ss.id = %s", (session_id,))
            return _format_session(connection, sessions[0])
        except Exception:
            connection.rollback()
            raise


def _build_support_payload(connection, sessions: list[dict]) -> dict:
    formatted = [_format_session(connection, session) for session in sessions]
    return {
        "supportSessions": formatted,
        "supportMessagesBySessionId": {session["id"]: session["messages"] for session in formatted},
    }


def _fetch_sessions(connection, where_sql: str, params: tuple) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT
              ss.id,
              ss.store_id,
              s.name AS store_name,
              ss.customer_user_id,
              u.name AS customer_name,
              u.phone AS customer_phone,
              ss.operator_user_id,
              ss.order_id,
              ss.support_status,
              ss.created_at,
              COALESCE(ss.last_message_at, ss.created_at) AS last_message_at,
              first_message.content AS title
            FROM support_session ss
            JOIN store s ON s.id = ss.store_id
            JOIN app_user u ON u.id = ss.customer_user_id
            LEFT JOIN (
              SELECT sm.support_session_id, sm.content
              FROM support_message sm
              JOIN (
                SELECT support_session_id, MIN(id) AS first_message_id
                FROM support_message
                WHERE sender_type IN ('CUSTOMER', 'SYSTEM')
                GROUP BY support_session_id
              ) first_support_message ON first_support_message.first_message_id = sm.id
            ) first_message ON first_message.support_session_id = ss.id
            WHERE {where_sql}
            ORDER BY COALESCE(ss.last_message_at, ss.created_at) DESC, ss.id DESC
            """,
            params,
        )
        return cursor.fetchall()


def _format_session(connection, row: dict) -> dict:
    order_meta = _fetch_order_meta(connection, row["order_id"], row["customer_name"], row["customer_phone"])
    messages = _fetch_messages(connection, row["id"])
    return {
        "id": row["id"],
        "storeId": row["store_id"],
        "storeName": row["store_name"],
        "status": row["support_status"],
        "title": row["title"] or "일반 상담",
        "orderId": row["order_id"],
        "createdAt": _format_date(row["created_at"]),
        "lastMessageAt": _format_date(row["last_message_at"]),
        "orderInfo": order_meta["orderInfo"],
        "orderProductName": order_meta["productName"],
        "customerName": row["customer_name"],
        "phone": row["customer_phone"],
        "messages": messages,
    }


def _fetch_messages(connection, session_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, support_session_id, sender_type, content, created_at
            FROM support_message
            WHERE support_session_id = %s
            ORDER BY created_at ASC, id ASC
            """,
            (session_id,),
        )
        rows = cursor.fetchall()
    return [_format_message(row) for row in rows]


def _format_message(row: dict) -> dict:
    sender_map = {"CUSTOMER": "customer", "OPERATOR": "operator", "SYSTEM": "system"}
    return {
        "id": row["id"],
        "supportSessionId": row["support_session_id"],
        "sender": sender_map.get(row["sender_type"], "system"),
        "content": row["content"],
        "time": _format_date(row["created_at"]),
    }


def _insert_message(connection, session_id: int, sender_user_id: int | None, sender_type: str, content: str) -> int:
    sender_type = sender_type.upper()
    if sender_type == "USER":
        sender_type = "CUSTOMER"
    if sender_type == "BOT":
        sender_type = "SYSTEM"
    if sender_type == "SYSTEM":
        sender_user_id = None
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO support_message (support_session_id, sender_user_id, sender_type, content)
            VALUES (%s, %s, %s, %s)
            """,
            (session_id, sender_user_id, sender_type, content),
        )
        return cursor.lastrowid


def _fetch_message_by_id(connection, message_id: int) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, support_session_id, sender_type, content, created_at
            FROM support_message
            WHERE id = %s
            LIMIT 1
            """,
            (message_id,),
        )
        return _format_message(cursor.fetchone())


def _fetch_session_for_user(connection, user_id: int, session_id: int) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT ss.id, ss.customer_user_id, s.owner_user_id, u.role AS current_user_role
            FROM support_session ss
            JOIN store s ON s.id = ss.store_id
            JOIN app_user u ON u.id = %s
            WHERE ss.id = %s
              AND (ss.customer_user_id = %s OR s.owner_user_id = %s)
            LIMIT 1
            """,
            (user_id, session_id, user_id, user_id),
        )
        session = cursor.fetchone()
    if not session:
        raise AppError(404, "상담을 찾을 수 없습니다.")
    return session


def _ensure_role(connection, user_id: int, role: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT role FROM app_user WHERE id = %s LIMIT 1", (user_id,))
        user = cursor.fetchone()
    if not user or user["role"] != role:
        raise AppError(403, "접근 권한이 없습니다.")


def _ensure_store_exists(connection, store_id: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM store WHERE id = %s LIMIT 1", (store_id,))
        if not cursor.fetchone():
            raise AppError(404, "스토어를 찾을 수 없습니다.")


def _find_store_owner(connection, store_id: int) -> int | None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT owner_user_id FROM store WHERE id = %s LIMIT 1", (store_id,))
        row = cursor.fetchone()
    return row["owner_user_id"] if row else None


def _ensure_customer_order(connection, user_id: int, order_id: int, store_id: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id FROM order_table
            WHERE id = %s AND user_id = %s AND store_id = %s
            LIMIT 1
            """,
            (order_id, user_id, store_id),
        )
        if not cursor.fetchone():
            raise AppError(400, "선택한 주문을 확인할 수 없습니다.")


def _fetch_order_meta(connection, order_id: int | None, customer_name: str, customer_phone: str | None) -> dict:
    if order_id is None:
        return {"orderInfo": None, "productName": None, "customerName": customer_name, "phone": customer_phone}
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT o.order_number, o.ordered_at, o.total_price, first_item.product_name, first_item.quantity
            FROM order_table o
            JOIN (
              SELECT oi.order_id, oi.quantity, p.name AS product_name
              FROM order_item oi
              JOIN product p ON p.id = oi.product_id
              JOIN (SELECT order_id, MIN(id) AS first_item_id FROM order_item GROUP BY order_id) first_order_item
                ON first_order_item.first_item_id = oi.id
            ) first_item ON first_item.order_id = o.id
            WHERE o.id = %s
            LIMIT 1
            """,
            (order_id,),
        )
        row = cursor.fetchone()
    if not row:
        return {"orderInfo": None, "productName": None, "customerName": customer_name, "phone": customer_phone}
    return {
        "orderInfo": f"{row['product_name']} ({row['order_number']})",
        "productName": row["product_name"],
        "customerName": customer_name,
        "phone": customer_phone,
    }


def _format_date(value) -> str:
    return value.strftime("%Y-%m-%d %H:%M") if hasattr(value, "strftime") else str(value)
