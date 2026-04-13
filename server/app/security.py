from __future__ import annotations

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from .config import settings
from .exceptions import AppError


def hash_password(plain_password: str) -> str:
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt(rounds=10))
    return hashed.decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))


def _parse_duration(value: str) -> timedelta:
    unit = value[-1]
    amount = int(value[:-1])

    if unit == "m":
        return timedelta(minutes=amount)
    if unit == "h":
        return timedelta(hours=amount)
    if unit == "d":
        return timedelta(days=amount)

    raise ValueError(f"Unsupported duration: {value}")


def build_refresh_expiry_date() -> datetime:
    return datetime.now(timezone.utc) + _parse_duration(settings.jwt.refresh_expires_in)


def create_access_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]),
        "role": user["role"],
        "loginId": user["login_id"],
        "exp": datetime.now(timezone.utc) + _parse_duration(settings.jwt.access_expires_in),
    }
    return jwt.encode(payload, settings.jwt.access_secret, algorithm="HS256")


def create_refresh_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]),
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + _parse_duration(settings.jwt.refresh_expires_in),
    }
    return jwt.encode(payload, settings.jwt.refresh_secret, algorithm="HS256")


def verify_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt.access_secret, algorithms=["HS256"])
    except jwt.PyJWTError as error:
        raise AppError(401, "유효하지 않은 토큰입니다.") from error


def verify_refresh_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt.refresh_secret, algorithms=["HS256"])
    except jwt.PyJWTError as error:
        raise AppError(401, "리프레시 토큰이 유효하지 않습니다.") from error
