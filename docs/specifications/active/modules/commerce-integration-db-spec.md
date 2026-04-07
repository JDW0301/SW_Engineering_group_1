# Commerce Integration DB 상세 명세

## 1. 문서 목적

본 문서는 `Commerce Integration` 로직을 관계형 저장 구조로 번역한 DB 명세를 정의한다.

이 문서는 기존 aggregate DB spec의 전체 소유권을 다시 가져오지 않는다. 이미 `Case Management DB`, `Customer Portal / Handoff DB`, `Conversation / Attachments DB`, `Safety Intelligence / Knowledge DB`가 소유하는 inquiry/chatbot/message/safety persistence 위에서 **external snapshot / integration event persistence 공통 계약만 표준화**하며, inquiry lifecycle과 conversation persistence는 각 소유 문서를 우선 기준으로 유지한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- `customer_snapshots` 저장 구조
- `order_snapshots` 저장 구조
- `product_snapshots` 저장 구조
- `integration_event_logs` 저장 구조
- external reference mapping 저장 규칙
- manual resync / retry 추적 규칙
- 무결성 제약
- 인덱스 전략
- migration 방향

이 문서는 아래를 직접 다루지 않는다.

- inquiry aggregate 상세 스키마 자체
- chatbot session/message 저장 구조
- summary / abuse detection 저장 구조
- UI 구현 상세
- 보관/삭제 정책 최종값 자체

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- external snapshot persistence
- integration event log persistence
- ACL 번역 결과 저장 구조
- manual resync trace 저장 규칙
- idempotent event 처리용 최소 key/상태 구조
- degraded snapshot 표시를 위한 최소 상태 정보

## 2.2 직접 다루지 않는 것

- inquiry 상태 전이 상세
- inquiry / chatbot message 저장 상세
- operator assignment
- handoff 실행 자체
- safety/knowledge 보조 결과 저장

## 3. Table Set

## 3.1 `customer_snapshots`

### 역할
- 외부 customer truth를 내부 운영용으로 축소/번역한 snapshot 저장

## 3.2 `order_snapshots`

### 역할
- 외부 order truth를 내부 운영용으로 번역한 snapshot 저장

## 3.3 `product_snapshots`

### 역할
- 외부 product truth를 내부 운영용으로 축소한 snapshot 저장

## 3.4 `integration_event_logs`

### 역할
- 외부 이벤트 수신/처리 상태를 기록하는 운영 로그 저장

## 3.5 `external_reference_mappings`

### 역할
- 외부 식별자와 내부 snapshot/entity 연결 정보를 유지하는 매핑 저장

## 3.6 `manual_resync_logs`

### 역할
- operator 수동 재동기화 실행 결과와 반복 실행 이력을 저장

## 3.7 raw external payload 보관

### 현재 상태
- 외부 payload 원문 자체는 MVP 기본 저장 대상으로 두지 않는다.
- 저장이 필요하더라도 canonical snapshot과 분리된 운영/감사 목적의 별도 전략으로 후속 검토한다.

## 4. Core Table Definitions

## 4.1 `customer_snapshots`

### PK
- `id`

### 핵심 컬럼
- `id`
- `external_reference_id`
- `store_id`
- `display_name`
- `masked_contact`
- `masked_address` nullable
- `snapshot_status`
- `last_synced_at`
- `updated_at`

### 비즈니스 해석
- 내부 원본이 아니라 운영용 snapshot이다.
- inquiry context에서 customer 맥락 제공 용도로 사용한다.
- 민감정보는 최소 반영 또는 마스킹 상태로 저장한다.

## 4.2 `order_snapshots`

### PK
- `id`

### 핵심 컬럼
- `id`
- `external_reference_id`
- `store_id`
- `customer_snapshot_id` nullable
- `order_number`
- `order_status`
- `snapshot_status`
- `last_synced_at`
- `updated_at`

### 비즈니스 해석
- internal authoritative order 모델이 아니다.
- inquiry context 보조용 snapshot이다.
- 외부 order truth 기준으로 upsert된다.

## 4.3 `product_snapshots`

### PK
- `id`

### 핵심 컬럼
- `id`
- `external_reference_id`
- `store_id`
- `product_name`
- `product_status` nullable
- `snapshot_status`
- `last_synced_at`
- `updated_at`

### 비즈니스 해석
- inquiry 존재 조건이 아닌 보조 정보 snapshot이다.
- 외부 product truth를 축소한 운영용 정보다.

## 4.4 `integration_event_logs`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `external_event_id`
- `canonical_event_type`
- `source_entity_type`
- `source_entity_reference_id`
- `external_occurred_at`
- `processing_status`
- `received_at`
- `processed_at` nullable
- `retry_count`
- `failure_reason` nullable

### 비즈니스 해석
- domain event가 아니라 integration processing trace다.
- 중복 이벤트 / 실패 / 재처리 추적용이다.
- snapshot 반영 성공 여부를 운영적으로 추적한다.
- store scope 안에서 이벤트 처리 맥락을 구분한다.

## 4.5 `external_reference_mappings`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `source_entity_type`
- `external_reference_id`
- `internal_entity_type`
- `internal_entity_id`
- `mapped_at`

### 비즈니스 해석
- `external_reference_id`가 중심축이다.
- 외부 추적성을 유지하는 기준 테이블이다.
- 동일 external reference라도 store가 다르면 별도 맥락으로 해석할 수 있다.

## 4.6 `manual_resync_logs`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `target_entity_type`
- `target_external_reference_id`
- `requested_by_operator_id`
- `requested_at`
- `result_status`
- `failure_reason` nullable

### 비즈니스 해석
- entity 단위 manual resync 실행 기록이다.
- 반복 실행 가능성 자체를 전제로 한다.

## 5. Enum / State / Ownership Rules

## 5.1 snapshot entity type enum

- `CUSTOMER`
- `ORDER`
- `PRODUCT`

## 5.2 `snapshot_status` enum

초기 후보:

- `ACTIVE`
- `STALE`
- `INACTIVE`

## 5.3 `integration_event_logs.processing_status` enum

- `RECEIVED`
- `IGNORED`
- `FAILED`
- `APPLIED`

## 5.4 `manual_resync_logs.result_status` enum

- `REQUESTED`
- `SUCCEEDED`
- `FAILED`

## 5.5 ownership rule

### snapshot tables
- `customer_snapshots`, `order_snapshots`, `product_snapshots`는 외부 truth를 내부 운영용으로 번역한 결과다.
- 내부 authoritative aggregate가 아니다.

### integration event logs
- inquiry lifecycle authority와 분리된 운영 추적용 로그다.

### inquiry boundary
- integration 계층은 inquiry를 직접 수정하지 않는다.
- inquiry lifecycle은 Case Management 소유다.

## 6. Integrity Constraints

## 6.1 `customer_snapshots` 제약

### DB에서 직접 강제
- `id` PK
- `external_reference_id` not null
- `store_id` not null
- `display_name` not null
- `snapshot_status` not null
- `last_synced_at` not null
- `updated_at` not null

### DB unique 제약 후보
- `(store_id, external_reference_id)`

### 애플리케이션에서 보장
- 외부 truth 기준 upsert
- 민감정보 최소 반영/마스킹

## 6.2 `order_snapshots` 제약

### DB에서 직접 강제
- `id` PK
- `external_reference_id` not null
- `store_id` not null
- `order_number` not null
- `order_status` not null
- `snapshot_status` not null
- `last_synced_at` not null
- `updated_at` not null

### DB unique 제약 후보
- `(store_id, external_reference_id)`

### 애플리케이션에서 보장
- 존재하면 update, 없으면 create
- stale/missing 상태가 inquiry 흐름을 막지 않음

## 6.3 `product_snapshots` 제약

### DB에서 직접 강제
- `id` PK
- `external_reference_id` not null
- `store_id` not null
- `product_name` not null
- `snapshot_status` not null
- `last_synced_at` not null
- `updated_at` not null

### DB unique 제약 후보
- `(store_id, external_reference_id)`

### 애플리케이션에서 보장
- product snapshot은 보조 정보이며 absence가 inquiry를 무효화하지 않음

## 6.4 `integration_event_logs` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `external_event_id` not null
- `canonical_event_type` not null
- `source_entity_type` not null
- `source_entity_reference_id` not null
- `external_occurred_at` not null
- `processing_status` not null
- `received_at` not null
- `retry_count` not null default 0

### DB unique 제약 후보
- `(store_id, external_event_id)`

### 애플리케이션에서 보장
- 이미 성공 처리된 동일 이벤트는 idempotent no-op 또는 skip 처리
- 실패 원인을 내부 로그에 남김
- 최대 3회 재시도 추적

## 6.5 `external_reference_mappings` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `source_entity_type` not null
- `external_reference_id` not null
- `internal_entity_type` not null
- `internal_entity_id` not null
- `mapped_at` not null

### DB unique 제약 후보
- `(store_id, source_entity_type, external_reference_id)`

### 애플리케이션에서 보장
- ACL 번역 결과와 snapshot/entity 연결 정합성 유지

## 6.6 `manual_resync_logs` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `target_entity_type` not null
- `target_external_reference_id` not null
- `requested_by_operator_id` not null
- `requested_at` not null
- `result_status` not null

### 애플리케이션에서 보장
- entity 단위 resync만 허용
- store-wide resync는 MVP 범위 제외
- resync 결과는 감사/운영 로그에 남김

## 6.7 ACL / payload 저장 규칙

### 애플리케이션에서 보장
- 외부 payload를 그대로 내부 snapshot 모델에 저장하지 않는다.
- ACL은 field name 번역, 의미 번역, external reference 매핑, 민감정보 최소 반영, 내부 enum 번역을 수행한다.
- raw external payload 저장은 기본 경로가 아니다.

## 7. Index Strategy

## 7.1 snapshot 테이블 핵심 인덱스

### `customer_snapshots`
- `(store_id, external_reference_id)`
- `(snapshot_status)`
- `(last_synced_at desc)`

### `order_snapshots`
- `(store_id, external_reference_id)`
- `(order_number)`
- `(snapshot_status)`
- `(last_synced_at desc)`

### `product_snapshots`
- `(store_id, external_reference_id)`
- `(product_name)`
- `(snapshot_status)`
- `(last_synced_at desc)`

## 7.2 `integration_event_logs` 핵심 인덱스

### 추천 인덱스
- `(store_id, external_event_id)`
- `(canonical_event_type, received_at desc)`
- `(processing_status, received_at desc)`
- `(source_entity_type, source_entity_reference_id)`

## 7.3 `external_reference_mappings` / `manual_resync_logs` 인덱스

### `external_reference_mappings`
- `(store_id, source_entity_type, external_reference_id)`
- `(internal_entity_type, internal_entity_id)`

### `manual_resync_logs`
- `(store_id, target_entity_type, target_external_reference_id, requested_at desc)`
- `(requested_by_operator_id, requested_at desc)`
- `(result_status)`

## 7.4 인덱스 설계 원칙

- 외부 reference lookup 우선
- 최신 sync / retry 상태 조회 우선
- degraded/stale 판단을 위한 시간 인덱스 우선
- MVP에서는 핵심 인덱스만 먼저 둔다.

## 8. Migration Considerations

## 8.1 초기 생성 순서

1. `customer_snapshots`
2. `order_snapshots`
3. `product_snapshots`
4. `external_reference_mappings`
5. `integration_event_logs`
6. `manual_resync_logs`

## 8.2 enum 변경 전략

- 초기 enum은 작게 시작
- 신규 code는 append 방식 선호
- 기존 값 rename은 가급적 피함

## 8.3 snapshot upsert 전략

- 모든 snapshot은 upsert 방식으로 반영한다.
- 존재하면 갱신, 없으면 생성한다.
- 삭제 이벤트는 MVP에서 물리 삭제보다 비활성 반영을 우선 고려한다.

## 8.4 retry / idempotency 전략

- 동일 외부 이벤트는 중복 수신 가능성을 전제로 한다.
- 이미 성공 처리된 동일 이벤트는 skip 또는 idempotent no-op 처리한다.
- retry exhaustion 시 final failure 상태를 기록한다.

## 8.5 boundary / privacy 연계 전략

- inquiry lifecycle은 별도 aggregate가 소유한다.
- snapshot missing/stale은 degraded context 문제로 해석하고 inquiry 자체를 막지 않는다.
- retention/privacy 정책 최종값은 platform 문서를 참조한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- canonical event type 매핑 테이블 세부
- delete event 비활성 처리 구체 규칙
- retry 가능/불가능 오류 분류 세부
- snapshot_status 세부 상태 확장 여부
- integration event log 보관 기간
