from __future__ import annotations

import base64
import re
import uuid
from pathlib import Path

from .database import db_connection
from .exceptions import AppError
from .repositories import find_store_by_owner_user_id, find_user_by_id, update_store_by_id

STORE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads" / "stores"
_IMAGE_DATA_URL_RE = re.compile(r"^data:image/(png|jpe?g|gif|webp);base64,(.+)$", re.IGNORECASE | re.DOTALL)


def _save_icon(data_url: str) -> str:
    match = _IMAGE_DATA_URL_RE.match(data_url)
    if not match:
        raise AppError(400, "아이콘은 이미지 data URL 형식이어야 합니다.")
    ext, b64 = match.group(1).lower(), match.group(2)
    ext = "jpg" if ext in ("jpeg", "jpg") else ext
    try:
        image_bytes = base64.b64decode(b64)
    except Exception:
        raise AppError(400, "아이콘 이미지 데이터가 올바르지 않습니다.")
    STORE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_name = f"{uuid.uuid4().hex}.{ext}"
    (STORE_UPLOAD_DIR / file_name).write_bytes(image_bytes)
    return f"/api/uploads/stores/{file_name}"


def _delete_icon(icon_url: str | None) -> None:
    if not icon_url or not icon_url.startswith("/api/uploads/stores/"):
        return
    path = (STORE_UPLOAD_DIR / icon_url.removeprefix("/api/uploads/stores/")).resolve()
    try:
        path.relative_to(STORE_UPLOAD_DIR.resolve())
        if path.exists():
            path.unlink()
    except ValueError:
        pass


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

            icon_input = payload.get("iconUrl")
            old_icon_url = store.get("icon_url")
            if icon_input and icon_input.startswith("data:"):
                new_icon_url = _save_icon(icon_input)
                payload = {**payload, "iconUrl": new_icon_url}
            elif icon_input == "":
                payload = {**payload, "iconUrl": None}
            elif icon_input is None:
                payload = {**payload, "iconUrl": old_icon_url}
            else:
                payload = {**payload, "iconUrl": icon_input}

            update_store_by_id(connection, store["id"], payload)
            connection.commit()

            if (icon_input and icon_input.startswith("data:") and old_icon_url) or (icon_input == "" and old_icon_url):
                _delete_icon(old_icon_url)

            return find_store_by_owner_user_id(connection, user_id)
        except Exception:
            connection.rollback()
            raise
