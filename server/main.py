from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth import get_me, login, logout, refresh_auth, signup_customer, signup_operator
from app.config import settings
from app.database import test_database_connection
from app.exceptions import AppError
from app.security import verify_access_token
from app.validation import (
    validate_customer_signup,
    validate_login,
    validate_operator_signup,
    validate_refresh,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    test_database_connection()
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
