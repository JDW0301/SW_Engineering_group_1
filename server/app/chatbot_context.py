from __future__ import annotations

from .database import db_connection


MAX_KNOWLEDGE_CHARS = 12000


def enrich_chatbot_payload(payload: dict) -> dict:
    store_id = payload.get("storeId")
    if not isinstance(store_id, int):
        return payload

    knowledge_context = _fetch_store_knowledge_context(store_id)
    if not knowledge_context:
        return payload

    store_context = payload.get("store_context")
    combined_context = "\n\n".join(part for part in [store_context, knowledge_context] if isinstance(part, str) and part.strip())
    return {**payload, "store_context": combined_context}


def _fetch_store_knowledge_context(store_id: int) -> str:
    with db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT file_name, file_content
                FROM chatbot_knowledge_file
                WHERE store_id = %s
                  AND is_active = TRUE
                  AND file_content IS NOT NULL
                  AND file_content <> ''
                ORDER BY uploaded_at DESC, id DESC
                LIMIT 5
                """,
                (store_id,),
            )
            rows = cursor.fetchall()

    sections = []
    remaining = MAX_KNOWLEDGE_CHARS
    for row in rows:
        content = row["file_content"].strip()
        if not content or remaining <= 0:
            continue
        clipped = content[:remaining]
        remaining -= len(clipped)
        sections.append(f"[업로드 TXT: {row['file_name']}]\n{clipped}")

    if not sections:
        return ""
    return "스토어별 챗봇 참고 TXT 자료:\n" + "\n\n".join(sections)
