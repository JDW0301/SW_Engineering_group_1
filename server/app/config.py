from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


def require_env(name: str, fallback: str | None = None) -> str:
    value = os.getenv(name, fallback)
    if value is None or value == "":
        raise RuntimeError(f"Missing environment variable: {name}")
    return value


@dataclass(frozen=True)
class DbConfig:
    host: str
    port: int
    user: str
    password: str
    database: str


@dataclass(frozen=True)
class JwtConfig:
    access_secret: str
    refresh_secret: str
    access_expires_in: str
    refresh_expires_in: str


@dataclass(frozen=True)
class Settings:
    port: int
    client_origin: str
    db: DbConfig
    jwt: JwtConfig


settings = Settings(
    port=int(os.getenv("PORT", "4000")),
    client_origin=os.getenv("CLIENT_ORIGIN", "http://localhost:5173"),
    db=DbConfig(
        host=require_env("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=require_env("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=require_env("DB_NAME", "swe_helpdesk"),
    ),
    jwt=JwtConfig(
        access_secret=require_env("JWT_ACCESS_SECRET", "change-this-access-secret"),
        refresh_secret=require_env("JWT_REFRESH_SECRET", "change-this-refresh-secret"),
        access_expires_in=os.getenv("JWT_ACCESS_EXPIRES_IN", "15m"),
        refresh_expires_in=os.getenv("JWT_REFRESH_EXPIRES_IN", "7d"),
    ),
)
