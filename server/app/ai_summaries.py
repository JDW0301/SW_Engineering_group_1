from __future__ import annotations

from .database import db_connection


SUPPORT_TARGET = "SUPPORT"
INQUIRY_TARGET = "INQUIRY"


def ensure_ai_summary_table() -> None:
    with db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS ai_summary (
                    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    target_type ENUM('SUPPORT', 'INQUIRY') NOT NULL,
                    target_id BIGINT UNSIGNED NOT NULL,
                    summary_text TEXT NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uk_ai_summary_target (target_type, target_id),
                    KEY idx_ai_summary_updated_at (updated_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
        connection.commit()


def get_support_summary(user_id: int, support_session_id: int) -> dict | None:
    with db_connection() as connection:
        _ensure_operator_owns_support(connection, user_id, support_session_id)
        return _fetch_summary(connection, SUPPORT_TARGET, support_session_id)


def get_inquiry_summary(user_id: int, inquiry_id: int) -> dict | None:
    with db_connection() as connection:
        _ensure_operator_owns_inquiry(connection, user_id, inquiry_id)
        return _fetch_summary(connection, INQUIRY_TARGET, inquiry_id)


def save_support_summary(user_id: int, support_session_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            _ensure_operator_owns_support(connection, user_id, support_session_id)
            summary = _upsert_summary(connection, SUPPORT_TARGET, support_session_id, payload["summaryText"])
            connection.commit()
            return summary
        except Exception:
            connection.rollback()
            raise


def save_inquiry_summary(user_id: int, inquiry_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            _ensure_operator_owns_inquiry(connection, user_id, inquiry_id)
            summary = _upsert_summary(connection, INQUIRY_TARGET, inquiry_id, payload["summaryText"])
            connection.commit()
            return summary
        except Exception:
            connection.rollback()
            raise


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
            from .exceptions import AppError

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
            from .exceptions import AppError

            raise AppError(404, "문의를 찾을 수 없습니다.")


def _fetch_summary(connection, target_type: str, target_id: int) -> dict | None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, target_type, target_id, summary_text, created_at, updated_at
            FROM ai_summary
            WHERE target_type = %s AND target_id = %s
            LIMIT 1
            """,
            (target_type, target_id),
        )
        row = cursor.fetchone()
    return _format_summary(row) if row else None


def _upsert_summary(connection, target_type: str, target_id: int, summary_text: str) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO ai_summary (target_type, target_id, summary_text)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                summary_text = VALUES(summary_text),
                updated_at = CURRENT_TIMESTAMP
            """,
            (target_type, target_id, summary_text),
        )
    return _fetch_summary(connection, target_type, target_id)


def _format_summary(row: dict) -> dict:
    return {
        "id": row["id"],
        "targetType": row["target_type"].lower(),
        "targetId": row["target_id"],
        "summaryText": row["summary_text"],
        "createdAt": _format_date(row["created_at"]),
        "updatedAt": _format_date(row["updated_at"]),
    }


def _format_date(value) -> str | None:
    if value is None:
        return None
    return value.strftime("%Y-%m-%d %H:%M") if hasattr(value, "strftime") else str(value)
