# Conversation / Attachments API 상세 명세

## 1. 문서 목적

본 문서는 `Conversation / Attachments` 로직을 message/attachment 중심 HTTP/API 계약으로 번역한 명세를 정의한다.

이 문서는 기존 endpoint의 전체 계약을 다시 소유하지 않는다. 이미 `Case Management API`, `Customer Portal / Handoff API`가 소유하는 endpoint 중에서 **message/attachment 부분의 공통 계약만 표준화**하며, endpoint 존재 자체와 비-message 필드는 각 소유 문서를 우선 기준으로 유지한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- inquiry message 조회 / append API
- chatbot message 조회 / append API
- message detail 안의 attachment metadata 반환 규칙
- preview / download availability 표현 규칙
- raw / display 노출 규칙
- expired chatbot session의 read-only 처리
- validation / rejection / degraded 응답 규칙

이 문서는 아래를 직접 다루지 않는다.

- inquiry lifecycle 자체
- handoff 생성 정책 자체
- summary 생성 API
- abuse detection 알고리즘 자체
- DB 구현 상세
- UI 컴포넌트 구조

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- message endpoint 정의
- message request / response shape
- attachment projection 규칙
- preview / download availability 표현
- raw visibility API 표현
- validation / rejection response
- expired chatbot session mutation 제한 규칙

## 2.2 직접 다루지 않는 것

- inquiry 상태 전이 자체
- chatbot handoff 생성 / idempotency 상세
- summary / abuse detection write path
- DB 테이블 구현
- UI layout / thumbnail style 세부

## 3. API Domain Split

## 3.1 Inquiry Message API

### 역할
- human-handled inquiry 내부 메시지를 조회하고 append 하는 API

### 포함 기능
- inquiry message timeline 조회
- customer inquiry message append
- operator inquiry message append

### 특징
- 같은 inquiry라도 operator/customer projection 범위가 다를 수 있다.
- message 기본 출력은 `content_display`다.
- attachment는 message에 종속된 metadata로 반환한다.

## 3.2 Chatbot Message API

### 역할
- `chatbot_session` 내부 메시지를 조회하고 customer message를 append 하는 API

### 포함 기능
- chatbot message timeline 조회
- customer chatbot message append

### 특징
- `chatbot_session`은 inquiry와 별도 resource다.
- expired session은 read-only다.
- chatbot message도 `content_display`를 기본 출력으로 사용한다.

## 3.3 Attachment Access in Message Context

### 역할
- attachment를 독립 aggregate/resource가 아니라 message 부속 자원으로 해석하는 API 표현 규칙

### 포함 기능
- attachment metadata 반환
- `preview_available` / `download_available` 반환
- preview failure의 degraded 표현

### 특징
- attachment 전용 first-class resource endpoint는 현재 MVP에서 만들지 않는다.
- attachment 접근은 message detail 안의 field 또는 action/link 수준으로 표현한다.

## 3.4 경계 규칙

- inquiry message와 chatbot message는 저장 모델과 owner context를 분리 유지한다.
- attachment는 항상 특정 message owner에 종속된다.
- raw visibility는 customer-visible conversation scope 안에서만 허용된다.

## 4. Resource Set

## 4.1 Inquiry message resources

- `GET /customer/inquiries/{id}`
- `POST /customer/inquiries/{id}/messages`
- `GET /operator/inquiries/{id}`
- `POST /operator/inquiries/{id}/messages`

## 4.2 Chatbot message resources

- `GET /customer/chatbot-sessions/{id}`
- `POST /customer/chatbot-sessions/{id}/messages`

## 4.3 Attachment access expression

- attachment는 독립 endpoint보다 message detail 내부 field/action으로 표현
- attachment별 `preview_available` 반환
- attachment별 `download_available` 반환
- 필요 시 download는 참조 가능한 action/link 수준으로만 기술

## 5. Common API Rules

## 5.1 인증 / 권한 규칙

### operator inquiry message API
- 세션 기반 인증 필요
- operator role 필요

### customer inquiry / chatbot API
- 세션 기반 인증 필요
- customer는 본인 inquiry / 본인 chatbot session만 접근 가능

## 5.2 응답 기본 구조

기본 응답 형태:

- `data`
- `meta`
- `error`

## 5.3 raw / display 반환 규칙

- message 기본 출력은 `content_display`
- raw는 허용된 scope 안에서만 optional field 또는 action으로 노출
- internal-only data는 raw visibility 대상이 아니다.

## 5.4 message input validation 규칙

- 저장 전 trim을 적용한다.
- trim 후 빈 문자열이면 거절한다.
- customer/operator message는 최대 2000자를 허용한다.

## 5.5 attachment 반환 규칙

- attachment는 binary 자체보다 metadata 중심으로 응답한다.
- 예:
  - `attachment_id`
  - `file_name`
  - `mime_type`
  - `file_size`
  - `preview_status`
  - `preview_available`
  - `download_available`

## 5.6 expired chatbot session 반환 규칙

- expired chatbot session은 읽기만 허용한다.
- append는 거절한다.
- read-only 상태는 `meta.read_only=true`로 함께 제공할 수 있다.

## 5.7 preview failure 반환 규칙

- preview failure는 request 자체 실패가 아니다.
- attachment 단위 degraded 상태로 반환한다.
- timeline/message 본문은 계속 반환한다.

## 5.8 기본 HTTP 규칙

- `400` validation error
- `403` forbidden
- `404` not found
- `409` conflict (필요 시)

message append는 가능한 한 보수적 conflict 처리보다 validation/ownership 검증 중심으로 다룬다.

## 6. Request / Response Shape

## 6.1 `GET /customer/inquiries/{id}`

### response shape 예시
```json
{
  "data": {
    "inquiry": {
      "id": "inq_123",
      "status": "IN_PROGRESS",
      "opened_at": "2026-04-06T09:00:00+09:00"
    },
    "messages": [
      {
        "message_id": "msg_201",
        "sender_type": "CUSTOMER",
        "created_at": "2026-04-06T10:30:00+09:00",
        "content_display": "사진 확인 부탁드립니다.",
        "raw_available": true,
        "attachments": [
          {
            "attachment_id": "att_1",
            "file_name": "photo1.jpg",
            "mime_type": "image/jpeg",
            "file_size": 314572,
            "preview_status": "READY",
            "preview_available": true,
            "download_available": true
          }
        ]
      }
    ]
  },
  "meta": null,
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
      "assigned_operator_id": "op_1",
      "opened_at": "2026-04-06T09:00:00+09:00"
    },
    "messages": [
      {
        "message_id": "msg_202",
        "sender_type": "OPERATOR",
        "created_at": "2026-04-06T10:32:00+09:00",
        "content_display": "이미지 확인 중입니다.",
        "raw_available": true,
        "attachments": []
      }
    ]
  },
  "meta": null,
  "error": null
}
```

## 6.3 `POST /customer/inquiries/{id}/messages`

### request shape 예시
```json
{
  "content_raw": "추가 이미지를 첨부합니다.",
  "attachments": [
    {
      "file_name": "photo1.jpg",
      "mime_type": "image/jpeg",
      "file_size": 314572
    }
  ]
}
```

### response shape 예시
```json
{
  "data": {
    "message_id": "msg_203",
    "inquiry_id": "inq_123",
    "sender_type": "CUSTOMER",
    "content_display": "추가 이미지를 첨부합니다.",
    "created_at": "2026-04-06T10:33:00+09:00",
    "attachments": [
      {
        "attachment_id": "att_2",
        "file_name": "photo1.jpg",
        "mime_type": "image/jpeg",
        "file_size": 314572,
        "preview_available": true,
        "download_available": true
      }
    ]
  },
  "meta": null,
  "error": null
}
```

## 6.4 `POST /operator/inquiries/{id}/messages`

### request shape 예시
```json
{
  "content_raw": "첨부 이미지를 확인했습니다.",
  "attachments": []
}
```

### response shape 예시
```json
{
  "data": {
    "message_id": "msg_204",
    "inquiry_id": "inq_123",
    "sender_type": "OPERATOR",
    "content_display": "첨부 이미지를 확인했습니다.",
    "created_at": "2026-04-06T10:34:00+09:00"
  },
  "meta": null,
  "error": null
}
```

## 6.5 `GET /customer/chatbot-sessions/{id}`

### response shape 예시
```json
{
  "data": {
    "chatbot_session": {
      "id": "cbs_1",
      "session_status": "ACTIVE",
      "last_message_at": "2026-04-06T10:05:00+09:00"
    },
    "messages": [
      {
        "message_id": "cmsg_1",
        "sender_type": "CUSTOMER",
        "message_type": "QUESTION",
        "sent_at": "2026-04-06T10:01:00+09:00",
        "content_display": "이 상품은 언제 배송되나요?",
        "raw_available": true,
        "attachments": []
      }
    ]
  },
  "meta": {
    "read_only": false
  },
  "error": null
}
```

### 만료 시
- `meta.read_only = true`
- 기존 메시지 조회는 유지

## 6.6 `POST /customer/chatbot-sessions/{id}/messages`

### request shape 예시
```json
{
  "content_raw": "사진으로 보여드릴게요.",
  "attachments": [
    {
      "file_name": "photo2.png",
      "mime_type": "image/png",
      "file_size": 220184
    }
  ]
}
```

### response shape 예시
```json
{
  "data": {
    "message_id": "cmsg_2",
    "chatbot_session_id": "cbs_1",
    "sender_type": "CUSTOMER",
    "message_type": "QUESTION",
    "content_display": "사진으로 보여드릴게요.",
    "sent_at": "2026-04-06T10:06:00+09:00",
    "attachments": [
      {
        "attachment_id": "att_3",
        "file_name": "photo2.png",
        "mime_type": "image/png",
        "file_size": 220184,
        "preview_available": true,
        "download_available": true
      }
    ]
  },
  "meta": null,
  "error": null
}
```

### 핵심 규칙
- expired session에는 append 불가

## 6.7 Attachment projection example

### detail field 예시
```json
{
  "attachment_id": "att_3",
  "file_name": "photo2.png",
  "mime_type": "image/png",
  "file_size": 220184,
  "preview_status": "FAILED",
  "preview_available": false,
  "download_available": true
}
```

### 핵심 규칙
- preview 실패 시에도 download availability는 유지될 수 있다.
- preview/download는 message detail 안의 field/action 수준으로 해석한다.

## 7. Validation / Rejection Case Detail

## 7.1 `400 Bad Request`

적용 예:

- blank message
- message length 초과
- invalid attachment 형식
- attachment 3장 초과
- attachment 5MB 초과

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
- 허용되지 않은 raw access 시도
- operator role 없는 inquiry operator API 접근

## 7.3 `404 Not Found`

적용 예:

- 존재하지 않는 inquiry
- 존재하지 않는 chatbot session
- append 대상 message context 없음

## 7.4 expired chatbot session 처리

- 조회는 허용
- append는 거절
- 조회는 `200 OK` + `meta.read_only=true`로 처리 가능

## 7.5 preview failure는 오류가 아님

- attachment preview 실패는 request 실패가 아니다.
- `200 OK` 안에서 attachment degraded 상태로 반환한다.
- message 본문과 timeline 자체는 계속 반환한다.

## 8. Timeline Projection Detail

## 8.1 Inquiry message timeline projection

### 최소 필드
- `message_id`
- `sender_type`
- `created_at`
- `content_display`
- raw 확인 가능 여부
- `attachments`

## 8.2 Chatbot message timeline projection

### 최소 필드
- `message_id`
- `sender_type`
- `message_type`
- `sent_at`
- `content_display`
- raw 확인 가능 여부
- `attachments`

## 8.3 Attachment projection

### 최소 필드
- `attachment_id`
- `file_name`
- `mime_type`
- `file_size`
- `preview_status`
- `preview_available`
- `download_available`

## 8.4 Customer-visible projection rule

- customer-visible message만 포함
- internal-only data는 제외
- 기본 출력은 `content_display`
- raw는 허용된 범위 안에서만 노출

## 8.5 Operator-visible projection rule

- operator는 customer-visible conversation scope를 동일 기본 원칙으로 본다.
- operator projection의 추가 주변 context는 상위 inquiry detail 문서가 담당한다.

## 8.6 Projection consistency rule

- inquiry message와 chatbot message는 owner context는 다르지만 공통 projection 원칙을 공유한다.
- attachment는 언제나 message 하위에서 동일한 metadata 방식으로 반환한다.
- preview failure는 projection degraded로만 표현한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강할 local detail이다.

- raw field/action naming 세부
- preview/download action field naming
- message pagination 정책 세부
- attachment 정렬 순서
- attachment download audit logging 범위
