from __future__ import annotations

from .database import db_connection
from .exceptions import AppError
from .repositories import find_store_by_owner_user_id, find_user_by_id, update_store_by_id


def update_operator_store(user_id: int, payload: dict) -> dict:
    with db_connection() as connection:
        try:
            user = find_user_by_id(connection, user_id)
            if not user:
                raise AppError(404, "사용자를 찾을 수 없습니다.")
            if user["role"] != "OPERATOR":
                raise AppError(403, "관리자만 스토어 정보를 수정할 수 있습니다.")

            store = find_store_by_owner_user_id(connection, user_id)
            if not store:
                raise AppError(404, "스토어를 찾을 수 없습니다.")

            update_store_by_id(connection, store["id"], payload)
            connection.commit()
            return find_store_by_owner_user_id(connection, user_id)
        except Exception:
            connection.rollback()
            raise
