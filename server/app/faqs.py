from __future__ import annotations

from .database import db_connection
from .exceptions import AppError


def list_store_faqs(store_id: int) -> list[dict]:
    with db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM store WHERE id = %s LIMIT 1", (store_id,))
            if not cursor.fetchone():
                raise AppError(404, "스토어를 찾을 수 없습니다.")

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
