from __future__ import annotations

from .database import db_connection
from .exceptions import AppError


def list_store_inquiries(store_id: int) -> list[dict]:
    with db_connection() as connection:
        return _fetch_inquiries(connection, "ip.store_id = %s", (store_id,))


def list_my_inquiries(user_id: int) -> list[dict]:
    with db_connection() as connection:
        return _fetch_inquiries(connection, "ip.author_user_id = %s", (user_id,))


def list_operator_inquiries(user_id: int) -> list[dict]:
    with db_connection() as connection:
        return _fetch_inquiries(connection, "s.owner_user_id = %s", (user_id,))


def create_inquiry(user_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            _ensure_customer(connection, user_id)
            _ensure_store_exists(connection, payload["storeId"])
            if payload["orderId"] is not None:
                _ensure_customer_order(connection, user_id, payload["orderId"], payload["storeId"])

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO inquiry_post (store_id, author_user_id, order_id, title, content, is_secret, inquiry_status)
                    VALUES (%s, %s, %s, %s, %s, %s, 'OPEN')
                    """,
                    (
                        payload["storeId"],
                        user_id,
                        payload["orderId"],
                        payload["title"],
                        payload["content"],
                        payload["isSecret"],
                    ),
                )
                inquiry_id = cursor.lastrowid

            connection.commit()
            return _fetch_inquiry_by_id(connection, inquiry_id)
        except Exception:
            connection.rollback()
            raise


def _fetch_inquiries(connection, where_sql: str, params: tuple) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT
              ip.id,
              ip.store_id,
              s.name AS store_name,
              ip.author_user_id,
              u.name AS customer_name,
              ip.order_id,
              ip.title,
              ip.content,
              ip.is_secret,
              ip.inquiry_status,
              ip.created_at,
              COALESCE(MAX(ipr.created_at), ip.created_at) AS last_message_at
            FROM inquiry_post ip
            JOIN store s ON s.id = ip.store_id
            JOIN app_user u ON u.id = ip.author_user_id
            LEFT JOIN inquiry_post_reply ipr ON ipr.inquiry_post_id = ip.id
            WHERE {where_sql}
            GROUP BY ip.id, ip.store_id, s.name, ip.author_user_id, u.name, ip.order_id, ip.title, ip.content, ip.is_secret, ip.inquiry_status, ip.created_at
            ORDER BY last_message_at DESC, ip.id DESC
            """,
            params,
        )
        rows = cursor.fetchall()

    return [_format_inquiry(connection, row) for row in rows]


def _fetch_inquiry_by_id(connection, inquiry_id: int) -> dict:
    rows = _fetch_inquiries(connection, "ip.id = %s", (inquiry_id,))
    if not rows:
        raise AppError(404, "문의를 찾을 수 없습니다.")
    return rows[0]


def _format_inquiry(connection, row: dict) -> dict:
    order_meta = _fetch_order_meta(connection, row["order_id"], row["customer_name"])
    replies = _fetch_replies(connection, row["id"])
    return {
        "id": row["id"],
        "storeId": row["store_id"],
        "storeName": row["store_name"],
        "status": "RESOLVED" if row["inquiry_status"] in {"ANSWERED", "CLOSED"} else "IN_PROGRESS",
        "title": row["title"],
        "orderId": row["order_id"],
        "content": row["content"],
        "isSecret": bool(row["is_secret"]),
        "createdAt": _format_date(row["created_at"]),
        "lastMessageAt": _format_date(row["last_message_at"]),
        "customerName": row["customer_name"],
        "orderInfo": order_meta["orderInfo"],
        "orderProductName": order_meta["productName"],
        "replies": replies,
        "messages": [
            {"id": 1, "sender": "customer", "content": row["content"], "time": _format_date(row["created_at"])},
            *[
                {"id": index + 2, "sender": "operator", "content": reply["content"], "time": reply["createdAt"]}
                for index, reply in enumerate(replies)
            ],
        ],
    }


def _fetch_replies(connection, inquiry_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, inquiry_post_id, content, created_at
            FROM inquiry_post_reply
            WHERE inquiry_post_id = %s
            ORDER BY created_at ASC, id ASC
            """,
            (inquiry_id,),
        )
        rows = cursor.fetchall()

    return [
        {
            "id": row["id"],
            "inquiryPostId": row["inquiry_post_id"],
            "authorType": "operator",
            "content": row["content"],
            "createdAt": _format_date(row["created_at"]),
        }
        for row in rows
    ]


def _fetch_order_meta(connection, order_id: int | None, customer_name: str) -> dict:
    if order_id is None:
        return {"orderInfo": None, "productName": None, "customerName": customer_name}

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT o.order_number, first_item.product_name
            FROM order_table o
            JOIN (
              SELECT oi.order_id, p.name AS product_name
              FROM order_item oi
              JOIN product p ON p.id = oi.product_id
              JOIN (
                SELECT order_id, MIN(id) AS first_item_id
                FROM order_item
                GROUP BY order_id
              ) first_order_item ON first_order_item.first_item_id = oi.id
            ) first_item ON first_item.order_id = o.id
            WHERE o.id = %s
            LIMIT 1
            """,
            (order_id,),
        )
        order = cursor.fetchone()

    if not order:
        return {"orderInfo": None, "productName": None, "customerName": customer_name}
    return {
        "orderInfo": f"{order['product_name']} ({order['order_number']})",
        "productName": order["product_name"],
        "customerName": customer_name,
    }


def _ensure_customer(connection, user_id: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT role FROM app_user WHERE id = %s LIMIT 1", (user_id,))
        user = cursor.fetchone()
    if not user or user["role"] != "CUSTOMER":
        raise AppError(403, "이용자 계정만 문의를 작성할 수 있습니다.")


def _ensure_store_exists(connection, store_id: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM store WHERE id = %s LIMIT 1", (store_id,))
        if not cursor.fetchone():
            raise AppError(404, "스토어를 찾을 수 없습니다.")


def _ensure_customer_order(connection, user_id: int, order_id: int, store_id: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id
            FROM order_table
            WHERE id = %s AND user_id = %s AND store_id = %s
            LIMIT 1
            """,
            (order_id, user_id, store_id),
        )
        if not cursor.fetchone():
            raise AppError(400, "선택한 주문을 확인할 수 없습니다.")


def _format_date(value) -> str:
    return value.strftime("%Y-%m-%d %H:%M") if hasattr(value, "strftime") else str(value)
