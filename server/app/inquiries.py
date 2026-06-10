from __future__ import annotations

import base64
import binascii
import re
import uuid
from pathlib import Path

from .database import db_connection
from .exceptions import AppError


INQUIRY_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads" / "inquiries"
IMAGE_DATA_URL_PATTERN = re.compile(r"^data:image/(png|jpe?g|gif|webp);base64,(.+)$", re.IGNORECASE | re.DOTALL)


def ensure_inquiry_image_table() -> None:
    with db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS inquiry_post_image (
                    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    inquiry_post_id BIGINT UNSIGNED NOT NULL,
                    image_url VARCHAR(500) NOT NULL,
                    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    KEY idx_inquiry_post_image_post_id (inquiry_post_id),
                    CONSTRAINT fk_inquiry_post_image_post
                        FOREIGN KEY (inquiry_post_id) REFERENCES inquiry_post(id)
                        ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
        connection.commit()


def list_store_inquiries(store_id: int, user_id: int) -> list[dict]:
    with db_connection() as connection:
        return _fetch_inquiries(connection, "ip.store_id = %s", (store_id,), current_user_id=user_id, mask_secret=True)


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
                _replace_inquiry_image(cursor, inquiry_id, payload.get("image"))

            connection.commit()
            return _fetch_inquiry_by_id(connection, inquiry_id)
        except Exception:
            connection.rollback()
            raise


def update_inquiry(user_id: int, inquiry_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            _ensure_customer(connection, user_id)
            inquiry = _fetch_editable_inquiry(connection, user_id, inquiry_id)
            if payload["orderId"] is not None:
                _ensure_customer_order(connection, user_id, payload["orderId"], inquiry["store_id"])

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE inquiry_post
                    SET title = %s, content = %s, order_id = %s, is_secret = %s
                    WHERE id = %s AND author_user_id = %s
                    """,
                    (
                        payload["title"],
                        payload["content"],
                        payload["orderId"],
                        payload["isSecret"],
                        inquiry_id,
                        user_id,
                    ),
                )
                obsolete_image_urls = _replace_inquiry_image(cursor, inquiry_id, payload.get("image"))

            connection.commit()
            _delete_inquiry_image_files(obsolete_image_urls)
            return _fetch_inquiry_by_id(connection, inquiry_id, current_user_id=user_id)
        except Exception:
            connection.rollback()
            raise


def delete_inquiry(user_id: int, inquiry_id: int) -> None:
    with db_connection() as connection:
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM inquiry_post WHERE id = %s AND author_user_id = %s LIMIT 1",
                    (inquiry_id, user_id),
                )
                if not cursor.fetchone():
                    raise AppError(404, "문의를 찾을 수 없습니다.")
                image_url = _fetch_image(connection, inquiry_id)
                cursor.execute("DELETE FROM inquiry_post WHERE id = %s AND author_user_id = %s", (inquiry_id, user_id))
            connection.commit()
            if image_url:
                _delete_inquiry_image_files([image_url])
        except Exception:
            connection.rollback()
            raise


def _fetch_inquiries(connection, where_sql: str, params: tuple, current_user_id: int | None = None, mask_secret: bool = False) -> list[dict]:
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

    return [_format_inquiry(connection, row, current_user_id, mask_secret) for row in rows]


def _fetch_inquiry_by_id(connection, inquiry_id: int, current_user_id: int | None = None) -> dict:
    rows = _fetch_inquiries(connection, "ip.id = %s", (inquiry_id,), current_user_id=current_user_id)
    if not rows:
        raise AppError(404, "문의를 찾을 수 없습니다.")
    return rows[0]


def _fetch_editable_inquiry(connection, user_id: int, inquiry_id: int) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT ip.id, ip.store_id, COUNT(ipr.id) AS reply_count
            FROM inquiry_post ip
            LEFT JOIN inquiry_post_reply ipr ON ipr.inquiry_post_id = ip.id
            WHERE ip.id = %s AND ip.author_user_id = %s
            GROUP BY ip.id, ip.store_id
            LIMIT 1
            """,
            (inquiry_id, user_id),
        )
        inquiry = cursor.fetchone()
    if not inquiry:
        raise AppError(404, "문의를 찾을 수 없습니다.")
    if inquiry["reply_count"] > 0:
        raise AppError(400, "답변이 등록된 문의는 수정할 수 없습니다.")
    return inquiry


def _format_inquiry(connection, row: dict, current_user_id: int | None = None, mask_secret: bool = False) -> dict:
    is_mine = current_user_id is not None and row["author_user_id"] == current_user_id
    is_hidden_secret = mask_secret and row["is_secret"] and not is_mine
    order_meta = _fetch_order_meta(connection, row["order_id"], row["customer_name"])
    replies = [] if is_hidden_secret else _fetch_replies(connection, row["id"])
    image = None if is_hidden_secret else _fetch_image(connection, row["id"])
    title = "비밀글 입니다." if is_hidden_secret else row["title"]
    content = "" if is_hidden_secret else row["content"]
    return {
        "id": row["id"],
        "storeId": row["store_id"],
        "storeName": row["store_name"],
        "status": "RESOLVED" if row["inquiry_status"] in {"ANSWERED", "CLOSED"} else "IN_PROGRESS",
        "title": title,
        "orderId": row["order_id"],
        "content": content,
        "isSecret": bool(row["is_secret"]),
        "isMine": is_mine,
        "createdAt": _format_date(row["created_at"]),
        "lastMessageAt": _format_date(row["last_message_at"]),
        "customerName": row["customer_name"],
        "orderInfo": order_meta["orderInfo"],
        "orderProductName": order_meta["productName"],
        "replies": replies,
        "image": image,
        "messages": [
            {"id": 1, "sender": "customer", "content": content, "time": _format_date(row["created_at"])},
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


def _fetch_image(connection, inquiry_id: int) -> str | None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT image_url
            FROM inquiry_post_image
            WHERE inquiry_post_id = %s
            ORDER BY sort_order ASC, id ASC
            LIMIT 1
            """,
            (inquiry_id,),
        )
        row = cursor.fetchone()
    return row["image_url"] if row else None


def _replace_inquiry_image(cursor, inquiry_id: int, image: str | None) -> list[str]:
    cursor.execute("SELECT image_url FROM inquiry_post_image WHERE inquiry_post_id = %s", (inquiry_id,))
    previous_urls = [row["image_url"] for row in cursor.fetchall()]

    cursor.execute("DELETE FROM inquiry_post_image WHERE inquiry_post_id = %s", (inquiry_id,))
    image_url = _store_inquiry_image(image)
    if image_url:
        cursor.execute(
            """
            INSERT INTO inquiry_post_image (inquiry_post_id, image_url, sort_order)
            VALUES (%s, %s, 0)
            """,
            (inquiry_id, image_url),
        )
    return [url for url in previous_urls if url != image_url]


def _store_inquiry_image(image: str | None) -> str | None:
    if not image:
        return None
    if not image.startswith("data:image/"):
        return image

    match = IMAGE_DATA_URL_PATTERN.match(image)
    if not match:
        raise AppError(400, "이미지 형식이 올바르지 않습니다.")

    extension = "jpg" if match.group(1).lower() == "jpeg" else match.group(1).lower()
    try:
        image_bytes = base64.b64decode(match.group(2), validate=True)
    except (binascii.Error, ValueError) as error:
        raise AppError(400, "이미지를 읽지 못했습니다.") from error

    INQUIRY_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_name = f"{uuid.uuid4().hex}.{extension}"
    (INQUIRY_UPLOAD_DIR / file_name).write_bytes(image_bytes)
    return f"/api/uploads/inquiries/{file_name}"


def _delete_inquiry_image_files(image_urls: list[str]) -> None:
    for image_url in image_urls:
        image_path = _image_url_to_upload_path(image_url)
        if image_path and image_path.exists():
            image_path.unlink()


def _image_url_to_upload_path(image_url: str) -> Path | None:
    prefix = "/api/uploads/inquiries/"
    if not image_url.startswith(prefix):
        return None

    image_path = (INQUIRY_UPLOAD_DIR / image_url.removeprefix(prefix)).resolve()
    try:
        image_path.relative_to(INQUIRY_UPLOAD_DIR.resolve())
    except ValueError:
        return None
    return image_path


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
