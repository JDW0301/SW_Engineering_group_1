from __future__ import annotations

from .database import db_connection
from .exceptions import AppError


def ensure_operator_workspace_tables() -> None:
    with db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS operator_internal_note (
                    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    operator_user_id BIGINT UNSIGNED NOT NULL,
                    support_session_id BIGINT UNSIGNED NULL,
                    inquiry_post_id BIGINT UNSIGNED NULL,
                    content TEXT NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    KEY idx_operator_note_operator_user_id (operator_user_id),
                    KEY idx_operator_note_support_session_id (support_session_id),
                    KEY idx_operator_note_inquiry_post_id (inquiry_post_id),
                    CONSTRAINT fk_operator_note_operator_user
                        FOREIGN KEY (operator_user_id) REFERENCES app_user(id),
                    CONSTRAINT fk_operator_note_support_session
                        FOREIGN KEY (support_session_id) REFERENCES support_session(id)
                        ON DELETE CASCADE,
                    CONSTRAINT fk_operator_note_inquiry_post
                        FOREIGN KEY (inquiry_post_id) REFERENCES inquiry_post(id)
                        ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
            _ensure_chatbot_knowledge_file_content_column(cursor)
        connection.commit()


def _ensure_chatbot_knowledge_file_content_column(cursor) -> None:
    cursor.execute(
        """
        SELECT COUNT(*) AS column_count
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'chatbot_knowledge_file'
          AND COLUMN_NAME = 'file_content'
        """
    )
    if cursor.fetchone()["column_count"] == 0:
        cursor.execute("ALTER TABLE chatbot_knowledge_file ADD COLUMN file_content MEDIUMTEXT NULL AFTER file_url")


def get_operator_workspace(user_id: int) -> dict:
    with db_connection() as connection:
        store = _ensure_operator_store(connection, user_id)
        return {
            "orders": _fetch_store_orders(connection, store["id"]),
            "notesByTarget": _fetch_notes(connection, user_id),
        }


def create_inquiry_reply(user_id: int, inquiry_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            _ensure_operator_owns_inquiry(connection, user_id, inquiry_id)
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO inquiry_post_reply (inquiry_post_id, author_user_id, content)
                    VALUES (%s, %s, %s)
                    """,
                    (inquiry_id, user_id, payload["content"]),
                )
                reply_id = cursor.lastrowid
                cursor.execute("UPDATE inquiry_post SET inquiry_status = 'ANSWERED' WHERE id = %s", (inquiry_id,))
            connection.commit()
            return _fetch_reply(connection, reply_id)
        except Exception:
            connection.rollback()
            raise


def create_internal_note(user_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            support_session_id = payload.get("supportSessionId")
            inquiry_post_id = payload.get("inquiryPostId")
            if support_session_id is not None:
                _ensure_operator_owns_support(connection, user_id, support_session_id)
            if inquiry_post_id is not None:
                _ensure_operator_owns_inquiry(connection, user_id, inquiry_post_id)
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO operator_internal_note (operator_user_id, support_session_id, inquiry_post_id, content)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (user_id, support_session_id, inquiry_post_id, payload["content"]),
                )
                note_id = cursor.lastrowid
            connection.commit()
            return _fetch_note(connection, note_id)
        except Exception:
            connection.rollback()
            raise


def list_operator_settings(user_id: int) -> dict:
    with db_connection() as connection:
        store = _ensure_operator_store(connection, user_id)
        return {
            "presets": _fetch_presets(connection, store["id"]),
            "faqs": _fetch_faqs(connection, store["id"]),
            "files": _fetch_files(connection, store["id"]),
        }


def save_operator_presets(user_id: int, payload: dict) -> list[dict]:
    with db_connection() as connection:
        try:
            store = _ensure_operator_store(connection, user_id)
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM response_preset WHERE store_id = %s", (store["id"],))
                for preset in payload["presets"]:
                    cursor.execute(
                        """
                        INSERT INTO response_preset (store_id, title, content)
                        VALUES (%s, %s, %s)
                        """,
                        (store["id"], preset["title"], preset["content"]),
                    )
            connection.commit()
            return _fetch_presets(connection, store["id"])
        except Exception:
            connection.rollback()
            raise


def save_operator_faqs(user_id: int, payload: dict) -> list[dict]:
    with db_connection() as connection:
        try:
            store = _ensure_operator_store(connection, user_id)
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM faq WHERE store_id = %s", (store["id"],))
                for index, faq in enumerate(payload["faqs"], start=1):
                    cursor.execute(
                        """
                        INSERT INTO faq (store_id, question, answer, sort_order)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (store["id"], faq["question"], faq["answer"], index),
                    )
            connection.commit()
            return _fetch_faqs(connection, store["id"])
        except Exception:
            connection.rollback()
            raise


def create_knowledge_file(user_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            store = _ensure_operator_store(connection, user_id)
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO chatbot_knowledge_file (store_id, file_name, file_url, file_content, is_active)
                    VALUES (%s, %s, %s, %s, TRUE)
                    """,
                    (
                        store["id"],
                        payload["fileName"],
                        payload.get("fileUrl") or f"local://{payload['fileName']}",
                        payload.get("fileContent"),
                    ),
                )
                file_id = cursor.lastrowid
            connection.commit()
            return _fetch_file(connection, file_id)
        except Exception:
            connection.rollback()
            raise


def delete_knowledge_file(user_id: int, file_id: int) -> None:
    with db_connection() as connection:
        try:
            store = _ensure_operator_store(connection, user_id)
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM chatbot_knowledge_file WHERE id = %s AND store_id = %s", (file_id, store["id"]))
            connection.commit()
        except Exception:
            connection.rollback()
            raise


def _ensure_operator_store(connection, user_id: int) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT s.id, s.name
            FROM store s
            JOIN app_user u ON u.id = s.owner_user_id
            WHERE s.owner_user_id = %s AND u.role = 'OPERATOR'
            LIMIT 1
            """,
            (user_id,),
        )
        store = cursor.fetchone()
    if not store:
        raise AppError(403, "관리자 스토어를 찾을 수 없습니다.")
    return store


def _fetch_store_orders(connection, store_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
              o.id, o.store_id, s.name AS store_name, o.order_number,
              first_item.product_name, first_item.quantity, o.total_price, o.ordered_at,
              u.name AS customer_name, u.phone AS customer_phone
            FROM order_table o
            JOIN store s ON s.id = o.store_id
            JOIN app_user u ON u.id = o.user_id
            JOIN (
              SELECT oi.order_id, oi.quantity, p.name AS product_name
              FROM order_item oi
              JOIN product p ON p.id = oi.product_id
              JOIN (SELECT order_id, MIN(id) AS first_item_id FROM order_item GROUP BY order_id) first_order_item
                ON first_order_item.first_item_id = oi.id
            ) first_item ON first_item.order_id = o.id
            WHERE o.store_id = %s
            ORDER BY o.ordered_at DESC
            """,
            (store_id,),
        )
        rows = cursor.fetchall()
    return [
        {
            "id": row["id"],
            "storeId": row["store_id"],
            "storeName": row["store_name"],
            "orderNumber": row["order_number"],
            "productName": row["product_name"],
            "quantity": row["quantity"],
            "totalPrice": int(row["total_price"]),
            "orderedAt": _format_date(row["ordered_at"], True),
            "customerName": row["customer_name"],
            "phone": row["customer_phone"],
        }
        for row in rows
    ]


def _fetch_notes(connection, user_id: int) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, support_session_id, inquiry_post_id, content, created_at
            FROM operator_internal_note
            WHERE operator_user_id = %s
            ORDER BY created_at ASC, id ASC
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
    notes = {}
    for row in rows:
        key = f"support-{row['support_session_id']}" if row["support_session_id"] else f"inquiry-{row['inquiry_post_id']}"
        notes.setdefault(key, []).append(_format_note(row))
    return notes


def _fetch_note(connection, note_id: int) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, support_session_id, inquiry_post_id, content, created_at
            FROM operator_internal_note
            WHERE id = %s
            LIMIT 1
            """,
            (note_id,),
        )
        return _format_note(cursor.fetchone())


def _format_note(row: dict) -> dict:
    return {"id": row["id"], "content": row["content"], "time": _format_date(row["created_at"])}


def _fetch_reply(connection, reply_id: int) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, inquiry_post_id, content, created_at
            FROM inquiry_post_reply
            WHERE id = %s
            LIMIT 1
            """,
            (reply_id,),
        )
        row = cursor.fetchone()
    return {
        "id": row["id"],
        "inquiryPostId": row["inquiry_post_id"],
        "authorType": "operator",
        "content": row["content"],
        "createdAt": _format_date(row["created_at"]),
    }


def _fetch_presets(connection, store_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, title, content, updated_at
            FROM response_preset
            WHERE store_id = %s
            ORDER BY id ASC
            """,
            (store_id,),
        )
        rows = cursor.fetchall()
    return [{"id": row["id"], "title": row["title"], "content": row["content"], "updatedAt": _format_date(row["updated_at"])} for row in rows]


def _fetch_faqs(connection, store_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, question, answer, sort_order
            FROM faq
            WHERE store_id = %s
            ORDER BY sort_order ASC, id ASC
            """,
            (store_id,),
        )
        rows = cursor.fetchall()
    return [
        {
            "id": row["id"],
            "question": row["question"],
            "answer": row["answer"],
            "sortOrder": row["sort_order"],
        }
        for row in rows
    ]


def _fetch_files(connection, store_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, file_name, file_url, file_content, is_active, uploaded_at
            FROM chatbot_knowledge_file
            WHERE store_id = %s
            ORDER BY uploaded_at DESC, id DESC
            """,
            (store_id,),
        )
        rows = cursor.fetchall()
    return [_format_file(row) for row in rows]


def _fetch_file(connection, file_id: int) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, file_name, file_url, file_content, is_active, uploaded_at
            FROM chatbot_knowledge_file
            WHERE id = %s
            LIMIT 1
            """,
            (file_id,),
        )
        return _format_file(cursor.fetchone())


def _format_file(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["file_name"],
        "fileUrl": row["file_url"],
        "content": row.get("file_content"),
        "isActive": bool(row["is_active"]),
        "uploadedAt": _format_date(row["uploaded_at"]),
    }


def _ensure_operator_owns_support(connection, user_id: int, support_session_id: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT ss.id
            FROM support_session ss
            JOIN store s ON s.id = ss.store_id
            WHERE ss.id = %s AND s.owner_user_id = %s
            LIMIT 1
            """,
            (support_session_id, user_id),
        )
        if not cursor.fetchone():
            raise AppError(404, "상담을 찾을 수 없습니다.")


def _ensure_operator_owns_inquiry(connection, user_id: int, inquiry_id: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT ip.id
            FROM inquiry_post ip
            JOIN store s ON s.id = ip.store_id
            WHERE ip.id = %s AND s.owner_user_id = %s
            LIMIT 1
            """,
            (inquiry_id, user_id),
        )
        if not cursor.fetchone():
            raise AppError(404, "문의를 찾을 수 없습니다.")


def _format_date(value, date_only: bool = False) -> str | None:
    if value is None:
        return None
    return value.strftime("%Y-%m-%d" if date_only else "%Y-%m-%d %H:%M") if hasattr(value, "strftime") else str(value)
