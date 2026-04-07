# Case Management API 상세 명세

## 1. 문서 목적

본 문서는 `Case Management` 로직을 HTTP/API 계약으로 번역한 명세를 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- inquiry 목록/상세 조회 API
- operator 메시지 append API
- internal note append API
- assignment API
- status change API
- reopen API
- operator-facing 응답 규칙
- validation / rejection / conflict 응답 규칙

이 문서는 아래를 직접 다루지 않는다.

- DB 구현 상세
- UI 컴포넌트 구조
- external snapshot sync API 자체

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- endpoint 정의
- request shape
- response shape
- auth scope
- validation / rejection response
- degraded context response 규칙

## 2.2 직접 다루지 않는 것

- DB 테이블 구현
- customer portal handoff API
- customer-facing inquiry endpoint ownership
- integration boundary API
- summary / abuse detection API

## 3. API Domain Split

## 3.1 Operator-facing API

### 역할
- 운영자가 inquiry를 조회/처리/변경하는 API

### 포함 기능
- inquiry 목록 조회
- inquiry 상세 조회
- operator message append
- internal note append
- assignment 변경
- 상태 변경
- reopen
- relation 관리

### 특징
- `internal_notes` 포함 가능
- degraded snapshot 정보 포함 가능
- full operator context 제공

## 3.2 Customer-facing inquiry API reference boundary

### 역할
- customer-facing inquiry endpoint ownership이 어디에 있는지 경계를 명시하는 참조 섹션

### 포함 기능
- customer inquiry 목록/상세/생성/message append endpoint는 `Customer Portal / Handoff API`가 소유한다.

### 특징
- customer-visible scope만 반환한다.
- internal note와 operator-only 판단 정보는 직접 소유하지 않는다.

## 3.3 경계 원칙

- 같은 inquiry라도 operator/customer response shape는 다를 수 있다.
- operator는 `case_context_bundle`에 가까운 응답을 받는다.
- customer-facing inquiry detail의 최종 계약은 `Customer Portal / Handoff API`를 우선 기준으로 유지한다.

## 4. Resource Set

## 4.1 Operator resources

- `GET /operator/inquiries`
- `GET /operator/inquiries/{id}`
- `POST /operator/inquiries/{id}/messages`
- `POST /operator/inquiries/{id}/notes`
- `PATCH /operator/inquiries/{id}/assignment`
- `PATCH /operator/inquiries/{id}/status`
- `POST /operator/inquiries/{id}/reopen`
- `POST /operator/inquiries/{id}/relations`

## 4.2 Customer resources reference

- customer inquiry resources는 `Customer Portal / Handoff API`를 우선 기준으로 유지한다.

## 5. Common API Rules

## 5.1 인증 / 권한 규칙

### operator API
- 세션 기반 인증 필요
- operator role 필요

### customer-facing reference
- customer-facing inquiry auth/ownership 규칙은 `Customer Portal / Handoff API`를 우선 기준으로 유지한다.

## 5.2 응답 기본 구조

기본 응답 형태:

- `data`
- `meta`
- `error`

## 5.3 raw/display 반환 규칙

- 메시지 기본 출력은 `content_display`
- raw는 customer-visible conversation scope 안에서만 별도 필드 또는 action으로 노출

## 5.4 degraded context 반환 규칙

### operator API
- linked snapshot 누락/오래됨/조회 실패를 `meta` 또는 summary field로 함께 반환 가능

### customer-facing reference
- customer-facing summary exposure와 unavailable summary 처리 방식은 `Customer Portal / Handoff API`를 우선 기준으로 유지한다.

## 5.5 validation / rejection HTTP 규칙

기본 후보:

- `400` validation error
- `403` forbidden
- `404` not found
- `409` conflict

## 5.6 attachment 반환 규칙

- attachment는 파일 binary 자체보다 metadata 중심으로 응답
- 예:
  - `file_name`
  - `mime_type`
  - `file_size`
  - `preview_available`
  - `download_available`

## 5.7 list / detail 차이 규칙

- list API: lightweight projection
- detail API: full context projection

## 6. Request / Response Shape

## 6.1 `GET /operator/inquiries`

### query 예시
- `status`
- `inquiry_type`
- `customer_name`
- `order_number`
- `product_name`
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
      "inquiry_type": "DELIVERY",
      "customer_name": "홍길동",
      "order_number": "ORD-1001",
      "product_name": "상품A",
      "last_message_at": "2026-04-06T10:20:00+09:00",
      "last_response_at": "2026-04-06T10:15:00+09:00",
      "has_linked_chatbot_session": true,
      "degraded_snapshot_state": null
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "total": 1,
    "period_preset": "last_7_days",
    "timezone": "Asia/Seoul"
  },
  "error": null
}
```

## 6.2 `GET /operator/inquiries/{id}`

### response shape 예시
```json
{
  "data": {
    "inquiry": {
      "id": "inq_123",
      "status": "IN_PROGRESS",
      "inquiry_type": "DELIVERY",
      "inquiry_channel": "CUSTOMER_PORTAL",
      "assigned_operator_id": "op_1",
      "opened_at": "2026-04-06T09:00:00+09:00",
      "last_message_at": "2026-04-06T10:20:00+09:00",
      "last_response_at": "2026-04-06T10:15:00+09:00"
    },
    "messages": [],
    "internal_notes": [],
    "customer_summary": {},
    "order_summary": {},
    "product_summary": {},
    "linked_chatbot_session": {
      "session_id": "cbs_1",
      "available": true
    }
  },
  "meta": {
    "degraded_snapshot_state": null
  },
  "error": null
}
```

## 6.3 `POST /operator/inquiries/{id}/messages`

### request shape 예시
```json
{
  "content_raw": "안녕하세요. 확인해보겠습니다.",
  "attachments": []
}
```

### response shape 예시
```json
{
  "data": {
    "message_id": "msg_101",
    "inquiry_id": "inq_123",
    "sender_type": "OPERATOR",
    "content_display": "안녕하세요. 확인해보겠습니다.",
    "created_at": "2026-04-06T10:21:00+09:00"
  },
  "meta": null,
  "error": null
}
```

## 6.4 `POST /operator/inquiries/{id}/notes`

### request shape 예시
```json
{
  "content": "배송 이력 추가 확인 필요"
}
```

### response shape 예시
```json
{
  "data": {
    "note_id": "note_1",
    "inquiry_id": "inq_123",
    "created_at": "2026-04-06T10:22:00+09:00"
  },
  "meta": null,
  "error": null
}
```

## 6.5 `PATCH /operator/inquiries/{id}/assignment`

### request shape 예시
```json
{
  "assigned_operator_id": "op_2"
}
```

### response shape 예시
```json
{
  "data": {
    "inquiry_id": "inq_123",
    "assigned_operator_id": "op_2"
  },
  "meta": null,
  "error": null
}
```

## 6.6 `PATCH /operator/inquiries/{id}/status`

### request shape 예시
```json
{
  "target_status": "ON_HOLD",
  "reason_code": "WAITING_CUSTOMER_INPUT",
  "memo": "추가 자료 대기"
}
```

### response shape 예시
```json
{
  "data": {
    "inquiry_id": "inq_123",
    "from_status": "IN_PROGRESS",
    "to_status": "ON_HOLD",
    "changed_at": "2026-04-06T10:23:00+09:00"
  },
  "meta": null,
  "error": null
}
```

## 6.7 `POST /operator/inquiries/{id}/reopen`

### response shape 예시
```json
{
  "data": {
    "inquiry_id": "inq_123",
    "status": "IN_PROGRESS",
    "assigned_operator_id": null
  },
  "meta": null,
  "error": null
}
```

### 핵심 원칙
- 수동 재오픈 시 `assigned_operator_id`는 `null`

## 6.8 `GET /customer/inquiries`

### 특징
- customer-visible summary만 포함
- internal note 없음
- operator-only 판단 정보 없음

## 6.9 `GET /customer/inquiries/{id}`

### 특징
- 상태
- 대화 내용
- customer-visible order/product summary
- `[상세 보기]` 확장용 필드 가능

## 6.10 `POST /customer/inquiries`

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

## 6.11 `POST /customer/inquiries/{id}/messages`

### 핵심 원칙
- 본인 inquiry만 허용
- `RESOLVED` inquiry에 새 메시지면 reopen trigger 가능

## 7. Validation / Conflict Case Detail

## 7.1 `400 Bad Request`

적용 예:

- blank message
- message length 초과
- invalid attachment 형식
- attachment 개수 초과
- invalid status reason 조합
- 허용되지 않은 `period_preset`

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
- customer의 상태 변경 시도
- 권한 없는 operator action

## 7.3 `404 Not Found`

적용 예:

- 존재하지 않는 inquiry 조회
- append 대상 inquiry 없음
- reopen 대상 inquiry 없음

## 7.4 `409 Conflict`

적용 예:

- 상태 변경 충돌
- assignment 변경 충돌
- 이미 먼저 반영된 변경을 기준으로 한 mutation 요청

### 핵심 원칙
- 메시지 append는 가능한 한 conflict로 막지 않음
- 상태 mutation만 보수적으로 conflict 처리

## 7.5 degraded context는 오류가 아님

- linked snapshot 누락
- stale snapshot
- linked chatbot session 로딩 실패

이 경우 `200 OK` 안에서 degraded 상태를 반환한다.

## 8. List / Detail Projection Detail

## 8.1 Operator list projection

### 최소 필드
- `inquiry_id`
- `status`
- `inquiry_type`
- `customer_name`
- `order_number`
- `product_name`
- `last_message_at`
- `last_response_at`
- `degraded_snapshot_state`
- `has_linked_chatbot_session`

## 8.2 Operator detail projection

### 최소 필드
- inquiry 본문 정보
- 전체 message timeline
- internal note 목록
- customer/order/product summary
- linked chatbot session 정보
- degraded 상태 정보

## 8.3 Customer list projection

### 최소 필드
- `inquiry_id`
- customer-visible status
- 최근 메시지 시각
- order/product summary 존재 여부

## 8.4 Customer detail projection

### 최소 필드
- 상태
- 대화 내용
- attachment metadata
- customer-visible order/product summary
- `[상세 보기]` 확장 가능 필드

### 제외
- internal note
- operator-only 판단 데이터
- internal processing data

## 8.5 Projection consistency rule

- 같은 inquiry라도 operator/customer projection은 다르다.
- 하지만 공통 기본값은 유지한다.
  - `content_display`
  - attachment metadata 중심 반환
  - degraded 상태는 숨기지 않되 표현 범위를 나눈다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강할 local detail이다.

- relation 관리 endpoint 세부 동작
- degraded 상태 meta field naming
- customer-visible status wording
- pagination 정책 세부
