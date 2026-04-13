from __future__ import annotations

import re

from .exceptions import AppError


def require_string(value, field_name: str) -> str:
    if not isinstance(value, str) or value.strip() == "":
        raise AppError(400, f"{field_name}은(는) 필수입니다.")
    return value.strip()


def require_email(value) -> str:
    email = require_string(value, "이메일").lower()
    if re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email) is None:
        raise AppError(400, "올바른 이메일 형식이 아닙니다.")
    return email


def validate_customer_signup(body: dict) -> dict:
    return {
        "loginId": require_string(body.get("loginId"), "아이디"),
        "email": require_email(body.get("email")),
        "password": require_string(body.get("password"), "비밀번호"),
        "name": require_string(body.get("name"), "이름"),
        "phone": require_string(body.get("phone"), "전화번호"),
    }


def validate_operator_signup(body: dict) -> dict:
    return {
        "loginId": require_string(body.get("loginId"), "아이디"),
        "email": require_email(body.get("email")),
        "password": require_string(body.get("password"), "비밀번호"),
        "name": require_string(body.get("name"), "대표자명"),
        "phone": require_string(body.get("phone"), "전화번호"),
        "storeName": require_string(body.get("storeName"), "스토어명"),
        "category": require_string(body.get("category"), "카테고리"),
        "description": body.get("description", "").strip() if isinstance(body.get("description"), str) else None,
        "storePhone": body.get("storePhone", "").strip() if isinstance(body.get("storePhone"), str) else None,
        "address": body.get("address", "").strip() if isinstance(body.get("address"), str) else None,
        "businessHours": body.get("businessHours", "").strip() if isinstance(body.get("businessHours"), str) else None,
    }


def validate_login(body: dict) -> dict:
    return {
        "loginId": require_string(body.get("loginId"), "아이디"),
        "password": require_string(body.get("password"), "비밀번호"),
    }


def validate_refresh(body: dict) -> dict:
    return {
        "refreshToken": require_string(body.get("refreshToken"), "리프레시 토큰"),
    }
