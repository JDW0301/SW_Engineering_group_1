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


def validate_customer_profile_update(body: dict) -> dict:
    return {
        "name": require_string(body.get("name"), "이름"),
        "phone": require_string(body.get("phone"), "전화번호"),
        "email": require_email(body.get("email")),
    }


def validate_refresh(body: dict) -> dict:
    return {
        "refreshToken": require_string(body.get("refreshToken"), "리프레시 토큰"),
    }


def optional_string(value) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value.strip() or None
    return None


def validate_operator_store_update(body: dict) -> dict:
    return {
        "name": require_string(body.get("storeName"), "스토어명"),
        "phone": optional_string(body.get("storePhone")),
        "address": optional_string(body.get("address")),
        "businessHours": optional_string(body.get("businessHours")),
        "description": optional_string(body.get("description")),
    }


def optional_int(value, field_name: str) -> int | None:
    if value is None or value == "":
        return None
    if isinstance(value, int):
        return value
    raise AppError(400, f"{field_name} 형식이 올바르지 않습니다.")


def require_int(value, field_name: str) -> int:
    if isinstance(value, int):
        return value
    raise AppError(400, f"{field_name}은(는) 필수입니다.")


def validate_inquiry_create(body: dict) -> dict:
    content = require_string(body.get("content"), "본문")
    title = optional_string(body.get("title")) or f"{content[:20]}..."
    is_secret = body.get("isSecret", False)
    return {
        "storeId": require_int(body.get("storeId"), "스토어"),
        "title": title[:200],
        "content": content,
        "orderId": optional_int(body.get("orderId"), "주문"),
        "isSecret": bool(is_secret),
        "image": optional_string(body.get("image")),
    }


def validate_inquiry_update(body: dict) -> dict:
    content = require_string(body.get("content"), "본문")
    title = optional_string(body.get("title")) or f"{content[:20]}..."
    is_secret = body.get("isSecret", False)
    return {
        "title": title[:200],
        "content": content,
        "orderId": optional_int(body.get("orderId"), "주문"),
        "isSecret": bool(is_secret),
        "image": optional_string(body.get("image")),
    }


def validate_support_session_create(body: dict) -> dict:
    messages = body.get("initialMessages", [])
    if not isinstance(messages, list):
        messages = []
    return {
        "storeId": require_int(body.get("storeId"), "스토어"),
        "orderId": optional_int(body.get("orderId"), "주문"),
        "initialMessages": [
            {
                "sender": optional_string(message.get("sender")) or "SYSTEM",
                "content": require_string(message.get("content"), "메시지"),
            }
            for message in messages
            if isinstance(message, dict) and optional_string(message.get("content"))
        ],
    }


def validate_support_message_create(body: dict) -> dict:
    return {"content": require_string(body.get("content"), "메시지")}


def validate_support_status_update(body: dict) -> dict:
    status = require_string(body.get("status"), "상태")
    if status not in {"OPEN", "IN_PROGRESS", "RESOLVED", "EXPIRED"}:
        raise AppError(400, "상태 형식이 올바르지 않습니다.")
    return {"status": status}


def validate_inquiry_reply_create(body: dict) -> dict:
    return {"content": require_string(body.get("content"), "답변")}


def validate_internal_note_create(body: dict) -> dict:
    return {
        "supportSessionId": optional_int(body.get("supportSessionId"), "상담"),
        "inquiryPostId": optional_int(body.get("inquiryPostId"), "문의"),
        "content": require_string(body.get("content"), "메모"),
    }


def validate_ai_summary_save(body: dict) -> dict:
    return {"summaryText": require_string(body.get("summaryText"), "요약")}


def validate_preset_save(body: dict) -> dict:
    raw_presets = body.get("presets", [])
    if not isinstance(raw_presets, list):
        raw_presets = []
    presets = []
    for preset in raw_presets:
        if not isinstance(preset, dict):
            continue
        title = optional_string(preset.get("title"))
        content = optional_string(preset.get("content"))
        if title and content:
            presets.append({"title": title[:150], "content": content})
    return {"presets": presets}


def validate_faq_save(body: dict) -> dict:
    raw_faqs = body.get("faqs", [])
    if not isinstance(raw_faqs, list):
        raw_faqs = []
    faqs = []
    for faq in raw_faqs:
        if not isinstance(faq, dict):
            continue
        question = optional_string(faq.get("question"))
        answer = optional_string(faq.get("answer"))
        if question and answer:
            faqs.append({"question": question[:150], "answer": answer})
    return {"faqs": faqs}


def validate_knowledge_file_create(body: dict) -> dict:
    file_name = require_string(body.get("fileName"), "파일명")
    return {
        "fileName": file_name[:255],
        "fileUrl": optional_string(body.get("fileUrl")),
        "fileContent": optional_string(body.get("fileContent")),
    }
