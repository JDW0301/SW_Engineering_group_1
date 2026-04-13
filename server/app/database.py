from __future__ import annotations

from contextlib import contextmanager

import pymysql
from pymysql.cursors import DictCursor

from .config import settings


def create_connection(autocommit: bool = False):
    return pymysql.connect(
        host=settings.db.host,
        port=settings.db.port,
        user=settings.db.user,
        password=settings.db.password,
        database=settings.db.database,
        autocommit=autocommit,
        cursorclass=DictCursor,
    )


@contextmanager
def db_connection(autocommit: bool = False):
    connection = create_connection(autocommit=autocommit)
    try:
        yield connection
    finally:
        connection.close()


def test_database_connection() -> None:
    with db_connection():
        return
