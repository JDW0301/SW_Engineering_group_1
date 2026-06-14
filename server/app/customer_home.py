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

DEMO_STORE_OPERATORS = {
    "fashion-lumi": DEMO_OPERATOR,
    "bakery": {
        "login_id": "operator_bakery",
        "email": "operator_bakery@example.com",
        "name": "빵집 관리자",
        "phone": "010-2222-3333",
        "password": "1234",
    },
    "techzone": {
        "login_id": "operator_techzone",
        "email": "operator_techzone@example.com",
        "name": "테크존 관리자",
        "phone": "010-3333-4444",
        "password": "1234",
    },
    "greenlife": {
        "login_id": "operator_greenlife",
        "email": "operator_greenlife@example.com",
        "name": "그린라이프 관리자",
        "phone": "010-4444-5555",
        "password": "1234",
    },
    "bookcafe": {
        "login_id": "operator_bookcafe",
        "email": "operator_bookcafe@example.com",
        "name": "북카페 관리자",
        "phone": "010-5555-6666",
        "password": "1234",
    },
    "petmate": {
        "login_id": "operator_petmate",
        "email": "operator_petmate@example.com",
        "name": "펫메이트 관리자",
        "phone": "010-6666-7777",
        "password": "1234",
    },
    "flowerday": {
        "login_id": "operator_flowerday",
        "email": "operator_flowerday@example.com",
        "name": "플라워데이 관리자",
        "phone": "010-7777-8888",
        "password": "1234",
    },
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
    {
        "key": "petmate",
        "name": "펫메이트 용품점",
        "category": "반려동물",
        "description": "반려동물 간식과 산책용품",
        "phone": "02-444-9090",
        "address": "서울시 성동구 성수동 18-2",
        "business_hours": "매일 10:00 ~ 20:00",
        "product_name": "강아지 산책 하네스",
        "price": 28000,
    },
    {
        "key": "flowerday",
        "name": "플라워데이 꽃집",
        "category": "선물",
        "description": "꽃다발과 기념일 선물",
        "phone": "02-222-1919",
        "address": "서울시 용산구 이태원동 77-1",
        "business_hours": "평일 09:30 ~ 19:30",
        "product_name": "계절 꽃다발",
        "price": 45000,
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

COMMON_DEMO_FAQ_QUESTIONS = [
    "배송은 얼마나 걸리나요?",
    "교환/반품은 어떻게 하나요?",
    "결제 수단은 무엇이 있나요?",
    "회원 등급 혜택이 있나요?",
    "영업시간 외 문의는 어떻게 하나요?",
]

DEMO_FAQS_BY_STORE = {
    "bakery": [
        {"question": "케이크 예약은 며칠 전에 해야 하나요?", "answer": "기본 케이크는 하루 전, 레터링 케이크는 최소 2일 전 예약을 권장드립니다."},
        {"question": "당일 만든 빵인가요?", "answer": "매장 판매 빵은 매일 아침 매장에서 직접 구워 준비합니다."},
        {"question": "알레르기 성분을 확인할 수 있나요?", "answer": "상품별 원재료와 알레르기 성분은 문의 주시면 바로 확인해드립니다."},
    ],
    "fashion-lumi": [
        {"question": "사이즈 교환이 가능한가요?", "answer": "상품 수령 후 7일 이내 미착용 상태라면 사이즈 교환 접수가 가능합니다."},
        {"question": "품절 상품은 재입고되나요?", "answer": "인기 상품은 재입고 알림을 남겨주시면 입고 시 안내드립니다."},
        {"question": "실측 사이즈는 어디서 확인하나요?", "answer": "상품 상세의 실측표를 기준으로 확인해주시고, 애매하면 문의로 체형 정보를 남겨주세요."},
    ],
    "techzone": [
        {"question": "전자제품 AS 기간은 어떻게 되나요?", "answer": "제품별 제조사 보증 기준을 따르며, 주문번호를 알려주시면 보증 정보를 확인해드립니다."},
        {"question": "초기 불량이면 교환 가능한가요?", "answer": "수령 직후 불량 증상을 사진이나 영상으로 남겨 문의해주시면 교환 절차를 안내드립니다."},
        {"question": "제품 호환성을 확인할 수 있나요?", "answer": "사용 중인 기기 모델명을 알려주시면 호환 여부를 확인해드립니다."},
    ],
    "greenlife": [
        {"question": "친환경 인증 상품인가요?", "answer": "상품별 인증 여부가 다르므로 상품명을 알려주시면 인증 정보를 확인해드립니다."},
        {"question": "대량 구매가 가능한가요?", "answer": "대량 구매는 재고 확인 후 별도 안내가 가능하니 필요한 수량을 남겨주세요."},
        {"question": "포장재도 친환경인가요?", "answer": "가능한 재활용 포장재를 사용하며 상품 특성상 완충재가 추가될 수 있습니다."},
    ],
    "bookcafe": [
        {"question": "도서 재고 확인이 가능한가요?", "answer": "도서명이나 ISBN을 알려주시면 현재 매장 재고를 확인해드립니다."},
        {"question": "텀블러 세척 방법은 어떻게 되나요?", "answer": "코팅 보호를 위해 식기세척기보다 부드러운 스펀지 손세척을 권장드립니다."},
        {"question": "매장 픽업이 가능한가요?", "answer": "주문 후 픽업 가능 알림을 받으시면 매장에서 수령하실 수 있습니다."},
    ],
    "petmate": [
        {"question": "하네스 사이즈는 어떻게 고르나요?", "answer": "반려동물의 목둘레와 가슴둘레를 재서 상품 사이즈표와 비교해 주세요."},
        {"question": "간식 알레르기 성분을 확인할 수 있나요?", "answer": "상품명을 알려주시면 주요 원재료와 알레르기 성분을 확인해드립니다."},
        {"question": "산책용품 교환이 가능한가요?", "answer": "미사용 상품은 수령 후 7일 이내 교환 접수가 가능합니다."},
    ],
    "flowerday": [
        {"question": "당일 꽃다발 주문이 가능한가요?", "answer": "매장 재고에 따라 당일 제작이 가능하며, 원하는 색감을 먼저 알려주세요."},
        {"question": "메시지 카드를 넣을 수 있나요?", "answer": "주문 요청사항에 문구를 남기면 작은 메시지 카드를 함께 준비합니다."},
        {"question": "꽃다발 관리 방법은 무엇인가요?", "answer": "줄기 끝을 사선으로 자르고 매일 깨끗한 물로 교체하면 더 오래 볼 수 있습니다."},
    ],
}

COMMON_DEMO_PRESET_TITLES = ["배송 안내", "교환/반품 안내"]

DEMO_RESPONSE_PRESETS_BY_STORE = {
    "fashion-lumi": [
        {"title": "사이즈 교환 안내", "content": "사이즈 교환은 수령 후 7일 이내 미착용 상태에서 접수 가능합니다."},
        {"title": "재입고 안내", "content": "품절 상품은 재입고 일정 확인 후 알림으로 안내드리겠습니다."},
    ],
    "bakery": [
        {"title": "케이크 예약 안내", "content": "케이크 예약은 기본 하루 전, 레터링은 최소 2일 전 접수를 권장드립니다."},
        {"title": "당일 제조 안내", "content": "매장 판매 빵은 당일 제조 상품이며 조기 품절될 수 있습니다."},
    ],
    "techzone": [
        {"title": "AS 안내", "content": "AS는 제품별 제조사 보증 기준에 따라 주문번호 확인 후 안내드립니다."},
        {"title": "초기 불량 안내", "content": "초기 불량은 증상 사진이나 영상을 첨부해주시면 교환 절차를 안내드립니다."},
    ],
    "greenlife": [
        {"title": "친환경 인증 안내", "content": "상품별 친환경 인증 여부를 확인해 정확히 안내드리겠습니다."},
        {"title": "대량 구매 안내", "content": "대량 구매는 필요 수량을 알려주시면 재고와 출고 가능일을 확인해드립니다."},
    ],
    "bookcafe": [
        {"title": "도서 재고 안내", "content": "도서명이나 ISBN을 알려주시면 매장 재고를 확인해드립니다."},
        {"title": "매장 픽업 안내", "content": "픽업 가능 알림을 받은 뒤 매장에서 주문 상품을 수령하실 수 있습니다."},
    ],
    "petmate": [
        {"title": "사이즈 안내", "content": "반려동물의 목둘레와 가슴둘레를 알려주시면 하네스 사이즈를 안내해드립니다."},
        {"title": "성분 확인 안내", "content": "간식 상품명을 알려주시면 원재료와 알레르기 성분을 확인해드립니다."},
    ],
    "flowerday": [
        {"title": "당일 제작 안내", "content": "당일 꽃다발은 매장 재고 확인 후 제작 가능 여부를 안내드립니다."},
        {"title": "메시지 카드 안내", "content": "원하는 문구를 남겨주시면 꽃다발과 함께 메시지 카드를 준비합니다."},
    ],
}


def ensure_demo_customer_home_data() -> None:
    with db_connection() as connection:
        try:
            customer_id = _ensure_user(connection, DEMO_CUSTOMER, "CUSTOMER")

            store_ids = {}
            store_operator_ids = {}
            product_ids = {}
            for store in DEMO_STORES:
                operator_id = _ensure_user(connection, DEMO_STORE_OPERATORS[store["key"]], "OPERATOR")
                store_operator_ids[store["key"]] = operator_id
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
                    store_operator_ids[session["store_key"]],
                    order_ids[session["order_number"]],
                    session,
                )
                for message in session["messages"]:
                    _ensure_support_message(connection, session_id, customer_id, store_operator_ids[session["store_key"]], message)

            for post in DEMO_INQUIRY_POSTS:
                post_id = _ensure_inquiry_post(
                    connection,
                    store_ids[post["store_key"]],
                    customer_id,
                    order_ids[post["order_number"]],
                    post,
                )
                if post["reply"]:
                    _ensure_inquiry_reply(connection, post_id, store_operator_ids[post["store_key"]], post["reply"])

            for store in DEMO_STORES:
                _sync_store_faqs(connection, store_ids[store["key"]], DEMO_FAQS_BY_STORE[store["key"]])
                _sync_response_presets(connection, store_ids[store["key"]], DEMO_RESPONSE_PRESETS_BY_STORE[store["key"]])
                if store["key"] == "fashion-lumi":
                    _deactivate_knowledge_file(connection, store_ids[store["key"]], "패션스토어 루미_상담안내.txt")
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "패션스토어_루미_상품목록.txt", LUMI_PRODUCTS_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "패션스토어_루미_운영안내.txt", LUMI_POLICY_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "패션스토어_루미_이벤트.txt", LUMI_EVENT_CONTENT)
                elif store["key"] == "bakery":
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "맛있는빵집_상품목록.txt", BAKERY_PRODUCTS_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "맛있는빵집_운영안내.txt", BAKERY_POLICY_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "맛있는빵집_이벤트.txt", BAKERY_EVENT_CONTENT)
                elif store["key"] == "techzone":
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "테크존전자_상품목록.txt", TECHZONE_PRODUCTS_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "테크존전자_운영안내.txt", TECHZONE_POLICY_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "테크존전자_이벤트.txt", TECHZONE_EVENT_CONTENT)
                elif store["key"] == "greenlife":
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "그린라이프마트_상품목록.txt", GREENLIFE_PRODUCTS_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "그린라이프마트_운영안내.txt", GREENLIFE_POLICY_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "그린라이프마트_이벤트.txt", GREENLIFE_EVENT_CONTENT)
                elif store["key"] == "bookcafe":
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "북카페서랍_상품목록.txt", BOOKCAFE_PRODUCTS_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "북카페서랍_운영안내.txt", BOOKCAFE_POLICY_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "북카페서랍_이벤트.txt", BOOKCAFE_EVENT_CONTENT)
                elif store["key"] == "petmate":
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "펫메이트용품점_상품목록.txt", PETMATE_PRODUCTS_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "펫메이트용품점_운영안내.txt", PETMATE_POLICY_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "펫메이트용품점_이벤트.txt", PETMATE_EVENT_CONTENT)
                elif store["key"] == "flowerday":
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "플라워데이꽃집_상품목록.txt", FLOWERDAY_PRODUCTS_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "플라워데이꽃집_운영안내.txt", FLOWERDAY_POLICY_CONTENT)
                    _ensure_knowledge_file(connection, store_ids[store["key"]], "플라워데이꽃집_이벤트.txt", FLOWERDAY_EVENT_CONTENT)

            _relink_store_owned_records(connection)

            connection.commit()
        except Exception:
            connection.rollback()
            raise


def _relink_store_owned_records(connection) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE support_session ss
            JOIN store s ON s.id = ss.store_id
            SET ss.operator_user_id = s.owner_user_id
            """
        )
        cursor.execute(
            """
            UPDATE support_message sm
            JOIN support_session ss ON ss.id = sm.support_session_id
            JOIN store s ON s.id = ss.store_id
            SET sm.sender_user_id = s.owner_user_id
            WHERE sm.sender_type = 'OPERATOR'
            """
        )
        cursor.execute(
            """
            UPDATE inquiry_post_reply ipr
            JOIN inquiry_post ip ON ip.id = ipr.inquiry_post_id
            JOIN store s ON s.id = ip.store_id
            SET ipr.author_user_id = s.owner_user_id
            """
        )


def get_customer_home(user_id: int) -> dict:
    with db_connection() as connection:
        user = _find_user_by_id(connection, user_id)
        if not user:
            raise AppError(404, "사용자를 찾을 수 없습니다.")
        if user["role"] != "CUSTOMER":
            raise AppError(403, "이용자 계정만 접근할 수 있습니다.")

        orders = _fetch_orders(connection, user_id)
        stores = _fetch_ordered_stores(connection, user_id)
        all_stores = _fetch_all_stores(connection)
        products = _fetch_products(connection)
        support_sessions = _fetch_support_inquiries(connection, user)
        board_inquiries = _fetch_board_inquiries(connection, user)
        inquiries = support_sessions + board_inquiries
        return {
            "orders": orders,
            "stores": stores,
            "allStores": all_stores,
            "products": products,
            "supportSessions": support_sessions,
            "supportMessagesBySessionId": {session["id"]: session["messages"] for session in support_sessions},
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
    with connection.cursor() as cursor:
        if existing:
            cursor.execute(
                """
                UPDATE app_user
                SET email = %s,
                    password_hash = %s,
                    name = %s,
                    phone = %s,
                    role = %s,
                    status = 'ACTIVE'
                WHERE id = %s
                """,
                (user["email"], hash_password(user["password"]), user["name"], user["phone"], role, existing["id"]),
            )
            return existing["id"]

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
            WHERE owner_user_id = %s
            LIMIT 1
            """,
            (owner_user_id,),
        )
        existing = cursor.fetchone()
        if not existing:
            cursor.execute(
                """
                SELECT id
                FROM store
                WHERE name = %s
                LIMIT 1
                """,
                (store["name"],),
            )
            existing = cursor.fetchone()
        if existing:
            cursor.execute(
                """
                UPDATE store
                SET owner_user_id = %s,
                    name = %s,
                    category = %s,
                    description = %s,
                    phone = %s,
                    address = %s,
                    business_hours = %s,
                    status = 'ACTIVE'
                WHERE id = %s
                """,
                (
                    owner_user_id,
                    store["name"],
                    store["category"],
                    store["description"],
                    store["phone"],
                    store["address"],
                    store["business_hours"],
                    existing["id"],
                ),
            )
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
            cursor.execute(
                """
                UPDATE order_table
                SET user_id = %s,
                    store_id = %s,
                    total_price = %s,
                    order_status = 'DELIVERED',
                    ordered_at = %s
                WHERE id = %s
                """,
                (user_id, store_id, order["total_price"], order["ordered_at"], existing["id"]),
            )
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
            cursor.execute(
                """
                UPDATE support_session
                SET store_id = %s,
                    operator_user_id = %s,
                    support_status = %s,
                    created_at = %s,
                    last_message_at = %s
                WHERE id = %s
                """,
                (store_id, operator_user_id, session["status"], session["created_at"], session["last_message_at"], existing["id"]),
            )
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
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                """
                UPDATE support_message
                SET sender_user_id = %s,
                    created_at = %s
                WHERE id = %s
                """,
                (sender_user_id, message["created_at"], existing["id"]),
            )
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
            cursor.execute(
                """
                UPDATE inquiry_post
                SET store_id = %s,
                    order_id = %s,
                    content = %s,
                    inquiry_status = %s,
                    created_at = %s,
                    updated_at = %s
                WHERE id = %s
                """,
                (store_id, order_id, post["content"], post["status"], post["created_at"], post["created_at"], existing["id"]),
            )
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
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                """
                UPDATE inquiry_post_reply
                SET author_user_id = %s,
                    created_at = %s,
                    updated_at = %s
                WHERE id = %s
                """,
                (author_user_id, reply["created_at"], reply["created_at"], existing["id"]),
            )
            return

        cursor.execute(
            """
            INSERT INTO inquiry_post_reply (inquiry_post_id, author_user_id, content, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (inquiry_post_id, author_user_id, reply["content"], reply["created_at"], reply["created_at"]),
        )


def _sync_store_faqs(connection, store_id: int, faqs: list[dict]) -> None:
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM faq WHERE store_id = %s", (store_id,))
    for sort_order, faq in enumerate(faqs):
        _ensure_faq(connection, store_id, faq, sort_order)


def _ensure_faq(connection, store_id: int, faq: dict, sort_order: int) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id FROM faq WHERE store_id = %s AND question = %s LIMIT 1",
            (store_id, faq["question"]),
        )
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                "UPDATE faq SET answer = %s, sort_order = %s WHERE id = %s",
                (faq["answer"], sort_order, existing["id"]),
            )
            return
        cursor.execute(
            """
            INSERT INTO faq (store_id, question, answer, sort_order)
            VALUES (%s, %s, %s, %s)
            """,
            (store_id, faq["question"], faq["answer"], sort_order),
        )


def _sync_response_presets(connection, store_id: int, presets: list[dict]) -> None:
    with connection.cursor() as cursor:
        placeholders = ", ".join(["%s"] * len(COMMON_DEMO_PRESET_TITLES))
        cursor.execute(
            f"DELETE FROM response_preset WHERE store_id = %s AND title IN ({placeholders})",
            (store_id, *COMMON_DEMO_PRESET_TITLES),
        )
    for preset in presets:
        _ensure_response_preset(connection, store_id, preset["title"], preset["content"])


def _ensure_response_preset(connection, store_id: int, title: str, content: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id FROM response_preset WHERE store_id = %s AND title = %s LIMIT 1",
            (store_id, title),
        )
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                "UPDATE response_preset SET content = %s WHERE id = %s",
                (content, existing["id"]),
            )
            return
        cursor.execute(
            "INSERT INTO response_preset (store_id, title, content) VALUES (%s, %s, %s)",
            (store_id, title, content),
        )


LUMI_PRODUCTS_CONTENT = """[패션스토어 루미 - 판매 상품 목록]
※ 아래 목록이 현재 판매 중인 전체 상품입니다. 목록에 없는 상품은 취급하지 않습니다.

■ 봄 자켓 (132,000원)
- 소재: 폴리에스터 75%, 나일론 25% / 안감: 폴리에스터 100%
- 컬러: 베이지, 올리브, 네이비, 블랙
- 사이즈: XS(44)·S(55)·M(66)·L(77)·XL(88)
- 실측(M기준): 어깨 40 / 가슴 96 / 총장 58cm
- 특징: 방풍 기능, 슬림핏 — 평소보다 한 치수 크게 권장
- 세탁: 드라이클리닝 권장, 손세탁 가능(30°C 이하), 세탁기 사용 금지

■ 린넨 블라우스 (69,000원)
- 소재: 린넨 100%
- 컬러: 아이보리, 스카이블루, 민트, 핑크
- 사이즈: S(55)·M(66)·L(77)·XL(88)
- 실측(M기준): 어깨 37 / 가슴 100 / 총장 62cm
- 특징: 루즈핏, 반소매, 앞단추 디자인
- 세탁: 손세탁 가능(30°C 이하), 단독 세탁 권장

■ 플리츠 미디 스커트 (89,000원)
- 소재: 폴리에스터 95%, 스판덱스 5%
- 컬러: 블랙, 베이지, 카키, 버건디
- 사이즈: XS(44)·S(55)·M(66)·L(77)
- 실측(M기준): 허리 68 / 엉덩이 96 / 총장 75cm
- 특징: 밑단 플리츠, 허리 고무밴드, 미디 기장
- 세탁: 단독 세탁, 30°C 이하 손세탁

■ 와이드 크롭 팬츠 (79,000원)
- 소재: 레이온 60%, 폴리에스터 40%
- 컬러: 아이보리, 카키, 차콜, 네이비
- 사이즈: S(55)·M(66)·L(77)·XL(88)
- 실측(M기준): 허리 68 / 엉덩이 102 / 총장 80cm
- 특징: 와이드핏, 크롭 기장, 허리 고무밴드+드로스트링

■ 오버사이즈 니트 가디건 (99,000원)
- 소재: 아크릴 60%, 울 40%
- 컬러: 크림, 그레이, 카멜, 블랙
- 사이즈: F(FREE, 55~88 착용 가능)
- 실측: 어깨 52 / 가슴 120 / 총장 72cm
- 특징: 오버핏, 포켓 있음, 간절기·실내용 아우터
- 세탁: 드라이클리닝 권장

■ 플로럴 미니 원피스 (115,000원)
- 소재: 폴리에스터 100%
- 컬러: 화이트플로럴, 블루플로럴
- 사이즈: XS(44)·S(55)·M(66)·L(77)
- 실측(M기준): 가슴 88 / 허리 72 / 총장 85cm
- 특징: 민소매, 허리 절개 A라인, 안감 있음
- 세탁: 손세탁 가능(30°C 이하)

■ 데님 와이드 팬츠 (95,000원)
- 소재: 코튼 98%, 스판덱스 2%
- 컬러: 라이트블루, 인디고, 블랙
- 사이즈: S(55)·M(66)·L(77)·XL(88)
- 실측(M기준): 허리 70 / 엉덩이 100 / 총장 98cm
- 특징: 하이웨이스트, 와이드핏, 5포켓
- 세탁: 단독 세탁, 30°C 이하, 뒤집어서 세탁

■ 스트라이프 크롭 티셔츠 (45,000원)
- 소재: 코튼 100%
- 컬러: 화이트/블랙 스트라이프, 화이트/네이비 스트라이프
- 사이즈: S(55)·M(66)·L(77)
- 실측(M기준): 가슴 90 / 총장 50cm
- 특징: 크롭 기장, 반소매, 라운드넥

■ 하이웨이스트 슬랙스 (89,000원)
- 소재: 폴리에스터 70%, 비스코스 30%
- 컬러: 블랙, 차콜, 베이지, 브라운
- 사이즈: S(55)·M(66)·L(77)·XL(88)
- 실측(M기준): 허리 66 / 엉덩이 94 / 총장 100cm
- 특징: 하이웨이스트, 스트레이트핏, 앞지퍼+버튼 클로징

■ 봄 트렌치코트 (189,000원)
- 소재: 폴리에스터 65%, 코튼 35% / 안감: 폴리에스터 100%
- 컬러: 베이지, 카키
- 사이즈: S(55)·M(66)·L(77)·XL(88)
- 실측(M기준): 어깨 40 / 가슴 102 / 총장 105cm
- 특징: 벨트 포함, 더블 버튼, 미디 기장
- 세탁: 드라이클리닝 권장
"""

LUMI_POLICY_CONTENT = """[패션스토어 루미 - 운영 안내]

■ 교환/반품 정책
- 접수 기간: 수령 후 7일 이내
- 조건: 미착용, 세탁 미진행, 택그 부착 상태
- 고객 변심: 왕복 배송비 6,000원 고객 부담
- 제품 불량/오배송: 무료 교환 또는 전액 환불
- 처리 기간: 접수 후 3~5 영업일
- 교환/반품 불가: 착용 흔적, 세탁 후, 택그 제거, 7일 초과

■ 배송 안내
- 소요일: 2~3 영업일 (주말·공휴일 제외)
- 당일 발송: 평일 오후 2시 이전 결제 완료 시
- 배송비: 3만 원 이상 구매 시 무료 / 미만 시 3,000원
- 제주·도서산간: 추가 배송비 3,000원

■ 재입고 안내
- 품절 상품은 상품 페이지에서 재입고 알림 신청 가능
- 재입고 후 SMS/이메일로 개별 안내

■ 포인트·쿠폰
- 포인트: 구매 금액의 1% 적립, 다음 구매 시 사용 가능
- 첫 구매 쿠폰: 10% 할인 (회원가입 후 자동 지급)
- 적립·사용 단위: 100원 이상

■ 고객센터 운영시간
- 평일 09:00~18:00 (주말·공휴일 휴무)
- 점심시간: 12:00~13:00 (응답 지연 가능)
- 문의: 채팅 상담 또는 1:1 문의 게시판
"""


LUMI_EVENT_CONTENT = """[패션스토어 루미 - 이벤트 및 혜택 안내]

■ 신규 회원 웰컴 혜택
- 가입 즉시 10% 할인 쿠폰 자동 지급 (전 상품 적용)
- 쿠폰 유효 기간: 발급일로부터 30일
- 첫 구매 시 포인트 2배 적립 (구매 금액의 2%)

■ 봄 시즌 기획전 (2026.03.01 ~ 2026.05.31)
- 봄 자켓 / 린넨 블라우스 / 플리츠 미디 스커트 최대 15% 할인
- 봄 자켓 + 린넨 블라우스 세트 구매 시 추가 5% 할인
- 봄 신상 3만 원 이상 구매 시 쇼핑백 증정 (품절 시 종료)

■ 친구 추천 이벤트
- 추천한 친구가 첫 구매 완료 시: 추천인 5,000원 포인트 지급
- 추천받은 친구: 5,000원 할인 쿠폰 지급
- 추천 코드는 마이페이지 > 친구 추천에서 확인

■ 리뷰 이벤트
- 구매 후 사진 리뷰 작성 시 500 포인트 추가 적립
- 이달의 베스트 리뷰 선정 시 1만 원 상품권 지급

■ 등급 혜택
- 실버 (6개월 누적 10만 원 이상): 생일 쿠폰 5% + 무료배송 월 1회
- 골드 (6개월 누적 30만 원 이상): 생일 쿠폰 10% + 무료배송 월 3회 + 신상 얼리버드 알림
- VIP (6개월 누적 60만 원 이상): 생일 쿠폰 15% + 무료배송 무제한 + 전담 상담사 배정
"""


BAKERY_PRODUCTS_CONTENT = """[맛있는 빵집 - 판매 상품 목록]
※ 아래 목록이 현재 판매 중인 전체 메뉴입니다. 목록에 없는 상품은 취급하지 않습니다.

■ 티라미수 케이크 2호 (28,000원) — 6인 기준, 마스카포네 크림, 에스프레소 시럽
■ 딸기 생크림 케이크 2호 (32,000원) — 생딸기 데코, 시즌 한정 (3~5월)
■ 생크림 케이크 1호 (22,000원) — 4인 기준, 플레인 생크림
■ 소금빵 (2,500원/개) — 버터 내장, 하루 3회 생산 (09:00 / 12:00 / 15:30)
■ 크루아상 (3,500원/개) — 버터 크루아상, 치즈·햄 크루아상 선택 가능
■ 식빵 (6,000원/1근) — 우유식빵, 통밀식빵 2종
■ 마카롱 5개입 세트 (12,000원) — 딸기·초코·얼그레이·피스타치오·솔티카라멜
■ 스콘 (3,000원/개) — 플레인·블루베리·체다치즈 3종
"""

BAKERY_POLICY_CONTENT = """[맛있는 빵집 - 운영 안내]

■ 영업시간
- 매일 07:00~20:00 (연중무휴)
- 브레이크타임 없음, 품절 시 조기 마감 가능

■ 케이크 주문
- 사전 주문 필수: 수령일 기준 최소 3일 전 주문
- 주문 방법: 채팅 상담 또는 전화 주문
- 당일 취소: 전날 오후 6시 이전까지만 가능
- 케이크 픽업 시 쇼핑백·보냉재 제공

■ 교환/환불
- 생과자·생크림 제품 특성상 수령 당일만 교환/환불 가능
- 제품 불량(이물질·변질): 당일 즉시 교환 또는 전액 환불
- 단순 변심 환불 불가 (식품류 특성)

■ 배달/픽업
- 배달 서비스 미제공 — 매장 방문 픽업만 가능
- 주차: 매장 앞 2시간 무료 주차 가능
"""

BAKERY_EVENT_CONTENT = """[맛있는 빵집 - 이벤트 및 혜택 안내]

■ 신규 회원 웰컴 혜택
- 첫 구매 시 3,000원 할인 쿠폰 자동 지급
- 쿠폰 유효 기간: 발급일로부터 14일

■ 스탬프 적립 이벤트
- 구매 1건당 스탬프 1개 적립
- 10개 달성 시 소금빵 2개 증정
- 20개 달성 시 마카롱 5개입 증정

■ 생일 케이크 특별 서비스
- 케이크 사전 주문 시 초(숫자 초) 무료 제공
- 생일 당일 픽업 고객: 당일 스탬프 2배 적립

■ SNS 인증샷 이벤트
- 구매 후 SNS에 해시태그 인증샷 업로드 시 마카롱 1개 증정
- 해시태그: #맛있는빵집 #빵스타그램
"""

TECHZONE_PRODUCTS_CONTENT = """[테크존 전자 - 판매 상품 목록]
※ 아래 목록이 현재 판매 중인 전체 상품입니다. 목록에 없는 상품은 취급하지 않습니다.

■ 웹캠 HD 1080p (89,000원)
- 해상도: 1920×1080 / 30fps, USB-A 연결
- 호환: Windows·Mac OS 드라이버 설치 불필요
- 특징: 내장 마이크, 자동 노출 조정, 클립형 거치

■ 블루투스 마우스 (35,000원)
- 연결: 블루투스 5.0 / USB 동글 겸용
- 배터리: 내장 충전식 (USB-C), 완충 30일 사용
- 무게: 95g, 좌우 대칭 디자인

■ 알루미늄 노트북 스탠드 (45,000원)
- 소재: 항공 알루미늄, 각도 조절 6단계 (15~45°)
- 호환: 11~17인치 노트북, 태블릿
- 특징: 접이식 수납, 방열 구조

■ USB-C 허브 7in1 (55,000원)
- 포트: USB-C PD 100W / HDMI 4K / USB-A 3.0×3 / SD·TF 카드슬롯
- 호환: MacBook·iPad Pro·Windows 노트북

■ 기계식 키보드 (120,000원)
- 스위치: 청축(클리키) / 갈축(택타일) 선택
- 레이아웃: 텐키리스 87키, 백라이트 RGB
- 연결: USB-A 유선

■ 모니터 암 싱글 (75,000원)
- 지지 하중: 1~9kg, VESA 75·100 호환
- 관절: 상하·좌우·회전 전방향 조절

■ 무선 충전 패드 (25,000원)
- 출력: 최대 15W 고속 충전 (Qi 규격)
- 호환: 갤럭시·아이폰 Qi 지원 기기 전 기종
"""

TECHZONE_POLICY_CONTENT = """[테크존 전자 - 운영 안내]

■ 영업시간
- 평일 10:00~19:00 / 토요일 10:00~17:00 / 일요일·공휴일 휴무

■ AS(애프터서비스)
- 무상 AS: 구매일로부터 1년
- AS 접수: 채팅 상담 → 택배 수거 또는 매장 방문
- 처리 기간: 접수 후 5~7 영업일 (부품 수급에 따라 상이)

■ 교환/반품
- 미개봉 상품: 수령 후 7일 이내 교환·환불 가능
- 개봉 후 불량: 7일 이내 교환 또는 환불, 7일 초과 시 AS 처리
- 단순 변심 개봉 상품: 교환·환불 불가
- 배송비: 단순 변심 반품 시 왕복 배송비 6,000원 고객 부담

■ 배송
- 평균 소요일: 1~2 영업일 (오후 2시 이전 결제 완료 시 당일 발송)
- 배송비: 5만 원 이상 무료 / 미만 시 3,000원
- 제주·도서산간: 추가 5,000원
"""

TECHZONE_EVENT_CONTENT = """[테크존 전자 - 이벤트 및 혜택 안내]

■ 신규 회원 혜택
- 가입 즉시 5% 할인 쿠폰 지급 (전 상품 적용, 30일 유효)

■ 주변기기 세트 할인
- 2개 이상 동시 구매 시 10% 추가 할인
- 3개 이상 구매 시 15% 추가 할인

■ 직장인 점심 특가
- 매일 12:00~13:00 결제 시 5% 추가 할인
- 중복 적용 가능 (세트 할인 + 점심 특가)

■ 리뷰 이벤트
- 구매 후 포토 리뷰 작성 시 500P 적립
- 영상 리뷰 작성 시 1,000P 적립

■ 등급 혜택
- 실버 (연 15만 원 이상): 배송비 무료 연 3회
- 골드 (연 30만 원 이상): 배송비 상시 무료 + AS 우선 처리
"""

GREENLIFE_PRODUCTS_CONTENT = """[그린라이프 마트 - 판매 상품 목록]
※ 아래 목록이 현재 판매 중인 전체 상품입니다. 목록에 없는 상품은 취급하지 않습니다.

■ 에코백 내추럴 (8,900원) — 코튼 100%, 20L 용량, 어깨끈 포함
■ 에코백 캔버스 (11,900원) — 두꺼운 원단, 파우치 증정
■ 대나무 칫솔 세트 4개입 (7,500원) — 성인용·어린이용 구분
■ 천연 수세미 (3,500원/개) — 루파 수세미, 항균·친환경 인증
■ 유기농 면 행주 5장 세트 (12,000원) — 무형광·무향
■ 실리콘 식품 보관백 3종 세트 (15,000원) — 소·중·대, 냉동·전자레인지 사용 가능
■ 천연 비누 (5,000원/개) — 라벤더·유칼립투스·페퍼민트 3종
■ 재사용 스테인리스 빨대 세트 (8,000원) — 일자·구부러짐 각 2개 + 세척솔
■ 밀랍 랩 3종 세트 (12,000원) — S·M·L 각 1장, 세탁 후 재사용 가능
■ 대나무 면봉 200개입 (4,500원) — 플라스틱 없는 친환경 소재
"""

GREENLIFE_POLICY_CONTENT = """[그린라이프 마트 - 운영 안내]

■ 영업시간
- 월~토 09:00~18:00 / 일요일·공휴일 휴무

■ 배송
- 소요일: 1~3 영업일 (평일 오후 1시 이전 결제 시 당일 발송)
- 배송비: 3만 원 이상 무료 / 미만 시 2,500원
- 제주·도서산간: 추가 3,000원

■ 교환/반품
- 접수 기간: 수령 후 7일 이내
- 조건: 미개봉·미사용 상태
- 위생 관련 상품(비누·수세미·면봉 등): 개봉 후 교환·환불 불가
- 불량·오배송: 무료 교환 또는 전액 환불

■ 포장
- 무(無)비닐 포장 — 재생지·크라프트지·종이 테이프 사용
- 완충재: 종이 허니컴 사용 (스티로폼·비닐 에어캡 미사용)
"""

GREENLIFE_EVENT_CONTENT = """[그린라이프 마트 - 이벤트 및 혜택 안내]

■ 신규 회원 웰컴 포인트
- 가입 즉시 2,000P 지급 (1P = 1원, 다음 구매 시 사용)

■ 첫 구매 할인
- 첫 구매 시 10% 할인 쿠폰 자동 적용

■ 에코 챌린지 이벤트
- 구매 상품 사용 인증샷 SNS 업로드 시 500P 적립
- 해시태그: #그린라이프 #에코챌린지

■ 정기구독 서비스
- 월 1회 에코 생활용품 큐레이션 박스 (15% 할인)
- 구독 취소: 다음 배송일 7일 전까지 가능

■ 리뷰 적립
- 텍스트 리뷰: 200P / 포토 리뷰: 500P / 영상 리뷰: 1,000P
"""

BOOKCAFE_PRODUCTS_CONTENT = """[북카페 서랍 - 판매 굿즈 목록]
※ 아래 목록이 현재 판매 중인 전체 굿즈입니다. 음료·카페 메뉴는 별도 운영합니다.

■ 텀블러 350ml (18,000원) — 스테인리스 이중 진공, 보온·보냉 12시간, 누수 방지 뚜껑
■ 텀블러 500ml (22,000원) — 스테인리스 이중 진공, 보온·보냉 16시간, 빨대 포함
■ 북카페 머그컵 (12,000원) — 도자기 300ml, 책 로고 인쇄, 전자레인지 사용 가능
■ 에코백 (15,000원) — 코튼 캔버스, 책·서랍 일러스트 인쇄, 내부 포켓 1개
■ 노트 A5 (8,000원) — 도트·무지·줄 3종 중 선택, 200페이지, 실 제본
■ 시즌 한정 포스터 (5,000원) — 분기별 신규 디자인, A3 아트지
■ 북마크 세트 3개입 (6,000원) — 황동 소재, 클립형
"""

BOOKCAFE_POLICY_CONTENT = """[북카페 서랍 - 운영 안내]

■ 영업시간
- 평일 10:00~22:00 / 주말·공휴일 10:00~21:00 (연중무휴)

■ 좌석 이용
- 좌석 총 40석, 예약 없음 (선착순 착석)
- 최소 주문: 1인 1음료 (카페 메뉴 별도)
- 노트북 사용 구역: 2층 (1층은 대화 가능 구역)
- 최대 이용 시간 제한 없음 (혼잡 시 협조 요청 가능)

■ 굿즈 교환/반품
- 수령 후 7일 이내, 구매 영수증 지참 시 가능
- 미사용·미개봉 상태 필수
- 단순 변심: 왕복 배송비 6,000원 고객 부담

■ 굿즈 배송
- 소요일: 2~3 영업일
- 배송비: 무료 (전 상품)
"""

BOOKCAFE_EVENT_CONTENT = """[북카페 서랍 - 이벤트 및 혜택 안내]

■ 멤버십 스탬프
- 음료 1잔 구매 시 스탬프 1개 적립
- 10개: 아메리카노(R) 무료 교환권
- 20개: 굿즈 20% 할인 쿠폰

■ 신규 회원 혜택
- 회원가입 후 첫 방문 시 음료 10% 할인

■ 독서모임 할인
- 북카페 서랍 독서모임 참여 고객: 굿즈 전 품목 10% 상시 할인
- 독서모임 일정: 매월 첫째 주 토요일 오후 3시

■ 이달의 책 이벤트
- 매월 선정된 '이달의 책' 관련 굿즈 구매 시 음료 500원 할인
- 해당 책 소지 인증 시 추가 스탬프 1개 적립
"""

PETMATE_PRODUCTS_CONTENT = """[펫메이트 용품점 - 판매 상품 목록]
※ 아래 목록이 현재 판매 중인 전체 상품입니다. 목록에 없는 상품은 취급하지 않습니다.

■ 강아지 산책 하네스 (28,000원)
- 사이즈: S(소형견 3~7kg) / M(중형견 7~15kg) / L(대형견 15~25kg)
- 소재: 옥스포드 원단 + 메쉬 안감, 반사 스트립 부착
- 특징: 앞·뒤 클립 2중 고정, 조절 버클 4개

■ 고양이 캣타워 5단 (89,000원)
- 높이: 약 120cm, 설치 면적: 40×40cm
- 구성: 스크래처 기둥 2개 / 침대 2개 / 해먹 1개
- 소재: 사이잘삼 스크래처 + 봉제 패브릭

■ 반려동물 간식 (5,000~12,000원)
- 닭가슴살 져키 (5,000원/100g) — 무방부제, 저염
- 고구마 칩 (5,000원/80g) — 무설탕, 단성분
- 오리 슬라이스 (12,000원/150g) — 단백질 고함량

■ 강아지 방석 (35,000원) — L사이즈(70×50cm), 방수 커버, 커버 세탁 가능
■ 고양이 자동 화장실 (149,000원) — 센서 감지 자동 청소, 냄새 차단 필터 포함
■ 강아지 장난감 세트 (18,000원) — 로프·패브릭·고무 5종 혼합
■ 반려동물 샴푸 (12,000원/300ml) — 약산성 pH 6.5, 무향, 강아지·고양이 겸용
"""

PETMATE_POLICY_CONTENT = """[펫메이트 용품점 - 운영 안내]

■ 영업시간
- 평일 10:00~19:00 / 토요일 11:00~17:00 / 일요일·공휴일 휴무

■ 배송
- 소요일: 1~3 영업일 (평일 오후 2시 이전 결제 시 당일 발송)
- 배송비: 4만 원 이상 무료 / 미만 시 3,000원
- 대형 상품(캣타워·방석): 추가 취급비 2,000원

■ 교환/반품
- 미개봉 상품: 수령 후 7일 이내
- 식품(간식류): 수령 당일 이후 반품 불가 (위생)
- 불량·오배송: 무료 교환 또는 전액 환불
- 사이즈 교환(하네스): 미사용 상태에서 수령 후 7일 이내 1회 무료 교환

■ 주의사항
- 간식 성분 알레르기 확인 후 급여 권장
- 캣타워 조립 문의: 채팅 상담 또는 조립 영상 안내 가능
"""

PETMATE_EVENT_CONTENT = """[펫메이트 용품점 - 이벤트 및 혜택 안내]

■ 신규 회원 혜택
- 가입 즉시 5% 할인 쿠폰 지급 (전 상품, 30일 유효)

■ 반려동물 생일 할인
- 마이페이지에 반려동물 생일 등록 시, 해당 달에 10% 할인 쿠폰 지급

■ 간식 정기구독
- 월 1회 간식 박스 (닭가슴살+고구마+오리 혼합) 정기 배송
- 구독 가격: 20,000원/월 (단품 대비 약 10% 절약)
- 구독 취소: 다음 배송일 5일 전까지 가능

■ 리뷰 이벤트
- 포토 리뷰: 500P 적립
- 반려동물 착용 영상 리뷰: 1,000P 적립

■ 친구 추천
- 추천인·피추천인 각 3,000P 지급 (피추천인 첫 구매 완료 시)
"""

FLOWERDAY_PRODUCTS_CONTENT = """[플라워데이 꽃집 - 판매 상품 목록]
※ 아래 목록이 현재 판매 중인 전체 상품입니다. 꽃 구성은 계절에 따라 달라질 수 있습니다.

■ 계절 꽃다발 소 (25,000원) — 약 10~12줄기, 포장지+리본 포함
■ 계절 꽃다발 중 (45,000원) — 약 20~25줄기, 포장지+리본 포함
■ 계절 꽃다발 대 (75,000원) — 약 35~40줄기, 고급 포장지+리본+카드 포함
■ 미니 선인장 화분 (8,000원) — 지름 7cm 토분, 흙·완성 식재 상태
■ 허브 화분 (12,000원) — 로즈마리·라벤더·민트 중 선택, 지름 10cm
■ 공기정화 식물 패키지 (35,000원) — 산세베리아·스킨답서스·포토스 3종 + 화분 포함
■ 개업 꽃바구니 (80,000원~) — 고급 꽃바구니, 리본·카드 포함, 원하는 문구 인쇄 가능
■ 졸업·생일 꽃바구니 (50,000원~) — 밝은 톤 구성, 맞춤 문구 가능
"""

FLOWERDAY_POLICY_CONTENT = """[플라워데이 꽃집 - 운영 안내]

■ 영업시간
- 매일 09:00~19:00 (연중무휴, 명절 전날은 18:00 마감)

■ 주문 방법
- 당일 주문 가능 (재고 상황에 따라 불가할 수 있음)
- 맞춤 제작(특정 꽃·색상 요청): 1~2일 전 사전 주문 권장
- 꽃바구니·대량 주문: 3일 전 사전 주문 필수

■ 픽업
- 매장 방문 픽업 (주소: 채팅 상담으로 안내)
- 픽업 시간 변경: 수령 예정 시각 2시간 전까지 채팅으로 연락

■ 배달
- 매장 기준 5km 이내 배달 가능
- 배달비: 3km 이내 3,000원 / 3~5km 5,000원
- 배달 시간: 오전 10시~오후 6시 (사전 예약 필수)

■ 교환/환불
- 생화 특성상 수령 후 교환·환불 불가
- 배송 중 파손·오배송: 사진 확인 후 즉시 교환 또는 환불
- 화분류: 수령 후 3일 이내 불량(고사·파손) 확인 시 교환
"""

FLOWERDAY_EVENT_CONTENT = """[플라워데이 꽃집 - 이벤트 및 혜택 안내]

■ 기념일 패키지 할인
- 꽃다발 + 메시지 카드 세트 주문 시 10% 할인
- 카드 문구 직접 입력 가능 (최대 50자)

■ 생일 주문 혜택
- 생일 당사자 인증(생년월일 제출) 시 5% 추가 할인
- 당일 픽업 주문에 한해 적용

■ 꽃 정기구독 서비스
- 주 1회 계절 꽃다발 정기 배송 (소형 기준)
- 구독 가격: 20,000원/주 (단품 대비 20% 절약)
- 최소 구독 기간: 4주, 이후 언제든 해지 가능

■ SNS 업로드 이벤트
- 구매 후 꽃 사진 SNS 업로드 시 다음 구매 5% 할인 쿠폰 지급
- 해시태그: #플라워데이 #꽃스타그램

■ 개업 축하 단체 할인
- 꽃바구니 3개 이상 단체 주문 시 10% 할인 + 무료 배달
"""


def _deactivate_knowledge_file(connection, store_id: int, file_name: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE chatbot_knowledge_file SET is_active = FALSE WHERE store_id = %s AND file_name = %s",
            (store_id, file_name),
        )


def _ensure_knowledge_file(connection, store_id: int, file_name: str, file_content: str = "") -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id FROM chatbot_knowledge_file WHERE store_id = %s AND file_name = %s LIMIT 1",
            (store_id, file_name),
        )
        existing = cursor.fetchone()
        if existing:
            if file_content:
                cursor.execute(
                    "UPDATE chatbot_knowledge_file SET file_content = %s WHERE id = %s",
                    (file_content, existing["id"]),
                )
            return
        cursor.execute(
            """
            INSERT INTO chatbot_knowledge_file (store_id, file_name, file_url, file_content, is_active)
            VALUES (%s, %s, %s, %s, TRUE)
            """,
            (store_id, file_name, f"local://{file_name}", file_content if file_content else None),
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


def _fetch_all_stores(connection) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, name, category, phone, address, description, business_hours
            FROM store
            WHERE status = 'ACTIVE'
            ORDER BY name ASC
            """
        )
        rows = cursor.fetchall()

    return [_format_store(row) for row in rows]


def _fetch_products(connection) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
              p.id,
              p.store_id,
              p.name,
              p.description,
              p.price,
              s.name AS store_name,
              s.category AS store_category
            FROM product p
            JOIN store s ON s.id = p.store_id
            WHERE p.status = 'ACTIVE' AND s.status = 'ACTIVE'
            ORDER BY s.name ASC, p.name ASC
            """
        )
        rows = cursor.fetchall()

    return [
        {
            "id": row["id"],
            "storeId": row["store_id"],
            "name": row["name"],
            "description": row["description"],
            "price": int(row["price"]),
            "storeName": row["store_name"],
            "storeCategory": row["store_category"],
        }
        for row in rows
    ]


def _format_store(row: dict) -> dict:
    return {
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
                "id": session["id"],
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
