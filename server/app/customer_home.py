from __future__ import annotations

from decimal import Decimal

from .database import db_connection
from .exceptions import AppError
from .security import hash_password


DEMO_CUSTOMER = {
    "login_id": "customer01",
    "email": "customer01@example.com",
    "name": "customer01",
    "phone": "010-1234-5678",
    "password": "1234",
}

DEMO_OPERATOR = {
    "login_id": "operator01",
    "email": "operator01@example.com",
    "name": "관리자01",
    "phone": "010-1111-2222",
    "password": "1234",
}

DEMO_STORES = [
    {
        "key": "fashion-lumi",
        "name": "패션스토어 루미",
        "category": "의류",
        "description": "트렌디한 의류 전문 스토어",
        "phone": "02-1234-5678",
        "address": "서울시 강남구 역삼동 123-4",
        "business_hours": "평일 09:00 ~ 18:00",
        "product_name": "봄 자켓",
        "price": 132000,
    },
    {
        "key": "bakery",
        "name": "맛있는 빵집",
        "category": "음식",
        "description": "수제 빵과 디저트",
        "phone": "02-9876-5432",
        "address": "서울시 마포구 합정동 56-7",
        "business_hours": "매일 08:00 ~ 22:00",
        "product_name": "티라미수 2호",
        "price": 35000,
    },
    {
        "key": "techzone",
        "name": "테크존 전자",
        "category": "전자기기",
        "description": "가전/IT 기기 전문",
        "phone": "031-555-1234",
        "address": "경기도 성남시 분당구 정자동 89",
        "business_hours": "평일 10:00 ~ 19:00",
        "product_name": "웹캠 HD",
        "price": 67000,
    },
    {
        "key": "greenlife",
        "name": "그린라이프 마트",
        "category": "생활용품",
        "description": "친환경 생활용품 전문",
        "phone": "02-333-4444",
        "address": "서울시 송파구 잠실동 200",
        "business_hours": "매일 10:00 ~ 21:00",
        "product_name": "에코백 (내추럴)",
        "price": 22000,
    },
    {
        "key": "bookcafe",
        "name": "북카페 서랍",
        "category": "기타",
        "description": "책과 커피가 있는 공간",
        "phone": "02-777-8888",
        "address": "서울시 종로구 삼청동 33",
        "business_hours": "화~일 11:00 ~ 20:00",
        "product_name": "텀블러 350ml",
        "price": 32000,
    },
]

DEMO_ORDERS = [
    {
        "store_key": "greenlife",
        "order_number": "ORD-2026-025",
        "ordered_at": "2026-04-04 14:00:00",
        "quantity": 2,
        "total_price": 22000,
    },
    {
        "store_key": "techzone",
        "order_number": "ORD-2026-027",
        "ordered_at": "2026-04-06 16:00:00",
        "quantity": 1,
        "total_price": 67000,
    },
    {
        "store_key": "bakery",
        "order_number": "ORD-2026-028",
        "ordered_at": "2026-04-07 10:00:00",
        "quantity": 1,
        "total_price": 35000,
    },
    {
        "store_key": "fashion-lumi",
        "order_number": "ORD-2026-029",
        "ordered_at": "2026-04-08 15:00:00",
        "quantity": 1,
        "total_price": 132000,
    },
    {
        "store_key": "bookcafe",
        "order_number": "ORD-2026-030",
        "ordered_at": "2026-04-09 08:00:00",
        "quantity": 1,
        "total_price": 32000,
    },
]

DEMO_SUPPORT_SESSIONS = [
    {
        "store_key": "bookcafe",
        "order_number": "ORD-2026-030",
        "status": "IN_PROGRESS",
        "created_at": "2026-04-09 08:00:00",
        "last_message_at": "2026-04-09 08:00:00",
        "messages": [
            {"sender": "CUSTOMER", "content": "텀블러 보온 성능 문의", "created_at": "2026-04-09 08:00:00"},
        ],
    },
    {
        "store_key": "bakery",
        "order_number": "ORD-2026-028",
        "status": "RESOLVED",
        "created_at": "2026-04-07 08:30:00",
        "last_message_at": "2026-04-07 10:00:00",
        "messages": [
            {"sender": "CUSTOMER", "content": "티라미수 주문 수량 변경", "created_at": "2026-04-07 08:30:00"},
            {"sender": "OPERATOR", "content": "이미 제조에 들어가서 추가 주문은 별도로 넣어주셔야 합니다.", "created_at": "2026-04-07 10:00:00"},
        ],
    },
    {
        "store_key": "techzone",
        "order_number": "ORD-2026-027",
        "status": "IN_PROGRESS",
        "created_at": "2026-04-06 15:30:00",
        "last_message_at": "2026-04-08 16:00:00",
        "messages": [
            {"sender": "CUSTOMER", "content": "웹캠 화질이 너무 어두워요", "created_at": "2026-04-06 15:30:00"},
            {"sender": "OPERATOR", "content": "조명과 드라이버를 먼저 점검해 주세요.", "created_at": "2026-04-06 16:00:00"},
            {"sender": "CUSTOMER", "content": "드라이버 업데이트 후에도 조금 어둡습니다.", "created_at": "2026-04-08 16:00:00"},
        ],
    },
    {
        "store_key": "fashion-lumi",
        "order_number": "ORD-2026-029",
        "status": "IN_PROGRESS",
        "created_at": "2026-04-08 14:30:00",
        "last_message_at": "2026-04-08 15:10:00",
        "messages": [
            {"sender": "CUSTOMER", "content": "봄 자켓 사이즈 상담", "created_at": "2026-04-08 14:30:00"},
            {"sender": "OPERATOR", "content": "평소보다 한 치수 크게 입는 느낌이라면 M 사이즈를 권장드립니다.", "created_at": "2026-04-08 15:10:00"},
        ],
    },
]

DEMO_INQUIRY_POSTS = [
    {
        "store_key": "fashion-lumi",
        "order_number": "ORD-2026-029",
        "title": "봄 자켓 소재 정보 요청",
        "content": "봄 자켓 소재가 무엇인지, 세탁기 사용 가능한지 궁금합니다.",
        "status": "OPEN",
        "created_at": "2026-04-08 15:00:00",
        "reply": None,
    },
    {
        "store_key": "greenlife",
        "order_number": "ORD-2026-025",
        "title": "에코백 색상 변경 요청",
        "content": "내추럴 색상을 주문했는데 차콜로 변경 가능한지 문의드립니다.",
        "status": "ANSWERED",
        "created_at": "2026-04-05 11:00:00",
        "reply": {"content": "아직 발송 전이라 차콜 색상으로 변경 처리해드렸습니다.", "created_at": "2026-04-05 14:00:00"},
    },
    {
        "store_key": "techzone",
        "order_number": "ORD-2026-027",
        "title": "웹캠 설치 드라이버 문의",
        "content": "웹캠 드라이버는 어디에서 내려받을 수 있나요? 설치 링크가 필요합니다.",
        "status": "OPEN",
        "created_at": "2026-04-06 13:00:00",
        "reply": None,
    },
    {
        "store_key": "bookcafe",
        "order_number": "ORD-2026-030",
        "title": "텀블러 식기세척기 사용 여부",
        "content": "텀블러를 식기세척기에 넣어도 되는지 확인 부탁드립니다.",
        "status": "ANSWERED",
        "created_at": "2026-04-09 07:40:00",
        "reply": {"content": "코팅 손상을 막기 위해 손세척을 권장드립니다.", "created_at": "2026-04-09 07:55:00"},
    },
]


def ensure_demo_customer_home_data() -> None:
    with db_connection() as connection:
        try:
            customer_id = _ensure_user(connection, DEMO_CUSTOMER, "CUSTOMER")
            operator_id = _ensure_user(connection, DEMO_OPERATOR, "OPERATOR")

            store_ids = {}
            product_ids = {}
            for store in DEMO_STORES:
                store_id = _ensure_store(connection, operator_id, store)
                store_ids[store["key"]] = store_id
                product_ids[store["key"]] = _ensure_product(connection, store_id, store)

            order_ids = {}
            for order in DEMO_ORDERS:
                order_id = _ensure_order(connection, customer_id, store_ids[order["store_key"]], order)
                order_ids[order["order_number"]] = order_id
                _ensure_order_item(connection, order_id, product_ids[order["store_key"]], order)

            for session in DEMO_SUPPORT_SESSIONS:
                session_id = _ensure_support_session(
                    connection,
                    store_ids[session["store_key"]],
                    customer_id,
                    operator_id,
                    order_ids[session["order_number"]],
                    session,
                )
                for message in session["messages"]:
                    _ensure_support_message(connection, session_id, customer_id, operator_id, message)

            for post in DEMO_INQUIRY_POSTS:
                post_id = _ensure_inquiry_post(
                    connection,
                    store_ids[post["store_key"]],
                    customer_id,
                    order_ids[post["order_number"]],
                    post,
                )
                if post["reply"]:
                    _ensure_inquiry_reply(connection, post_id, operator_id, post["reply"])

            connection.commit()
        except Exception:
            connection.rollback()
            raise


def get_customer_home(user_id: int) -> dict:
    with db_connection() as connection:
        user = _find_user_by_id(connection, user_id)
        if not user:
            raise AppError(404, "사용자를 찾을 수 없습니다.")
        if user["role"] != "CUSTOMER":
            raise AppError(403, "이용자 계정만 접근할 수 있습니다.")

        orders = _fetch_orders(connection, user_id)
        stores = _fetch_ordered_stores(connection, user_id)
        inquiries = _fetch_support_inquiries(connection, user) + _fetch_board_inquiries(connection, user)
        return {
            "orders": orders,
            "stores": stores,
            "inquiries": sorted(inquiries, key=lambda item: item["lastMessageAt"], reverse=True),
        }


def _find_user_by_login_id(connection, login_id: str):
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, login_id, email, name, phone, role FROM app_user WHERE login_id = %s LIMIT 1", (login_id,))
        return cursor.fetchone()


def _find_user_by_id(connection, user_id: int):
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, login_id, email, name, phone, role FROM app_user WHERE id = %s LIMIT 1", (user_id,))
        return cursor.fetchone()


def _ensure_user(connection, user: dict, role: str) -> int:
    existing = _find_user_by_login_id(connection, user["login_id"])
    if existing:
        return existing["id"]

    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO app_user (login_id, email, password_hash, name, phone, role, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'ACTIVE')
            """,
            (user["login_id"], user["email"], hash_password(user["password"]), user["name"], user["phone"], role),
        )
        return cursor.lastrowid


def _ensure_store(connection, owner_user_id: int, store: dict) -> int:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id
            FROM store
            WHERE owner_user_id = %s AND name = %s
            LIMIT 1
            """,
            (owner_user_id, store["name"]),
        )
        existing = cursor.fetchone()
        if existing:
            return existing["id"]

        cursor.execute(
            """
            INSERT INTO store (owner_user_id, name, category, description, phone, address, business_hours, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'ACTIVE')
            """,
            (
                owner_user_id,
                store["name"],
                store["category"],
                store["description"],
                store["phone"],
                store["address"],
                store["business_hours"],
            ),
        )
        return cursor.lastrowid


def _ensure_product(connection, store_id: int, store: dict) -> int:
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id FROM product WHERE store_id = %s AND name = %s LIMIT 1",
            (store_id, store["product_name"]),
        )
        existing = cursor.fetchone()
        if existing:
            return existing["id"]

        cursor.execute(
            """
            INSERT INTO product (store_id, name, description, price, status)
            VALUES (%s, %s, %s, %s, 'ACTIVE')
            """,
            (store_id, store["product_name"], f"{store['name']} 대표 상품", store["price"]),
        )
        return cursor.lastrowid


def _ensure_order(connection, user_id: int, store_id: int, order: dict) -> int:
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM order_table WHERE order_number = %s LIMIT 1", (order["order_number"],))
        existing = cursor.fetchone()
        if existing:
            return existing["id"]

        cursor.execute(
            """
            INSERT INTO order_table (user_id, store_id, order_number, total_price, order_status, ordered_at)
            VALUES (%s, %s, %s, %s, 'DELIVERED', %s)
            """,
            (user_id, store_id, order["order_number"], order["total_price"], order["ordered_at"]),
        )
        return cursor.lastrowid


def _ensure_order_item(connection, order_id: int, product_id: int, order: dict) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id FROM order_item WHERE order_id = %s AND product_id = %s LIMIT 1",
            (order_id, product_id),
        )
        if cursor.fetchone():
            return

        unit_price = Decimal(str(order["total_price"])) / Decimal(str(order["quantity"]))
        cursor.execute(
            """
            INSERT INTO order_item (order_id, product_id, quantity, unit_price)
            VALUES (%s, %s, %s, %s)
            """,
            (order_id, product_id, order["quantity"], unit_price),
        )


def _ensure_support_session(connection, store_id: int, customer_user_id: int, operator_user_id: int, order_id: int, session: dict) -> int:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id
            FROM support_session
            WHERE customer_user_id = %s AND order_id = %s
            LIMIT 1
            """,
            (customer_user_id, order_id),
        )
        existing = cursor.fetchone()
        if existing:
            return existing["id"]

        cursor.execute(
            """
            INSERT INTO support_session (
              store_id,
              customer_user_id,
              operator_user_id,
              order_id,
              session_type,
              support_status,
              created_at,
              last_message_at
            )
            VALUES (%s, %s, %s, %s, 'ORDER', %s, %s, %s)
            """,
            (
                store_id,
                customer_user_id,
                operator_user_id,
                order_id,
                session["status"],
                session["created_at"],
                session["last_message_at"],
            ),
        )
        return cursor.lastrowid


def _ensure_support_message(connection, support_session_id: int, customer_user_id: int, operator_user_id: int, message: dict) -> None:
    sender_user_id = None
    if message["sender"] == "CUSTOMER":
        sender_user_id = customer_user_id
    elif message["sender"] == "OPERATOR":
        sender_user_id = operator_user_id

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id
            FROM support_message
            WHERE support_session_id = %s AND sender_type = %s AND content = %s
            LIMIT 1
            """,
            (support_session_id, message["sender"], message["content"]),
        )
        if cursor.fetchone():
            return

        cursor.execute(
            """
            INSERT INTO support_message (support_session_id, sender_user_id, sender_type, content, created_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (support_session_id, sender_user_id, message["sender"], message["content"], message["created_at"]),
        )


def _ensure_inquiry_post(connection, store_id: int, author_user_id: int, order_id: int, post: dict) -> int:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id
            FROM inquiry_post
            WHERE author_user_id = %s AND order_id = %s AND title = %s
            LIMIT 1
            """,
            (author_user_id, order_id, post["title"]),
        )
        existing = cursor.fetchone()
        if existing:
            return existing["id"]

        cursor.execute(
            """
            INSERT INTO inquiry_post (store_id, author_user_id, order_id, title, content, is_secret, inquiry_status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, FALSE, %s, %s, %s)
            """,
            (store_id, author_user_id, order_id, post["title"], post["content"], post["status"], post["created_at"], post["created_at"]),
        )
        return cursor.lastrowid


def _ensure_inquiry_reply(connection, inquiry_post_id: int, author_user_id: int, reply: dict) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id FROM inquiry_post_reply WHERE inquiry_post_id = %s AND content = %s LIMIT 1",
            (inquiry_post_id, reply["content"]),
        )
        if cursor.fetchone():
            return

        cursor.execute(
            """
            INSERT INTO inquiry_post_reply (inquiry_post_id, author_user_id, content, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (inquiry_post_id, author_user_id, reply["content"], reply["created_at"], reply["created_at"]),
        )


def _fetch_orders(connection, user_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
              o.id,
              o.store_id,
              s.name AS store_name,
              o.order_number,
              first_item.product_name,
              first_item.quantity,
              o.total_price,
              o.ordered_at,
              u.name AS customer_name,
              u.phone AS customer_phone
            FROM order_table o
            JOIN store s ON s.id = o.store_id
            JOIN (
              SELECT oi.order_id, oi.quantity, p.name AS product_name
              FROM order_item oi
              JOIN product p ON p.id = oi.product_id
              JOIN (
                SELECT order_id, MIN(id) AS first_item_id
                FROM order_item
                GROUP BY order_id
              ) first_order_item ON first_order_item.first_item_id = oi.id
            ) first_item ON first_item.order_id = o.id
            JOIN app_user u ON u.id = o.user_id
            WHERE o.user_id = %s
            ORDER BY o.ordered_at DESC
            """,
            (user_id,),
        )
        rows = cursor.fetchall()

    return [
        {
            "id": row["id"],
            "storeId": row["store_id"],
            "storeName": row["store_name"],
            "orderNumber": row["order_number"],
            "productName": row["product_name"],
            "quantity": row["quantity"],
            "totalPrice": int(row["total_price"]),
            "orderedAt": _format_date(row["ordered_at"], date_only=True),
            "customerName": row["customer_name"],
            "phone": row["customer_phone"],
        }
        for row in rows
    ]


def _fetch_ordered_stores(connection, user_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
              s.id,
              s.name,
              s.category,
              s.phone,
              s.address,
              s.description,
              s.business_hours,
              MAX(o.ordered_at) AS latest_ordered_at
            FROM store s
            JOIN order_table o ON o.store_id = s.id
            WHERE o.user_id = %s
            GROUP BY s.id, s.name, s.category, s.phone, s.address, s.description, s.business_hours
            ORDER BY latest_ordered_at DESC
            """,
            (user_id,),
        )
        rows = cursor.fetchall()

    return [
        {
            "id": row["id"],
            "name": row["name"],
            "category": row["category"],
            "phone": row["phone"],
            "address": row["address"],
            "desc": row["description"],
            "operatingHours": row["business_hours"],
            "image": None,
            "banner": None,
        }
        for row in rows
    ]


def _fetch_support_inquiries(connection, user: dict) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
              ss.id,
              ss.store_id,
              s.name AS store_name,
              ss.order_id,
              ss.support_status,
              ss.created_at,
              COALESCE(ss.last_message_at, ss.created_at) AS last_message_at
            FROM support_session ss
            JOIN store s ON s.id = ss.store_id
            WHERE ss.customer_user_id = %s
            ORDER BY COALESCE(ss.last_message_at, ss.created_at) DESC
            """,
            (user["id"],),
        )
        sessions = cursor.fetchall()

    inquiries = []
    for session in sessions:
        messages = _fetch_support_messages(connection, session["id"])
        order_meta = _fetch_order_meta(connection, session["order_id"], user)
        title = messages[0]["content"] if messages else "일반 상담"
        inquiries.append(
            {
                "id": f"support-{session['id']}",
                "storeId": session["store_id"],
                "storeName": session["store_name"],
                "type": "상담",
                "status": session["support_status"],
                "title": title,
                "orderId": session["order_id"],
                "createdAt": _format_date(session["created_at"]),
                "lastMessageAt": _format_date(session["last_message_at"]),
                "messages": messages,
                "orderInfo": order_meta["orderInfo"],
                "orderProductName": order_meta["productName"],
                "customerName": order_meta["customerName"],
            }
        )
    return inquiries


def _fetch_support_messages(connection, session_id: int) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT sender_type, content, created_at
            FROM support_message
            WHERE support_session_id = %s
            ORDER BY created_at ASC, id ASC
            """,
            (session_id,),
        )
        rows = cursor.fetchall()

    sender_map = {"CUSTOMER": "customer", "OPERATOR": "operator", "SYSTEM": "system"}
    return [
        {
            "id": index + 1,
            "sender": sender_map.get(row["sender_type"], "system"),
            "content": row["content"],
            "time": _format_date(row["created_at"]),
        }
        for index, row in enumerate(rows)
    ]


def _fetch_board_inquiries(connection, user: dict) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
              ip.id,
              ip.store_id,
              s.name AS store_name,
              ip.order_id,
              ip.title,
              ip.content,
              ip.inquiry_status,
              ip.created_at,
              COALESCE(MAX(ipr.created_at), ip.created_at) AS last_message_at
            FROM inquiry_post ip
            JOIN store s ON s.id = ip.store_id
            LEFT JOIN inquiry_post_reply ipr ON ipr.inquiry_post_id = ip.id
            WHERE ip.author_user_id = %s
            GROUP BY ip.id, ip.store_id, s.name, ip.order_id, ip.title, ip.content, ip.inquiry_status, ip.created_at
            ORDER BY last_message_at DESC
            """,
            (user["id"],),
        )
        posts = cursor.fetchall()

    inquiries = []
    for post in posts:
        messages = [
            {
                "id": 1,
                "sender": "customer",
                "content": post["content"],
                "time": _format_date(post["created_at"]),
            }
        ]
        reply = _fetch_inquiry_reply(connection, post["id"])
        if reply:
            messages.append(
                {
                    "id": 2,
                    "sender": "operator",
                    "content": reply["content"],
                    "time": _format_date(reply["created_at"]),
                }
            )

        order_meta = _fetch_order_meta(connection, post["order_id"], user)
        inquiries.append(
            {
                "id": f"post-{post['id']}",
                "storeId": post["store_id"],
                "storeName": post["store_name"],
                "type": "문의",
                "status": "RESOLVED" if post["inquiry_status"] in {"ANSWERED", "CLOSED"} else "IN_PROGRESS",
                "title": post["title"],
                "orderId": post["order_id"],
                "createdAt": _format_date(post["created_at"]),
                "lastMessageAt": _format_date(post["last_message_at"]),
                "messages": messages,
                "orderInfo": order_meta["orderInfo"],
                "orderProductName": order_meta["productName"],
                "customerName": order_meta["customerName"],
            }
        )
    return inquiries


def _fetch_inquiry_reply(connection, inquiry_post_id: int):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT content, created_at
            FROM inquiry_post_reply
            WHERE inquiry_post_id = %s
            ORDER BY created_at ASC, id ASC
            LIMIT 1
            """,
            (inquiry_post_id,),
        )
        return cursor.fetchone()


def _fetch_order_meta(connection, order_id: int | None, user: dict) -> dict:
    if order_id is None:
        return {"orderInfo": None, "productName": None, "customerName": user["name"]}

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT o.order_number, first_item.product_name
            FROM order_table o
            JOIN (
              SELECT oi.order_id, p.name AS product_name
              FROM order_item oi
              JOIN product p ON p.id = oi.product_id
              JOIN (
                SELECT order_id, MIN(id) AS first_item_id
                FROM order_item
                GROUP BY order_id
              ) first_order_item ON first_order_item.first_item_id = oi.id
            ) first_item ON first_item.order_id = o.id
            WHERE o.id = %s
            LIMIT 1
            """,
            (order_id,),
        )
        row = cursor.fetchone()

    if not row:
        return {"orderInfo": None, "productName": None, "customerName": user["name"]}

    return {
        "orderInfo": f"{row['product_name']} ({row['order_number']})",
        "productName": row["product_name"],
        "customerName": user["name"],
    }


def _format_date(value, date_only: bool = False) -> str | None:
    if value is None:
        return None
    return value.strftime("%Y-%m-%d" if date_only else "%Y-%m-%d %H:%M")
