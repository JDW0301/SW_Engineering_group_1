from __future__ import annotations

from datetime import timezone

from .database import db_connection
from .exceptions import AppError
from .repositories import (
    create_refresh_token_record,
    create_store,
    create_user,
    find_active_refresh_token,
    find_store_by_owner_user_id,
    find_user_by_email,
    find_user_by_id,
    find_user_by_login_id,
    revoke_all_refresh_tokens_for_user,
    revoke_refresh_token,
)
from .security import (
    build_refresh_expiry_date,
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_refresh_token,
)


def build_auth_response(user: dict, refresh_token: str) -> dict:
    return {
        "accessToken": create_access_token(user),
        "refreshToken": refresh_token,
        "user": {
            "id": user["id"],
            "loginId": user["login_id"],
            "email": user["email"],
            "name": user["name"],
            "phone": user["phone"],
            "role": user["role"],
            "status": user["status"],
        },
    }


def signup_customer(payload: dict) -> dict:
    with db_connection() as connection:
        try:
            if find_user_by_login_id(connection, payload["loginId"]):
                raise AppError(409, "이미 사용 중인 아이디입니다.")
            if find_user_by_email(connection, payload["email"]):
                raise AppError(409, "이미 사용 중인 이메일입니다.")

            user_id = create_user(
                connection,
                {
                    "loginId": payload["loginId"],
                    "email": payload["email"],
                    "passwordHash": hash_password(payload["password"]),
                    "name": payload["name"],
                    "phone": payload["phone"],
                    "role": "CUSTOMER",
                },
            )
            connection.commit()
            return find_user_by_id(connection, user_id)
        except Exception:
            connection.rollback()
            raise


def signup_operator(payload: dict) -> dict:
    with db_connection() as connection:
        try:
            if find_user_by_login_id(connection, payload["loginId"]):
                raise AppError(409, "이미 사용 중인 아이디입니다.")
            if find_user_by_email(connection, payload["email"]):
                raise AppError(409, "이미 사용 중인 이메일입니다.")

            user_id = create_user(
                connection,
                {
                    "loginId": payload["loginId"],
                    "email": payload["email"],
                    "passwordHash": hash_password(payload["password"]),
                    "name": payload["name"],
                    "phone": payload["phone"],
                    "role": "OPERATOR",
                },
            )
            create_store(
                connection,
                {
                    "ownerUserId": user_id,
                    "name": payload["storeName"],
                    "category": payload["category"],
                    "description": payload["description"],
                    "phone": payload["storePhone"],
                    "address": payload["address"],
                    "businessHours": payload["businessHours"],
                },
            )
            connection.commit()
            return find_user_by_id(connection, user_id)
        except Exception:
            connection.rollback()
            raise


def login(payload: dict) -> dict:
    with db_connection() as connection:
        user = find_user_by_login_id(connection, payload["loginId"])
        if not user or not verify_password(payload["password"], user["password_hash"]):
            raise AppError(401, "아이디 또는 비밀번호가 올바르지 않습니다.")
        if user["status"] != "ACTIVE":
            raise AppError(403, "비활성화된 계정입니다.")

        refresh_token = create_refresh_token(user)
        create_refresh_token_record(
            connection,
            {
                "userId": user["id"],
                "token": refresh_token,
                "expiresAt": build_refresh_expiry_date().astimezone(timezone.utc).replace(tzinfo=None),
            },
        )
        connection.commit()
        return build_auth_response(user, refresh_token)


def refresh_auth(refresh_token: str) -> dict:
    with db_connection() as connection:
        decoded = verify_refresh_token(refresh_token)
        stored_token = find_active_refresh_token(connection, refresh_token)
        if not stored_token:
            raise AppError(401, "리프레시 토큰이 만료되었거나 로그아웃되었습니다.")

        revoke_refresh_token(connection, refresh_token)
        user = find_user_by_id(connection, int(decoded["sub"]))
        if not user or user["status"] != "ACTIVE":
            raise AppError(401, "사용자 정보를 확인할 수 없습니다.")

        next_refresh_token = create_refresh_token(user)
        create_refresh_token_record(
            connection,
            {
                "userId": user["id"],
                "token": next_refresh_token,
                "expiresAt": build_refresh_expiry_date().astimezone(timezone.utc).replace(tzinfo=None),
            },
        )
        connection.commit()
        return build_auth_response(user, next_refresh_token)


def logout(refresh_token: str) -> None:
    with db_connection() as connection:
        revoke_refresh_token(connection, refresh_token)
        connection.commit()


def get_me(user_id: int) -> dict:
    with db_connection() as connection:
        user = find_user_by_id(connection, user_id)
        if not user:
            raise AppError(404, "사용자를 찾을 수 없습니다.")

        response = {
            "id": user["id"],
            "loginId": user["login_id"],
            "email": user["email"],
            "name": user["name"],
            "phone": user["phone"],
            "role": user["role"],
            "status": user["status"],
        }

        if user["role"] == "OPERATOR":
            response["store"] = find_store_by_owner_user_id(connection, user["id"])

        return response


def logout_all_devices(user_id: int) -> None:
    with db_connection() as connection:
        revoke_all_refresh_tokens_for_user(connection, user_id)
        connection.commit()
