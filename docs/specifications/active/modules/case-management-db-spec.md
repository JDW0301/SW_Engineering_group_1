# Case Management DB 상세 명세

## 1. 문서 목적

본 문서는 `Case Management` 로직을 관계형 저장 구조로 번역한 DB 명세를 정의한다.

이 문서는 기존 message persistence의 전체 계약을 다시 소유하지 않는다. `inquiry_messages`의 canonical persistence 계약은 `Conversation / Attachments DB`를 우선 기준으로 유지하며, 이 문서는 `inquiries`, `internal_notes`, `inquiry_relations` 중심의 aggregate 저장 구조와 message dependency reference만 다룬다.

이 문서가 직접 다루는 범위는 아래와 같다.

- inquiry 저장 구조
- inquiry message dependency reference
- internal note 저장 구조
- inquiry relation 저장 구조
- enum / code 정의
- 무결성 제약
- 인덱스 전략
- migration 방향

이 문서는 아래를 직접 다루지 않는다.

- external snapshot 테이블 상세
- chatbot knowledge file 저장 구조
- KPI materialized projection
- 파일 저장소 vendor 상세

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- `inquiries`
- `inquiry_messages` reference
- `internal_notes`
- `inquiry_relations`
- inquiry 관련 enum / code
- 조회 성능을 위한 최소 인덱스

## 2.2 직접 다루지 않는 것

- `customer`, `order`, `product` snapshot 상세 스키마
- `chatbot_session` 상세 스키마
- attachment 저장소 스키마
- integration event log 상세 스키마

## 3. Table Set

## 3.1 `inquiries`

### 역할
- Case Management aggregate root 저장

## 3.2 `inquiry_messages`

### 역할
- inquiry 내부 메시지 타임라인이 aggregate와 어떻게 연결되는지 reference 수준으로 설명
- canonical message persistence 구조 자체는 `Conversation / Attachments DB`를 우선 기준으로 유지

## 3.3 `internal_notes`

### 역할
- customer 비노출 내부 협업 메모 저장

## 3.4 `inquiry_relations`

### 역할
- inquiry 간 관계 저장
- duplicate/master 관계 표현

## 3.5 `inquiry_events`

### 현재 상태
- MVP 1차 구조에서는 도입하지 않음
- 이벤트는 로직 명세상의 개념으로 유지

## 4. Core Table Definitions

## 4.1 `inquiries`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `customer_id`
- `order_id` nullable
- `product_id` nullable
- `linked_chatbot_session_id` nullable
- `inquiry_type`
- `inquiry_channel`
- `status`
- `assigned_operator_id` nullable
- `hold_reason_code` nullable
- `resolve_reason_code` nullable
- `opened_at`
- `last_message_at`
- `last_response_at` nullable
- `closed_at` nullable
- `expired_at` nullable
- `is_test` boolean default false
- `created_at`
- `updated_at`

### 비즈니스 해석
- `customer_id`는 not null
- `order_id`, `product_id`는 optional linkage
- `linked_chatbot_session_id`는 handoff-derived inquiry에서만 의미를 가진다.
- 일반 inquiry에는 `expired_at`이 보통 비어 있어야 한다.

## 4.2 `inquiry_messages`

### 참조 원칙
- `inquiry_messages`의 canonical 컬럼/제약/ownership 계약은 `Conversation / Attachments DB`를 우선 기준으로 유지한다.
- 본 문서에서는 `inquiries.last_message_at`, `last_response_at` 같은 aggregate 파생 필드가 어떤 message dependency를 전제로 하는지만 참조한다.

### PK
- `id`

### 핵심 컬럼
- `id`
- `inquiry_id`
- `sender_type`
- `content_raw`
- `content_display`
- `created_at`
- `created_by_customer_id` nullable
- `created_by_operator_id` nullable

### 비즈니스 해석
- message는 반드시 하나의 inquiry에 속한다.
- sender가 customer면 `created_by_customer_id` 사용
- sender가 operator면 `created_by_operator_id` 사용

## 4.3 `internal_notes`

### PK
- `id`

### 핵심 컬럼
- `id`
- `inquiry_id`
- `operator_id`
- `content`
- `created_at`
- `updated_at` nullable

### 비즈니스 해석
- note는 inquiry에 반드시 속한다.
- customer-visible projection에서는 절대 제외한다.

## 4.4 `inquiry_relations`

### PK
- `id`

### 핵심 컬럼
- `id`
- `source_inquiry_id`
- `target_inquiry_id`
- `relation_type`
- `created_by_operator_id`
- `created_at`

### 비즈니스 해석
- 같은 inquiry를 자기 자신과 연결하지 않는다.
- duplicate/master relation 표현의 저장 기반이다.

## 5. Enum / Code Definitions

## 5.1 inquiry status enum
- `OPEN`
- `WAITING`
- `IN_PROGRESS`
- `ON_HOLD`
- `RESOLVED`

## 5.2 inquiry type enum

초기 후보:

- `ORDER`
- `PRODUCT`
- `DELIVERY`
- `PAYMENT`
- `ETC`

## 5.3 inquiry channel enum

초기 후보:

- `CUSTOMER_PORTAL`
- `CHATBOT_HANDOFF`
- `OPERATOR_CREATED`

## 5.4 sender type enum
- `CUSTOMER`
- `OPERATOR`
- `CHATBOT`

`inquiry_messages`에서는 주로 `CUSTOMER`, `OPERATOR`를 사용한다.

## 5.5 hold reason code enum
- `WAITING_CUSTOMER_INPUT`
- `WAITING_INTERNAL_CONFIRMATION`
- `WAITING_EXTERNAL_SYNC`
- `OTHER`

## 5.6 resolve reason code enum
- `ANSWERED`
- `CUSTOMER_CONFIRMED`
- `DUPLICATE_MERGED`
- `NO_FURTHER_ACTION`
- `OTHER`

## 5.7 relation type enum
초기 후보:

- `DUPLICATE_OF`
- `RELATED_TO`

MVP 기준 핵심은 `DUPLICATE_OF`다.

## 6. Integrity Constraints

## 6.1 `inquiries` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `customer_id` not null
- `status` not null
- `inquiry_type` not null
- `inquiry_channel` not null
- `opened_at` not null
- `last_message_at` not null
- `is_test` not null default false

### 애플리케이션에서 보장
- 일반 inquiry에는 `expired_at` 사용 안 함
- `hold_reason_code`는 `ON_HOLD`일 때만 의미 있음
- `resolve_reason_code`는 `RESOLVED`일 때만 의미 있음
- `linked_chatbot_session_id`는 handoff-derived inquiry에서만 사용

## 6.2 `inquiry_messages` 제약

### DB에서 직접 강제
- `id` PK
- `inquiry_id` not null
- `sender_type` not null
- `content_raw` not null
- `content_display` not null
- `created_at` not null

### 애플리케이션에서 보장
- trim 후 빈 문자열 금지
- `content_raw` 최대 2000자
- sender별 created_by 필드 일관성 보장

## 6.3 `internal_notes` 제약

### DB에서 직접 강제
- `id` PK
- `inquiry_id` not null
- `operator_id` not null
- `content` not null
- `created_at` not null

### 애플리케이션에서 보장
- trim 후 빈 문자열 금지
- 최대 1000자
- customer-visible projection 제외

## 6.4 `inquiry_relations` 제약

### DB에서 직접 강제
- `id` PK
- `source_inquiry_id` not null
- `target_inquiry_id` not null
- `relation_type` not null
- `created_by_operator_id` not null
- `created_at` not null

### DB check 제약 후보
- `source_inquiry_id != target_inquiry_id`

### 애플리케이션에서 보장
- duplicate relation 중복 생성 방지
- master inquiry relation 방향 일관성 유지

## 6.5 Foreign key 전략

### 고정 규칙
- `customer_id`는 FK 유지
- `order_id`, `product_id`는 soft reference

### 권장 FK
- `inquiries.customer_id -> customers.id`
- `inquiry_messages.inquiry_id -> inquiries.id`
- `internal_notes.inquiry_id -> inquiries.id`
- `inquiry_relations.source_inquiry_id -> inquiries.id`
- `inquiry_relations.target_inquiry_id -> inquiries.id`

### 해석
- customer ownership은 강하게 묶는다.
- order/product는 degraded context 정책 때문에 soft reference로 둔다.

## 7. Index Strategy

## 7.1 `inquiries` 핵심 인덱스

### 추천 인덱스
- `(customer_id)`
- `(status)`
- `(assigned_operator_id)`
- `(last_message_at desc)`
- `(opened_at)`
- `(closed_at)`
- `(is_test)`

### 복합 인덱스 후보
- `(status, last_message_at desc)`
- `(customer_id, opened_at desc)`

## 7.2 `inquiry_messages` 핵심 인덱스

### 추천 인덱스
- `(inquiry_id, created_at asc)`
- `(created_by_customer_id)`
- `(created_by_operator_id)`

## 7.3 `internal_notes` 핵심 인덱스

### 추천 인덱스
- `(inquiry_id, created_at asc)`

## 7.4 `inquiry_relations` 핵심 인덱스

### 추천 인덱스
- `(source_inquiry_id)`
- `(target_inquiry_id)`
- `(relation_type)`

## 7.5 인덱스 설계 원칙

- 목록 조회 기준 필드 우선
- KPI 집계 시간 필드 우선
- 상세 타임라인 기준 필드 우선
- MVP에서는 핵심 인덱스만 먼저 둔다.

## 8. Migration Considerations

## 8.1 초기 생성 순서

1. `inquiries`
2. `inquiry_messages`
3. `internal_notes`
4. `inquiry_relations`

`inquiry_events`는 1차 MVP에서 생성하지 않는다.

## 8.2 Enum 변경 전략

- 초기 enum은 작게 시작
- 신규 code는 append 방식 선호
- 기존 값 rename은 가급적 피함

## 8.3 Snapshot FK 전략

- `customer_id`는 FK 유지
- `order_id`, `product_id`는 soft reference 유지

## 8.4 Event table 전략

- 1차 MVP에서는 `inquiry_events` 테이블 도입 안 함
- audit/history 요구가 커지면 후속 migration으로 추가 가능

## 8.5 Test inquiry 처리 전략

- `is_test`는 초기 스키마에 포함
- KPI exclusion은 애플리케이션/쿼리 레벨에서 수행

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- `order_id`, `product_id`를 내부 UUID로 둘지 external reference로 둘지의 세부 선택
- delete/anonymize 정책이 DB에 미치는 영향
- `inquiry_relations`의 relation type 확장 방식
- future `inquiry_events` 도입 시 스키마 전략
