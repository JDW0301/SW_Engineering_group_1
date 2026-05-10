from __future__ import annotations

import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .config import settings
from .exceptions import AppError


JSON_HEADERS = {"Content-Type": "application/json"}
AI_TIMEOUT_SECONDS = 30


def _build_url(path: str) -> str:
    return f"{settings.ai_base_url}{path}"


def _decode_json_response(response) -> dict:
    body = response.read().decode("utf-8")
    if body == "":
        return {}
    return json.loads(body)


def get_ai_health() -> dict:
    request = Request(_build_url("/health"), method="GET")
    try:
        with urlopen(request, timeout=10) as response:
            return _decode_json_response(response)
    except HTTPError as error:
        raise AppError(error.code, "AI 서버 상태 확인에 실패했습니다.", _read_error_details(error)) from error
    except (TimeoutError, URLError) as error:
        raise AppError(502, "AI 서버에 연결할 수 없습니다.", str(error)) from error


def post_ai_json(path: str, payload: dict, timeout: int = AI_TIMEOUT_SECONDS) -> dict:
    request = Request(
        _build_url(path),
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers=JSON_HEADERS,
        method="POST",
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            return _decode_json_response(response)
    except HTTPError as error:
        raise AppError(error.code, "AI 서버 요청이 실패했습니다.", _read_error_details(error)) from error
    except (TimeoutError, URLError) as error:
        raise AppError(502, "AI 서버에 연결할 수 없습니다.", str(error)) from error


def stream_ai_chatbot(payload: dict):
    request = Request(
        _build_url("/chatbot/stream"),
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers=JSON_HEADERS,
        method="POST",
    )
    try:
        with urlopen(request, timeout=AI_TIMEOUT_SECONDS) as response:
            while True:
                chunk = response.readline()
                if not chunk:
                    break
                yield chunk
    except HTTPError as error:
        details = _read_error_details(error)
        yield f"data: {json.dumps({'error': 'AI 서버 요청이 실패했습니다.', 'detail': details}, ensure_ascii=False)}\n\n".encode("utf-8")
    except (TimeoutError, URLError) as error:
        yield f"data: {json.dumps({'error': 'AI 서버에 연결할 수 없습니다.', 'detail': str(error)}, ensure_ascii=False)}\n\n".encode("utf-8")


def _read_error_details(error: HTTPError):
    body = error.read().decode("utf-8", errors="replace")
    if body == "":
        return None
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        return body
