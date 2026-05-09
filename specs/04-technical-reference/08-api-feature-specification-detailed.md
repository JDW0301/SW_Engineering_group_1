# API 기능별 상세 명세서

## 1. 문서 목적

이 문서는 `SW_Engineering_group_1` 프로젝트의 소스 코드와 기존 명세 문서를 확인한 뒤, API를 기능별로 세분화하여 정리한 상세 명세서다.

현재 실제 서버에 구현된 API와 기존 기획 문서에 정의된 예정 API를 구분한다. 이렇게 나누는 이유는 구현 범위를 과장하지 않고, 앞으로 어떤 API를 추가해야 하는지 단계별로 확인하기 위해서다.

## 2. 확인한 주요 파일

### 서버 구현

- `server/main.py`: FastAPI 앱 생성, CORS, 예외 처리, 실제 엔드포인트 정의
- `server/app/auth.py`: 회원가입, 로그인, 토큰 갱신, 로그아웃, 내 정보 조회 비즈니스 로직
- `server/app/customer_home.py`: 고객 홈 데이터 조회와 데모 데이터 생성
- `server/app/validation.py`: 요청 body 검증
- `server/app/security.py`: 비밀번호 해시, JWT access/refresh token 생성 및 검증
- `server/app/repositories.py`: 사용자, 스토어, refresh token 저장소 함수
- `server/app/database.py`: MySQL 연결
- `server/sql/schema.sql`: 구현 및 예정 기능을 위한 주요 테이블 정의

### 클라이언트 API 호출

- `code/src/api/auth.js`: 인증 API 호출과 토큰 localStorage 관리
- `code/src/api/customerHome.js`: 고객 홈 API 호출
- `code/src/App.jsx`: 로그인, 회원가입, 세션 초기화, refresh token 재발급 흐름
- `code/src/pages/customer/CustomerApp.jsx`: 고객 홈 데이터 로딩

### 기존 명세 및 화면 근거

- `specs/04-technical-reference/01-api-spec-summary.md`
- `specs/04-technical-reference/02-database-schema-draft.md`
- `specs/00-overview/02-system-architecture.md`
- `specs/00-overview/04-implementation-order.md`
- `specs/01-operator-app/01-inquiry-workspace.md`
- `specs/02-customer-app/01-customer-portal.md`
- `specs/02-customer-app/02-chatbot-and-handoff.md`
- `specs/03-features-and-logic/01-conversation-and-content.md`

## 3. 공통 API 규칙

### 기본 경로

- 서버 API prefix: `/api`
- 프론트엔드 개발 서버는 Vite proxy 또는 같은 origin proxy를 통해 `/api/...`로 요청한다고 본다.

### 인증 방식

- 보호 API는 `Authorization: Bearer {accessToken}` 헤더를 사용한다.
- access token은 JWT이며 payload에 `sub`, `role`, `loginId`, `exp`가 포함된다.
- refresh token은 DB의 `refresh_token` 테이블에도 저장된다.
- refresh token 갱신 시 기존 token은 `revoked_at`으로 폐기하고 새 token을 발급한다.

### 공통 성공 응답 원칙

- JSON 응답을 기본으로 한다.
- 사용자에게 보여줄 메시지가 필요한 경우 `message` 필드를 포함한다.
- 데이터 응답은 기능별 루트 필드에 담는다. 예: `user`, `orders`, `stores`, `inquiries`.

### 공통 오류 응답

`AppError` 발생 시 아래 형태로 응답한다.

```json
{
  "message": "오류 메시지",
  "details": null
}
```

예상 상태 코드는 다음과 같다.

- `400`: 필수 입력 누락 또는 형식 오류
- `401`: 인증 실패, 토큰 오류, refresh token 만료/폐기
- `403`: 역할 또는 계정 상태상 접근 불가
- `404`: 대상 사용자 또는 리소스 없음
- `409`: 중복 아이디 또는 중복 이메일
- `500`: 처리되지 않은 서버 오류

## 4. 현재 구현된 API

## 4.1 상태 확인 API

### GET `/api/health`

서버가 정상적으로 응답하는지 확인한다.

#### 인증

- 필요 없음

#### 요청

요청 body 없음.

#### 성공 응답

```json
{
  "message": "ok"
}
```

#### 사용 화면/목적

- 개발 중 서버 실행 여부 확인
- 배포 또는 로컬 실행 점검

## 4.2 인증 API

### POST `/api/auth/signup/customer`

고객 계정을 생성한다.

#### 인증

- 필요 없음

#### 요청 body

```json
{
  "loginId": "customer01",
  "email": "customer01@example.com",
  "password": "1234",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

#### 검증 규칙

- `loginId`, `password`, `name`, `phone`은 빈 문자열일 수 없다.
- `email`은 이메일 형식이어야 한다.
- `loginId`가 이미 존재하면 `409`.
- `email`이 이미 존재하면 `409`.

#### 처리 흐름

1. 요청 body를 검증한다.
2. `app_user.login_id` 중복을 확인한다.
3. `app_user.email` 중복을 확인한다.
4. 비밀번호를 bcrypt로 해시한다.
5. `app_user`에 `role = CUSTOMER`, `status = ACTIVE`로 저장한다.
6. 생성된 사용자를 반환한다.

#### 성공 응답

```json
{
  "message": "이용자 회원가입이 완료되었습니다.",
  "user": {
    "id": 1,
    "login_id": "customer01",
    "email": "customer01@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

#### 연결 파일

- 서버: `server/main.py`, `server/app/auth.py`, `server/app/validation.py`, `server/app/repositories.py`
- 클라이언트: `code/src/api/auth.js`, `code/src/pages/auth/RegisterPage.jsx`, `code/src/App.jsx`

### POST `/api/auth/signup/operator`

운영자 계정과 운영자 소유 스토어를 함께 생성한다.

#### 인증

- 필요 없음

#### 요청 body

```json
{
  "loginId": "operator01",
  "email": "operator01@example.com",
  "password": "1234",
  "name": "관리자01",
  "phone": "010-1111-2222",
  "storeName": "패션스토어 루미",
  "category": "의류",
  "description": "트렌디한 의류 전문 스토어",
  "storePhone": "02-1234-5678",
  "address": "서울시 강남구 역삼동 123-4",
  "businessHours": "평일 09:00 ~ 18:00"
}
```

#### 검증 규칙

- `loginId`, `email`, `password`, `name`, `phone`, `storeName`, `category`는 필수다.
- `description`, `storePhone`, `address`, `businessHours`는 선택 입력으로 처리된다.
- `loginId`와 `email`은 중복될 수 없다.

#### 처리 흐름

1. 운영자 가입 요청을 검증한다.
2. 사용자 중복을 확인한다.
3. `app_user`에 `role = OPERATOR`로 운영자 계정을 생성한다.
4. `store`에 운영자 소유 스토어를 생성한다.
5. 트랜잭션을 commit한다.
6. 생성된 운영자 사용자를 반환한다.

#### 성공 응답

```json
{
  "message": "관리자 회원가입이 완료되었습니다.",
  "user": {
    "id": 2,
    "login_id": "operator01",
    "email": "operator01@example.com",
    "name": "관리자01",
    "phone": "010-1111-2222",
    "role": "OPERATOR",
    "status": "ACTIVE"
  }
}
```

#### 연결 파일

- 서버: `server/main.py`, `server/app/auth.py`, `server/app/validation.py`, `server/app/repositories.py`
- 클라이언트: `code/src/api/auth.js`, `code/src/pages/auth/RegisterPage.jsx`, `code/src/App.jsx`

### POST `/api/auth/login`

고객 또는 운영자가 로그인한다.

#### 인증

- 필요 없음

#### 요청 body

```json
{
  "loginId": "customer01",
  "password": "1234"
}
```

#### 검증 규칙

- `loginId`, `password`는 필수다.
- 사용자 없음 또는 비밀번호 불일치 시 `401`.
- 사용자 상태가 `ACTIVE`가 아니면 `403`.

#### 처리 흐름

1. 로그인 입력을 검증한다.
2. `loginId`로 사용자를 조회한다.
3. bcrypt로 비밀번호를 검증한다.
4. access token과 refresh token을 발급한다.
5. refresh token을 `refresh_token` 테이블에 저장한다.
6. 토큰과 사용자 정보를 반환한다.

#### 성공 응답

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": 1,
    "loginId": "customer01",
    "email": "customer01@example.com",
    "name": "customer01",
    "phone": "010-1234-5678",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

#### 클라이언트 동작

- `code/src/App.jsx`는 로그인 화면에서 선택한 역할과 응답의 `user.role`을 비교한다.
- 고객 로그인 탭에서 운영자 계정으로 로그인하면 클라이언트에서 차단한다.
- 운영자 로그인 탭에서 고객 계정으로 로그인하면 클라이언트에서 차단한다.
- 성공 시 access token과 refresh token을 localStorage에 저장한다.

### POST `/api/auth/refresh`

refresh token으로 access token과 refresh token을 재발급한다.

#### 인증

- Authorization header는 필요 없음
- body의 refresh token 사용

#### 요청 body

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

#### 검증 규칙

- `refreshToken`은 필수다.
- JWT 검증에 실패하면 `401`.
- DB에 활성 refresh token이 없으면 `401`.
- 사용자 정보가 없거나 비활성 상태면 `401`.

#### 처리 흐름

1. refresh token 문자열을 검증한다.
2. JWT refresh secret으로 token을 검증한다.
3. DB에서 `revoked_at IS NULL`인 token을 조회한다.
4. 기존 refresh token을 폐기한다.
5. 사용자 상태를 확인한다.
6. 새 access token과 refresh token을 발급한다.
7. 새 refresh token을 DB에 저장한다.
8. 새 토큰과 사용자 정보를 반환한다.

#### 성공 응답

`POST /api/auth/login`과 동일한 형태다.

### POST `/api/auth/logout`

refresh token을 폐기하여 로그아웃 처리한다.

#### 인증

- Authorization header는 필요 없음
- body의 refresh token 사용

#### 요청 body

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

#### 처리 흐름

1. refresh token 문자열을 검증한다.
2. `refresh_token.revoked_at`을 현재 시각으로 갱신한다.
3. 로그아웃 메시지를 반환한다.

#### 성공 응답

```json
{
  "message": "로그아웃되었습니다."
}
```

### GET `/api/auth/me`

현재 로그인한 사용자 정보를 조회한다.

#### 인증

- 필요
- `Authorization: Bearer {accessToken}`

#### 처리 흐름

1. Authorization header가 `Bearer `로 시작하는지 확인한다.
2. access token을 검증한다.
3. token payload의 `sub`로 사용자를 조회한다.
4. 운영자라면 `store` 정보도 함께 조회한다.

#### 고객 성공 응답

```json
{
  "user": {
    "id": 1,
    "loginId": "customer01",
    "email": "customer01@example.com",
    "name": "customer01",
    "phone": "010-1234-5678",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

#### 운영자 성공 응답

```json
{
  "user": {
    "id": 2,
    "loginId": "operator01",
    "email": "operator01@example.com",
    "name": "관리자01",
    "phone": "010-1111-2222",
    "role": "OPERATOR",
    "status": "ACTIVE",
    "store": {
      "id": 1,
      "owner_user_id": 2,
      "name": "패션스토어 루미",
      "category": "의류",
      "description": "트렌디한 의류 전문 스토어",
      "phone": "02-1234-5678",
      "address": "서울시 강남구 역삼동 123-4",
      "business_hours": "평일 09:00 ~ 18:00",
      "status": "ACTIVE"
    }
  }
}
```

## 4.3 고객 홈 API

### GET `/api/customer/home`

로그인한 고객의 홈 화면에 필요한 주문, 스토어, 문의 데이터를 한 번에 조회한다.

#### 인증

- 필요
- `Authorization: Bearer {accessToken}`

#### 접근 권한

- `CUSTOMER` 역할만 접근 가능
- 운영자 계정으로 접근하면 `403`

#### 처리 흐름

1. access token을 검증한다.
2. 사용자 id로 사용자를 조회한다.
3. 사용자 role이 `CUSTOMER`인지 확인한다.
4. 고객 주문 목록을 조회한다.
5. 고객이 주문했던 스토어 목록을 조회한다.
6. `support_session` 기반 상담 목록을 조회한다.
7. `inquiry_post` 기반 문의 게시글 목록을 조회한다.
8. 상담과 문의를 합쳐 `lastMessageAt` 기준 내림차순 정렬한다.
9. `orders`, `stores`, `inquiries`를 반환한다.

#### 성공 응답

```json
{
  "orders": [
    {
      "id": 1,
      "storeId": 1,
      "storeName": "패션스토어 루미",
      "orderNumber": "ORD-2026-029",
      "productName": "봄 자켓",
      "quantity": 1,
      "totalPrice": 132000,
      "orderedAt": "2026-04-08",
      "customerName": "customer01",
      "phone": "010-1234-5678"
    }
  ],
  "stores": [
    {
      "id": 1,
      "name": "패션스토어 루미",
      "category": "의류",
      "phone": "02-1234-5678",
      "address": "서울시 강남구 역삼동 123-4",
      "desc": "트렌디한 의류 전문 스토어",
      "operatingHours": "평일 09:00 ~ 18:00",
      "image": null,
      "banner": null
    }
  ],
  "inquiries": [
    {
      "id": "support-1",
      "storeId": 1,
      "storeName": "패션스토어 루미",
      "type": "상담",
      "status": "IN_PROGRESS",
      "title": "봄 자켓 사이즈 상담",
      "orderId": 1,
      "createdAt": "2026-04-08 14:30",
      "lastMessageAt": "2026-04-08 15:10",
      "messages": [
        {
          "id": 1,
          "sender": "customer",
          "content": "봄 자켓 사이즈 상담",
          "time": "2026-04-08 14:30"
        }
      ],
      "orderInfo": "봄 자켓 (ORD-2026-029)",
      "orderProductName": "봄 자켓",
      "customerName": "customer01"
    }
  ]
}
```

#### 데이터 출처

- 주문: `order_table`, `order_item`, `product`, `store`, `app_user`
- 스토어: `store`, `order_table`
- 상담: `support_session`, `support_message`
- 문의 게시글: `inquiry_post`, `inquiry_post_reply`

#### 클라이언트 사용 위치

- `code/src/api/customerHome.js`
- `code/src/pages/customer/CustomerApp.jsx`
- `code/src/pages/customer/MainPage.jsx`

## 5. 현재 DB에는 있으나 API는 아직 미구현인 기능

아래 기능들은 `schema.sql` 또는 기존 명세에 근거가 있지만, 현재 `server/main.py`에는 엔드포인트가 없다. 따라서 “계획 API”로 분류한다.

## 5.1 문의/상담 API

### 예정 엔드포인트

- `GET /api/inquiries`: 문의 목록 조회
- `POST /api/inquiries`: 문의 생성
- `GET /api/inquiries/{inquiryId}`: 문의 상세 조회
- `POST /api/inquiries/{inquiryId}/messages`: 고객/운영자 메시지 추가
- `PATCH /api/inquiries/{inquiryId}/status`: 문의 상태 변경
- `POST /api/inquiries/{inquiryId}/notes`: 운영자 내부 메모 추가

### 기능 목적

고객 문의 생성부터 운영자 응답, 상태 변경까지 이어지는 제품의 핵심 흐름을 API로 제공한다.

### 주요 요청/응답 필드

#### 문의 생성 요청 예시

```json
{
  "storeId": 1,
  "orderId": 110,
  "type": "ORDER",
  "title": "봄 자켓 소재 정보 요청",
  "content": "봄 자켓 소재와 세탁 가능 여부가 궁금합니다.",
  "isSecret": false
}
```

#### 문의 목록 응답 예시

```json
{
  "inquiries": [
    {
      "id": 6,
      "storeId": 1,
      "storeName": "패션스토어 루미",
      "type": "문의",
      "status": "IN_PROGRESS",
      "title": "봄 자켓 소재 정보 요청",
      "orderId": 110,
      "lastMessageAt": "2026-04-08 15:00"
    }
  ]
}
```

### 관련 DB

- `inquiry_post`
- `inquiry_post_image`
- `inquiry_post_reply`
- `support_session`
- `support_message`
- `support_message_image`

### 화면 연결

- 고객: `StorePage`, `ConsultTab`, `BoardTab`, `MyInquiryTab`, `InquiryDetailPage`
- 운영자: `OperatorMain`, `ChannelPage`, `OperatorInquiryDetail`

## 5.2 챗봇 및 handoff API

### 예정 엔드포인트

- `POST /api/chatbot/sessions`: 챗봇 세션 시작
- `GET /api/chatbot/sessions/{sessionId}`: 챗봇 세션 조회
- `POST /api/chatbot/sessions/{sessionId}/messages`: 챗봇 메시지 추가 및 응답 생성
- `POST /api/chatbot/sessions/{sessionId}/handoff`: 상담사 연결 요청

### 기능 목적

고객이 먼저 self-service 챗봇을 사용하고, 해결되지 않을 때 운영자 상담으로 전환한다.

### handoff 처리 규칙

- 하나의 `chatbot_session`은 최대 하나의 상담 또는 문의와 연결한다.
- 같은 세션에서 handoff를 반복 요청하면 새 문의를 계속 만들지 않고 기존 연결 문의를 반환한다.
- 운영자 화면에서는 챗봇 대화 요약 또는 최근 메시지 맥락을 확인할 수 있어야 한다.

### 관련 DB

- `chatbot_session`
- `chatbot_message`
- `chatbot_message_image`
- `support_session`

### 현재 화면 상태

- `ChatbotTab.jsx`는 로컬 상태와 `MOCK_FAQ` 기반으로 작동한다.
- `ConsultTab.jsx`는 챗봇 히스토리를 받아 로컬 상담 객체를 생성한다.
- 서버 API 연결은 아직 없다.

## 5.3 지식 자산 API

### 예정 엔드포인트

- `GET /api/stores/{storeId}/faqs`: FAQ 목록 조회
- `POST /api/stores/{storeId}/faqs`: FAQ 생성
- `PATCH /api/faqs/{faqId}`: FAQ 수정
- `DELETE /api/faqs/{faqId}`: FAQ 삭제
- `GET /api/stores/{storeId}/response-presets`: 응답 프리셋 목록 조회
- `POST /api/stores/{storeId}/response-presets`: 응답 프리셋 생성
- `POST /api/stores/{storeId}/knowledge-files`: 챗봇 지식 파일 업로드
- `GET /api/stores/{storeId}/knowledge-files`: 활성 지식 파일 목록 조회

### 기능 목적

운영자가 반복 답변과 챗봇 기반 지식을 관리할 수 있게 한다.

### 관련 DB

- `faq`
- `response_preset`
- `chatbot_knowledge_file`

### 현재 화면 상태

- 고객 챗봇은 `MOCK_FAQ`를 사용한다.
- 운영자 상세 화면에는 빠른 답변 프리셋 UI가 있지만 서버 저장은 없다.

## 5.4 안전 보조 및 요약 API

### 예정 엔드포인트

- `POST /api/ai/inquiries/{inquiryId}/summary`: 문의 요약 생성
- `POST /api/ai/chatbot-sessions/{sessionId}/summary`: 챗봇 세션 요약 생성
- `POST /api/ai/messages/{messageId}/safety-check`: 악성 표현 감지

### 기능 목적

긴 대화를 빠르게 이해하고, 과격하거나 민감한 표현을 운영자에게 보조 신호로 알려준다.

### 단순화 원칙

- AI는 운영자를 대체하지 않고 보조한다.
- 원문은 삭제하지 않는다.
- 고객 노출용 표시 완화가 필요하면 `content_raw`와 `content_display`를 분리한다.

### 현재 화면 상태

- `OperatorMain.jsx`와 `OperatorInquiryDetail.jsx`는 `generateAISummary` 또는 하드코딩 문구로 요약을 표시한다.
- 서버 API는 아직 없다.

## 5.5 검색 및 지표 API

### 예정 엔드포인트

- `GET /api/operator/inquiries/search`: 문의 검색
- `GET /api/operator/metrics/summary`: KPI 요약 조회
- `GET /api/stores/{storeId}/stats/daily`: 일별 통계 조회

### 기능 목적

운영자가 문의를 빠르게 찾고 기본 운영 상태를 확인한다.

### 검색 조건 예시

- 고객명
- 주문번호
- 상품명
- 문의 상태
- 문의 유형
- 기간

### 관련 DB

- `support_session`
- `support_message`
- `inquiry_post`
- `order_table`
- `product`
- `store_stat_daily`

### 현재 화면 상태

- `OperatorMain.jsx`, `StatsPage.jsx`, `ChannelPage.jsx`는 mock data 기반으로 KPI와 목록을 계산한다.
- 서버 API는 아직 없다.

## 5.6 커머스 맥락 API

### 예정 엔드포인트

- `GET /api/customers/me/orders`: 내 주문 목록 조회
- `GET /api/customers/me/stores`: 내 주문 스토어 목록 조회
- `GET /api/orders/{orderId}`: 주문 상세 snapshot 조회
- `GET /api/products/{productId}`: 상품 snapshot 조회
- `POST /api/commerce/sync`: 수동 재동기화 요청

### 기능 목적

문의 처리에 필요한 고객, 주문, 상품 맥락을 화면에 제공한다.

### 현재 구현과의 관계

- `GET /api/customer/home`이 주문과 스토어 맥락을 한 번에 내려주는 단순 API 역할을 한다.
- 별도 주문 상세, 상품 상세, 수동 동기화 API는 아직 없다.

## 5.7 주문 claim/link 및 mock verification API

### 예정 엔드포인트

- `GET /api/claims/order-candidates`: 주문 claim 후보 조회
- `POST /api/claims/orders`: 주문 claim 요청
- `GET /api/claims/{claimId}`: claim 상태 조회
- `POST /api/mock-verifications`: mock verification 요청
- `POST /api/mock-verifications/{verificationId}/confirm`: mock verification 결과 확인

### 기능 목적

신규 가입 고객이 외부 주문 snapshot을 로컬 계정과 연결할 수 있게 한다.

### 중요한 설계 원칙

- 로컬 로그인 계정과 외부 customer/order/product snapshot은 처음부터 같은 것으로 취급하지 않는다.
- 주문번호와 낮은 민감도의 고객 정보 힌트로 먼저 claim을 시도한다.
- mock verification은 실제 통신사/법적 본인확인이 아니라 학교 프로젝트용 시뮬레이션이다.

### 현재 구현 상태

- 관련 API는 아직 없다.
- `schema.sql`의 현재 테이블은 demo customer/order/product 중심이며, 별도 claim/link 테이블은 아직 구현되지 않았다.

## 6. 기능별 구현 우선순위 제안

1. 현재 구현된 인증 API 안정화
2. 현재 구현된 고객 홈 API를 기준으로 고객 주문/스토어/문의 조회 분리 여부 결정
3. 고객 문의 생성 및 메시지 추가 API 구현
4. 운영자 문의 목록/상세/응답/상태 변경 API 구현
5. 챗봇 세션 및 handoff API 구현
6. FAQ/프리셋/지식 파일 API 구현
7. 검색 및 지표 API 구현
8. claim/link와 mock verification API 구현

## 7. 현재 구현 기준 최종 API 목록

| 구분 | Method | Path | 구현 상태 | 인증 | 설명 |
|---|---:|---|---|---|---|
| 상태 | GET | `/api/health` | 구현됨 | 불필요 | 서버 상태 확인 |
| 인증 | POST | `/api/auth/signup/customer` | 구현됨 | 불필요 | 고객 회원가입 |
| 인증 | POST | `/api/auth/signup/operator` | 구현됨 | 불필요 | 운영자 회원가입 및 스토어 생성 |
| 인증 | POST | `/api/auth/login` | 구현됨 | 불필요 | 로그인 및 토큰 발급 |
| 인증 | POST | `/api/auth/refresh` | 구현됨 | 불필요 | 토큰 재발급 |
| 인증 | POST | `/api/auth/logout` | 구현됨 | 불필요 | refresh token 폐기 |
| 인증 | GET | `/api/auth/me` | 구현됨 | 필요 | 현재 사용자 조회 |
| 고객 홈 | GET | `/api/customer/home` | 구현됨 | 필요 | 고객 홈 데이터 통합 조회 |
| 문의 | 다수 | `/api/inquiries...` | 예정 | 필요 | 문의/상담 생성, 조회, 메시지, 상태 |
| 챗봇 | 다수 | `/api/chatbot...` | 예정 | 필요 | 챗봇 세션, 메시지, handoff |
| 지식 | 다수 | `/api/stores/{storeId}/faqs...` | 예정 | 필요 | FAQ, 프리셋, 지식 파일 |
| AI 보조 | 다수 | `/api/ai...` | 예정 | 필요 | 요약, 안전 보조 |
| 검색/지표 | 다수 | `/api/operator...` | 예정 | 필요 | 문의 검색, KPI 조회 |
| 커머스 | 다수 | `/api/orders...`, `/api/products...` | 예정 | 필요 | 주문/상품 snapshot 조회 |
| claim/link | 다수 | `/api/claims...` | 예정 | 필요 | 외부 주문과 로컬 계정 연결 |
