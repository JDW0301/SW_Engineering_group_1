# Commerce Integration API 상세 명세

## 1. 문서 목적

본 문서는 `Commerce Integration` 로직을 HTTP/API 계약으로 번역한 명세를 정의한다.

이 문서는 기존 endpoint의 전체 계약을 다시 소유하지 않는다. 이미 `Case Management API`, `Customer Portal / Handoff API`, `Conversation / Attachments API`, `Safety Intelligence / Knowledge API`가 소유하는 inquiry/chatbot/message/safety endpoint 위에서 **external snapshot / integration event / manual resync API 공통 계약만 표준화**하며, inquiry lifecycle과 customer-facing support flow의 최종 authority는 각 소유 문서를 우선 기준으로 유지한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- external webhook 수신 API
- operator-facing snapshot 조회 API
- manual resync API
- integration event log 조회 API
- degraded snapshot 노출 규칙
- validation / rejection / retry 노출 규칙

이 문서는 아래를 직접 다루지 않는다.

- inquiry 상태 lifecycle 자체
- operator response logic 자체
- customer portal UI
- summary / abuse detection API
- DB 구현 상세

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- integration endpoint 정의
- request / response shape
- webhook receipt contract
- snapshot 조회 / resync contract
- validation / rejection response
- degraded integration response 규칙

## 2.2 직접 다루지 않는 것

- inquiry / chatbot session lifecycle 최종 authority
- conversation message endpoint 자체
- handoff 실행 자체
- DB 테이블 구현
- UI 렌더링 상세

## 3. API Domain Split

## 3.1 Webhook Intake API

### 역할
- 외부 시스템에서 들어오는 webhook event를 수신하고 기본 검증 단계로 넘기는 API

### 포함 기능
- webhook receipt
- 최소 메타데이터 검증
- 허용 event type 확인

### 특징
- authenticity validation은 MVP에서 생략
- invalid payload는 snapshot 반영 전에 중단
- 외부 연동 실패는 운영자 대상 문제로 본다.

## 3.2 Snapshot Read / Recovery API

### 역할
- operator가 customer/order/product snapshot을 조회하고 degraded 상태를 해석하는 API

### 포함 기능
- snapshot detail 조회
- snapshot freshness/degraded 상태 조회
- missing/stale context 확인

### 특징
- snapshot은 외부 truth의 운영용 view다.
- 누락/오래된 snapshot이 inquiry 흐름 자체를 막지 않는다.

## 3.3 Manual Resync API

### 역할
- operator가 특정 entity를 외부 원본으로부터 다시 동기화하도록 요청하는 API

### 포함 기능
- customer/order/product entity 단위 resync
- resync 결과 조회

### 특징
- store-wide resync는 MVP 범위 제외
- 반복 실행 가능
- 웹훅 지연/누락 복구 수단

## 3.4 Integration Event Log API

### 역할
- webhook 처리 상태와 재시도/실패 내역을 operator가 확인하는 API

### 포함 기능
- event log 목록 조회
- event 처리 상태 조회

### 특징
- domain event가 아니라 processing trace
- idempotent 처리 상태와 실패 원인을 추적

## 3.5 경계 규칙

- integration API는 inquiry를 직접 수정하지 않는다.
- snapshot은 inquiry context 보조 정보다.
- customer-facing support flow는 직접 소유하지 않는다.
- ACL은 단순 rename이 아니라 의미 번역 계층이다.

## 4. Resource Set

## 4.1 Webhook resources

- `POST /integrations/webhooks/commerce`

## 4.2 Snapshot resources

- `GET /operator/customers/{external_reference_id}/snapshot`
- `GET /operator/orders/{external_reference_id}/snapshot`
- `GET /operator/products/{external_reference_id}/snapshot`

## 4.3 Manual resync resources

- `POST /operator/customers/{external_reference_id}/resync`
- `POST /operator/orders/{external_reference_id}/resync`
- `POST /operator/products/{external_reference_id}/resync`

## 4.4 Integration event log resources

- `GET /operator/integration-events`
- `GET /operator/integration-events/{id}`

## 5. Common API Rules

## 5.1 인증 / 권한 규칙

### webhook intake API
- 외부 시스템용 inbound endpoint다.
- MVP에서는 authenticity validation을 생략한다.
- 대신 필수 메타데이터 / event type / payload 형식 검증을 수행한다.
- store context는 endpoint path, routing context, 또는 ACL mapping 전 메타데이터 해석 규칙으로 결정되어야 한다.

### operator API
- 세션 기반 인증 필요
- operator role 필요
- snapshot / resync / integration event log 조회는 현재 operator가 속한 store context를 기준으로 해석한다.

## 5.2 응답 기본 구조

기본 응답 형태:

- `data`
- `meta`
- `error`

## 5.3 degraded snapshot 반환 규칙

- snapshot이 없거나 stale해도 inquiry 흐름은 계속 가능하다.
- operator-facing 응답에는 degraded context를 표시할 수 있다.
- 예: `미연결`, `최신화 필요`, `조회 실패`

## 5.4 ACL / payload 반환 규칙

- 외부 payload를 그대로 내부 응답 모델로 반환하지 않는다.
- ACL 번역 결과를 기준으로 internal canonical field를 사용한다.
- 민감정보는 최소 반영 또는 마스킹 상태를 유지한다.

## 5.5 retry / idempotency 반환 규칙

- 동일 외부 이벤트는 중복 수신 가능성을 전제로 한다.
- 이미 성공 처리된 동일 이벤트는 idempotent no-op 또는 skip 처리한다.
- 일시 오류는 최대 3회 재시도 가능 상태로 구분한다.

## 5.6 validation / rejection HTTP 규칙

- `400` validation error
- `403` forbidden
- `404` not found
- `409` conflict (필요 시)

## 5.7 operator-facing projection 규칙

- operator는 snapshot freshness / degraded state / resync status / event log status를 볼 수 있다.
- customer-facing support flow에는 integration 내부 처리 로그를 직접 노출하지 않는다.

## 6. Request / Response Shape

## 6.1 `POST /integrations/webhooks/commerce`

### request shape 예시
```json
{
  "external_event_id": "evt_1001",
  "event_type": "ExternalOrderStatusChangedReceived",
  "occurred_at": "2026-04-06T11:30:00+09:00",
  "entity_reference_id": "ord_ext_1",
  "payload": {
    "order_status": "SHIPPED"
  }
}
```

### response shape 예시
```json
{
  "data": {
    "received": true,
    "event_status": "RECEIVED"
  },
  "meta": null,
  "error": null
}
```

### 핵심 원칙
- receipt 성공은 곧 snapshot 반영 완료를 의미하지 않는다.
- 허용되지 않은 event type은 `IGNORED` 상태로 기록되거나 skip 처리될 수 있으며, 반드시 `400`으로 간주하지 않는다.

## 6.2 `GET /operator/orders/{external_reference_id}/snapshot`

### response shape 예시
```json
{
  "data": {
    "snapshot": {
      "entity_type": "ORDER",
      "external_reference_id": "ord_ext_1",
      "order_number": "ORD-1001",
      "order_status": "SHIPPED",
      "last_synced_at": "2026-04-06T11:31:00+09:00"
    }
  },
  "meta": {
    "degraded_state": null
  },
  "error": null
}
```

## 6.3 `GET /operator/products/{external_reference_id}/snapshot`

### response shape 예시
```json
{
  "data": {
    "snapshot": {
      "entity_type": "PRODUCT",
      "external_reference_id": "prd_ext_1",
      "product_name": "상품A",
      "last_synced_at": "2026-04-06T10:55:00+09:00"
    }
  },
  "meta": {
    "degraded_state": "STALE"
  },
  "error": null
}
```

## 6.4 `POST /operator/orders/{external_reference_id}/resync`

### request shape 예시
```json
{
  "reason": "stale_snapshot"
}
```

### response shape 예시
```json
{
  "data": {
    "resync_requested": true,
    "target_entity_type": "ORDER",
    "target_external_reference_id": "ord_ext_1",
    "result_status": "REQUESTED"
  },
  "meta": null,
  "error": null
}
```

## 6.5 `GET /operator/integration-events`

### query 예시
- `canonical_event_type`
- `processing_status`
- `page`
- `size`

### response shape 예시
```json
{
  "data": [
    {
      "integration_event_id": "ie_1",
      "external_event_id": "evt_1001",
      "canonical_event_type": "ExternalOrderStatusChangedReceived",
      "processing_status": "APPLIED",
      "received_at": "2026-04-06T11:30:01+09:00",
      "retry_count": 0
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

## 6.6 `GET /operator/integration-events/{id}`

### response shape 예시
```json
{
  "data": {
    "integration_event": {
      "id": "ie_1",
      "external_event_id": "evt_1001",
      "canonical_event_type": "ExternalOrderStatusChangedReceived",
      "source_entity_type": "ORDER",
      "source_entity_reference_id": "ord_ext_1",
      "processing_status": "FAILED",
      "failure_reason": "translation_failed",
      "retry_count": 2,
      "received_at": "2026-04-06T11:30:01+09:00"
    }
  },
  "meta": {
    "retryable": true
  },
  "error": null
}
```

## 7. Validation / Rejection Case Detail

## 7.1 `400 Bad Request`

적용 예:

- 필수 메타데이터 누락
- payload 형식 오류
- 잘못된 resync target 형식

## 7.2 `403 Forbidden`

적용 예:

- operator role 없는 snapshot/resync/event log 접근

## 7.3 `404 Not Found`

적용 예:

- 존재하지 않는 snapshot reference
- 존재하지 않는 integration event log

## 7.4 `409 Conflict`

적용 예:

- 필요 시 동일 entity에 대한 동시 resync 경쟁
- 명시적 충돌 상태를 노출해야 하는 recovery flow

## 7.5 degraded / retry 가능 상태는 전체 오류가 아님

- stale snapshot은 degraded context다.
- retryable integration failure는 전체 inquiry 흐름 오류가 아니다.
- resync 진입점은 recovery action으로 제공될 수 있다.

## 8. Projection Detail

## 8.1 Snapshot projection

### 최소 필드
- `entity_type`
- `external_reference_id`
- entity-specific summary field
- `last_synced_at`
- `degraded_state`

## 8.2 Integration event projection

### 최소 필드
- `external_event_id`
- `canonical_event_type`
- `processing_status`
- `received_at`
- `retry_count`
- `failure_reason`

## 8.3 Manual resync projection

### 최소 필드
- `target_entity_type`
- `target_external_reference_id`
- `result_status`
- `requested_at`

## 8.4 Failure-tolerant projection rule

- snapshot 누락/오래됨은 degraded state로 표현
- event 처리 실패는 failure_reason과 retryable 여부로 표현
- inquiry/customer support 흐름 자체는 계속 유지

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강 가능한 local detail이다.

- webhook auth가 추가될 경우 header contract 세부
- event type canonical mapping API 표현 세부
- degraded state wording 세부
- retryable flag 계산 기준 세부
- resync reason enum 세부
