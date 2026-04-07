# Customer Portal / Handoff API 상세 명세

## 1. 문서 목적

본 문서는 `Customer Portal / Handoff` 로직을 customer-facing HTTP/API 계약으로 번역한 명세를 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- customer inquiry 목록/상세 조회 API
- customer inquiry 생성 API
- customer inquiry message append API
- chatbot session 시작/조회 API
- chatbot message append API
- handoff 요청 API
- expired session 처리 규칙
- customer-visible response shape

이 문서는 아래를 직접 다루지 않는다.

- operator-facing API
- DB 구현 상세
- chatbot answer generation 내부 로직
- inquiry lifecycle의 최종 authority

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- customer endpoint 정의
- request / response shape
- ownership / auth rule
- handoff request contract
- expired session response 정책

## 2.2 직접 다루지 않는 것

- operator app API
- integration boundary API
- summary / abuse detection API
- DB 스키마 구현

## 3. API Domain Split

## 3.1 Inquiry API

### 역할
- customer가 본인 inquiry를 생성/조회/메시지 append 하는 API

### 포함 기능
- inquiry 목록 조회
- inquiry 상세 조회
- inquiry 생성
- inquiry message append

### 특징
- customer-visible projection만 반환
- inquiry lifecycle 최종 authority는 가지지 않음

## 3.2 Chatbot API

### 역할
- customer가 chatbot session을 시작하고 사용하며 handoff를 요청하는 API

### 포함 기능
- chatbot session 시작
- chatbot session 조회
- chatbot message append
- handoff 요청

### 특징
- chatbot session은 inquiry와 별도 resource
- expired session은 read-only
- handoff는 inquiry 생성 또는 기존 linked inquiry 연결

## 3.3 경계 규칙

- Inquiry API는 customer가 inquiry를 직접 다루는 경계다.
- Chatbot API는 inquiry 이전 self-service 경계다.
- handoff는 두 경계를 잇는 transition action이다.

## 4. Resource Set

## 4.1 Inquiry resources

- `GET /customer/inquiries`
- `GET /customer/inquiries/{id}`
- `POST /customer/inquiries`
- `POST /customer/inquiries/{id}/messages`

## 4.2 Chatbot resources

- `POST /customer/chatbot-sessions`
- `GET /customer/chatbot-sessions/{id}`
- `POST /customer/chatbot-sessions/{id}/messages`
- `POST /customer/chatbot-sessions/{id}/handoff`

## 5. Common API Rules

## 5.1 인증 / 권한 규칙

- 모든 customer API는 세션 기반 인증 필요
- customer는 본인 inquiry / 본인 chatbot session만 접근 가능

## 5.2 응답 기본 구조

- `data`
- `meta`
- `error`

## 5.3 customer-visible scope 반환 규칙

- 본문은 `content_display` 기준
- raw는 customer-visible conversation scope 안에서만 제공 가능
- internal note는 절대 포함하지 않음
- operator-only 판단 데이터는 포함하지 않음

## 5.4 attachment 반환 규칙

- binary보다 metadata 중심 반환
- 예:
  - `file_name`
  - `mime_type`
  - `file_size`
  - `preview_available`
  - `download_available`

## 5.5 expired chatbot session 반환 규칙

- expired chatbot session은 읽기만 허용
- append / 새 handoff 요청은 거절
- read-only 상태는 `meta`로 함께 제공 가능

## 5.6 handoff idempotency 규칙

- 같은 `chatbot_session`에서 이미 linked inquiry가 있으면 새 inquiry를 만들지 않음
- handoff 요청은 기존 inquiry로 연결하는 idempotent 처리

## 5.7 기본 HTTP 규칙

- `400` validation error
- `403` forbidden
- `404` not found
- `409` conflict (필요 시)

expired chatbot session은 우선 read-only resource 상태로 해석하는 것이 기본이다.

## 6. Request / Response Shape

## 6.1 `GET /customer/inquiries`

### query 예시
- `period_preset`
- `page`
- `size`

### response shape 예시
```json
{
  "data": [
    {
      "inquiry_id": "inq_123",
      "status": "IN_PROGRESS",
      "last_message_at": "2026-04-06T10:20:00+09:00",
      "has_order_summary": true,
      "has_product_summary": true
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "total": 1
  },
  "error": null
}
```

## 6.2 `GET /customer/inquiries/{id}`

### response shape 예시
```json
{
  "data": {
    "inquiry": {
      "id": "inq_123",
      "status": "IN_PROGRESS",
      "inquiry_type": "DELIVERY",
      "opened_at": "2026-04-06T09:00:00+09:00"
    },
    "messages": [],
    "order_summary": {},
    "product_summary": {},
    "detail_expansion_available": true
  },
  "meta": {
    "summary_unavailable": false
  },
  "error": null
}
```

## 6.3 `POST /customer/inquiries`

### request shape 예시
```json
{
  "inquiry_type": "DELIVERY",
  "initial_message": "배송이 늦어지고 있습니다.",
  "order_id": "ord_ref_1",
  "product_id": null,
  "attachments": []
}
```

### 핵심 원칙
- 일반 customer inquiry 생성에서는 `initial_message` 필수

### response shape 예시
```json
{
  "data": {
    "inquiry_id": "inq_123",
    "status": "OPEN"
  },
  "meta": null,
  "error": null
}
```

## 6.4 `POST /customer/inquiries/{id}/messages`

### request shape 예시
```json
{
  "content_raw": "추가 확인 부탁드립니다.",
  "attachments": []
}
```

### response shape 예시
```json
{
  "data": {
    "message_id": "msg_201",
    "inquiry_id": "inq_123",
    "sender_type": "CUSTOMER",
    "content_display": "추가 확인 부탁드립니다.",
    "created_at": "2026-04-06T10:30:00+09:00"
  },
  "meta": null,
  "error": null
}
```

## 6.5 `POST /customer/chatbot-sessions`

### response shape 예시
```json
{
  "data": {
    "chatbot_session_id": "cbs_1",
    "session_status": "ACTIVE",
    "started_at": "2026-04-06T10:00:00+09:00"
  },
  "meta": null,
  "error": null
}
```

## 6.6 `GET /customer/chatbot-sessions/{id}`

### response shape 예시
```json
{
  "data": {
    "chatbot_session": {
      "id": "cbs_1",
      "session_status": "ACTIVE",
      "last_message_at": "2026-04-06T10:05:00+09:00"
    },
    "messages": [],
    "handoff_available": true
  },
  "meta": {
    "read_only": false
  },
  "error": null
}
```

### 만료 시
- `meta.read_only = true`
- 새 세션 시작 유도 가능

## 6.7 `POST /customer/chatbot-sessions/{id}/messages`

### request shape 예시
```json
{
  "content_raw": "배송은 언제 오나요?",
  "attachments": []
}
```

### 핵심 규칙
- 만료된 session에는 append 불가

## 6.8 `POST /customer/chatbot-sessions/{id}/handoff`

### response shape 예시
```json
{
  "data": {
    "inquiry_id": "inq_123",
    "linked_chatbot_session_id": "cbs_1"
  },
  "meta": {
    "idempotent": true
  },
  "error": null
}
```

### 핵심 규칙
- 기존 linked inquiry가 있으면 새 inquiry 생성 안 함
- 기존 inquiry로 연결

## 7. Validation / Rejection Case Detail

## 7.1 `400 Bad Request`

적용 예:
- blank message
- message length 초과
- invalid attachment 형식
- attachment 3장 초과
- attachment 5MB 초과
- 일반 inquiry 생성에서 `initial_message` 누락

### response 예시
```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다."
  }
}
```

## 7.2 `403 Forbidden`

적용 예:
- 다른 customer inquiry 접근
- 다른 customer chatbot session 접근

## 7.3 `404 Not Found`

적용 예:
- 존재하지 않는 inquiry
- 존재하지 않는 chatbot session

## 7.4 expired chatbot session 처리

- 읽기는 허용
- append / handoff는 거절
- 조회는 `200 OK` + `meta.read_only=true`로 처리 가능

## 7.5 duplicate handoff 처리

- 중복 handoff는 에러가 아님
- 기존 inquiry로 연결
- `meta.idempotent=true` 가능

## 8. Customer-facing Projection Detail

## 8.1 Customer inquiry list projection

### 최소 필드
- `inquiry_id`
- customer-visible status
- 최근 메시지 시각
- order/product summary 존재 여부

## 8.2 Customer inquiry detail projection

### 포함 요소
- inquiry 상태
- inquiry message timeline
- attachment metadata
- customer-visible order/product summary
- `[상세 보기]` 확장 가능 필드

### 제외 요소
- internal note
- operator-only 판단 정보
- internal processing intermediate data

## 8.3 Customer chatbot session projection

### 포함 요소
- session id
- session status
- chatbot message timeline
- handoff 가능 여부
- read-only 여부

### 규칙
- expired session은 읽기 허용
- append / handoff는 금지

## 8.4 Customer-visible order/product summary

### 기본 표시
- order 번호 요약
- product 이름 요약
- inquiry와 연결된 핵심 요약

### 확장 표시
- `[상세 보기]`로 더 자세한 정보 노출

## 8.5 content rendering rule

- 기본은 `content_display`
- 필요 시 customer-visible scope 안에서만 raw 확인 가능

## 8.6 Attachment projection rule

### 포함 요소
- `file_name`
- `mime_type`
- `file_size`
- `preview_available`
- `download_available`

### preview 원칙
- 썸네일
- 클릭 확대
- 실패 시 다운로드 fallback

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- expired session append/handoff 거절 코드 세부 (`400` vs `409`)
- customer-visible status wording
- customer session list retention/표시 기간
- detail expansion field 세부 구성
