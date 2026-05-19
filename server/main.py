from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from app.ai_client import get_ai_health, post_ai_json, stream_ai_chatbot
from app.auth import get_me, login, logout, refresh_auth, signup_customer, signup_operator
from app.config import settings
from app.customer_home import ensure_demo_customer_home_data, get_customer_home
from app.database import test_database_connection
from app.exceptions import AppError
from app.inquiries import create_inquiry, list_my_inquiries, list_operator_inquiries, list_store_inquiries
from app.faqs import list_store_faqs
from app.operator import update_operator_store
from app.security import verify_access_token
from app.support import create_support_message, create_support_session, list_customer_support, list_operator_support, list_support_messages, update_support_status
from app.operator_workspace import (
    create_inquiry_reply,
    create_internal_note,
    create_knowledge_file,
    delete_knowledge_file,
    ensure_operator_workspace_tables,
    get_operator_workspace,
    list_operator_settings,
    save_operator_presets,
)
from app.validation import (
    validate_customer_signup,
    validate_login,
    validate_inquiry_create,
    validate_operator_store_update,
    validate_operator_signup,
    validate_refresh,
    validate_inquiry_reply_create,
    validate_internal_note_create,
    validate_knowledge_file_create,
    validate_preset_save,
    validate_support_message_create,
    validate_support_session_create,
    validate_support_status_update,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    test_database_connection()
    ensure_operator_workspace_tables()
    ensure_demo_customer_home_data()
    print(f"Server running on port {settings.port}")
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_origin],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, error: AppError):
    return JSONResponse(
        status_code=error.status_code,
        content={
            "message": error.message,
            "details": error.details,
        },
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, error: Exception):
    print(error)
    return JSONResponse(status_code=500, content={"message": "서버 내부 오류가 발생했습니다."})


def get_auth_payload(authorization: str | None = Header(default=None)) -> dict:
    if authorization is None or not authorization.startswith("Bearer "):
        raise AppError(401, "로그인이 필요합니다.")
    token = authorization[len("Bearer ") :]
    return verify_access_token(token)


@app.get("/api/health")
async def health():
    return {"message": "ok"}


@app.post("/api/auth/signup/customer", status_code=201)
async def signup_customer_endpoint(body: dict):
    payload = validate_customer_signup(body)
    user = signup_customer(payload)
    return {"message": "이용자 회원가입이 완료되었습니다.", "user": user}


@app.post("/api/auth/signup/operator", status_code=201)
async def signup_operator_endpoint(body: dict):
    payload = validate_operator_signup(body)
    user = signup_operator(payload)
    return {"message": "관리자 회원가입이 완료되었습니다.", "user": user}


@app.post("/api/auth/login")
async def login_endpoint(body: dict):
    payload = validate_login(body)
    return login(payload)


@app.post("/api/auth/refresh")
async def refresh_endpoint(body: dict):
    payload = validate_refresh(body)
    return refresh_auth(payload["refreshToken"])


@app.post("/api/auth/logout")
async def logout_endpoint(body: dict):
    payload = validate_refresh(body)
    logout(payload["refreshToken"])
    return {"message": "로그아웃되었습니다."}


@app.get("/api/auth/me")
async def me_endpoint(auth: dict = Depends(get_auth_payload)):
    return {"user": get_me(int(auth["sub"]))}


@app.get("/api/customer/home")
async def customer_home_endpoint(auth: dict = Depends(get_auth_payload)):
    return get_customer_home(int(auth["sub"]))


@app.patch("/api/operator/store")
async def update_operator_store_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_operator_store_update(body)
    return {"store": update_operator_store(int(auth["sub"]), payload)}


@app.get("/api/stores/{store_id}/faqs")
async def list_store_faqs_endpoint(store_id: int, auth: dict = Depends(get_auth_payload)):
    return {"faqs": list_store_faqs(store_id)}


@app.get("/api/inquiries")
async def list_inquiries_endpoint(storeId: int | None = Query(default=None), auth: dict = Depends(get_auth_payload)):
    if storeId is None:
        return {"inquiries": list_my_inquiries(int(auth["sub"]))}
    return {"inquiries": list_store_inquiries(storeId)}


@app.post("/api/inquiries", status_code=201)
async def create_inquiry_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_inquiry_create(body)
    return {"inquiry": create_inquiry(int(auth["sub"]), payload)}


@app.get("/api/operator/inquiries")
async def list_operator_inquiries_endpoint(auth: dict = Depends(get_auth_payload)):
    return {"inquiries": list_operator_inquiries(int(auth["sub"]))}


@app.get("/api/support-sessions")
async def list_customer_support_endpoint(auth: dict = Depends(get_auth_payload)):
    return list_customer_support(int(auth["sub"]))


@app.post("/api/support-sessions", status_code=201)
async def create_support_session_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_support_session_create(body)
    return {"supportSession": create_support_session(int(auth["sub"]), payload)}


@app.post("/api/support-sessions/{session_id}/messages", status_code=201)
async def create_support_message_endpoint(session_id: int, body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_support_message_create(body)
    return {"message": create_support_message(int(auth["sub"]), session_id, payload)}


@app.get("/api/support-sessions/{session_id}/messages")
async def list_support_messages_endpoint(session_id: int, auth: dict = Depends(get_auth_payload)):
    return {"messages": list_support_messages(int(auth["sub"]), session_id)}


@app.patch("/api/support-sessions/{session_id}/status")
async def update_support_status_endpoint(session_id: int, body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_support_status_update(body)
    return {"supportSession": update_support_status(int(auth["sub"]), session_id, payload)}


@app.get("/api/operator/workspace")
async def operator_workspace_endpoint(auth: dict = Depends(get_auth_payload)):
    workspace = get_operator_workspace(int(auth["sub"]))
    support = list_operator_support(int(auth["sub"]))
    return {**workspace, **support}


@app.post("/api/operator/inquiries/{inquiry_id}/replies", status_code=201)
async def create_operator_inquiry_reply_endpoint(inquiry_id: int, body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_inquiry_reply_create(body)
    return {"reply": create_inquiry_reply(int(auth["sub"]), inquiry_id, payload)}


@app.post("/api/operator/notes", status_code=201)
async def create_operator_note_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_internal_note_create(body)
    return {"note": create_internal_note(int(auth["sub"]), payload)}


@app.get("/api/operator/settings")
async def operator_settings_endpoint(auth: dict = Depends(get_auth_payload)):
    return list_operator_settings(int(auth["sub"]))


@app.put("/api/operator/settings/presets")
async def save_operator_presets_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_preset_save(body)
    return {"presets": save_operator_presets(int(auth["sub"]), payload)}


@app.post("/api/operator/settings/files", status_code=201)
async def create_operator_file_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    payload = validate_knowledge_file_create(body)
    return {"file": create_knowledge_file(int(auth["sub"]), payload)}


@app.delete("/api/operator/settings/files/{file_id}")
async def delete_operator_file_endpoint(file_id: int, auth: dict = Depends(get_auth_payload)):
    delete_knowledge_file(int(auth["sub"]), file_id)
    return {"message": "파일이 삭제되었습니다."}


@app.get("/api/ai/health")
async def ai_health_endpoint():
    return get_ai_health()


@app.post("/api/ai/detect")
async def ai_detect_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    return post_ai_json("/detect", body, timeout=10)


@app.post("/api/ai/neutralize")
async def ai_neutralize_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    return post_ai_json("/neutralize", body, timeout=10)


@app.post("/api/ai/classify")
async def ai_classify_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    return post_ai_json("/classify", body, timeout=20)


@app.post("/api/ai/chatbot")
async def ai_chatbot_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    return post_ai_json("/chatbot", body, timeout=30)


@app.post("/api/ai/chatbot/stream")
async def ai_chatbot_stream_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    return StreamingResponse(stream_ai_chatbot(body), media_type="text/event-stream")


@app.post("/api/ai/summarize")
async def ai_summarize_endpoint(body: dict, auth: dict = Depends(get_auth_payload)):
    return post_ai_json("/summarize", body, timeout=30)
