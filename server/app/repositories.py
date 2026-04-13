from __future__ import annotations


def find_user_by_login_id(connection, login_id: str):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, login_id, email, password_hash, name, phone, role, status, created_at, updated_at
            FROM app_user
            WHERE login_id = %s
            LIMIT 1
            """,
            (login_id,),
        )
        return cursor.fetchone()


def find_user_by_email(connection, email: str):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, login_id, email, password_hash, name, phone, role, status, created_at, updated_at
            FROM app_user
            WHERE email = %s
            LIMIT 1
            """,
            (email,),
        )
        return cursor.fetchone()


def find_user_by_id(connection, user_id: int):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, login_id, email, name, phone, role, status, created_at, updated_at
            FROM app_user
            WHERE id = %s
            LIMIT 1
            """,
            (user_id,),
        )
        return cursor.fetchone()


def create_user(connection, user: dict):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO app_user (login_id, email, password_hash, name, phone, role, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'ACTIVE')
            """,
            (
                user["loginId"],
                user["email"],
                user["passwordHash"],
                user["name"],
                user["phone"],
                user["role"],
            ),
        )
        return cursor.lastrowid


def create_store(connection, store: dict):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO store (
              owner_user_id,
              name,
              category,
              description,
              phone,
              address,
              business_hours,
              status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'ACTIVE')
            """,
            (
                store["ownerUserId"],
                store["name"],
                store["category"],
                store["description"],
                store["phone"],
                store["address"],
                store["businessHours"],
            ),
        )
        return cursor.lastrowid


def find_store_by_owner_user_id(connection, owner_user_id: int):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, owner_user_id, name, category, description, phone, address, business_hours, status
            FROM store
            WHERE owner_user_id = %s
            LIMIT 1
            """,
            (owner_user_id,),
        )
        return cursor.fetchone()


def create_refresh_token_record(connection, payload: dict):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO refresh_token (user_id, token, expires_at)
            VALUES (%s, %s, %s)
            """,
            (payload["userId"], payload["token"], payload["expiresAt"]),
        )
        return cursor.lastrowid


def find_active_refresh_token(connection, token: str):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, user_id, token, expires_at, created_at, revoked_at
            FROM refresh_token
            WHERE token = %s
              AND revoked_at IS NULL
            LIMIT 1
            """,
            (token,),
        )
        return cursor.fetchone()


def revoke_refresh_token(connection, token: str):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE refresh_token
            SET revoked_at = CURRENT_TIMESTAMP
            WHERE token = %s
              AND revoked_at IS NULL
            """,
            (token,),
        )


def revoke_all_refresh_tokens_for_user(connection, user_id: int):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE refresh_token
            SET revoked_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
              AND revoked_at IS NULL
            """,
            (user_id,),
        )
