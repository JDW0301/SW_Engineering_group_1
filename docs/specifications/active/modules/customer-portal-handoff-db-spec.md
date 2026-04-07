# Customer Portal / Handoff DB 상세 명세

## 1. 문서 목적

본 문서는 `Customer Portal / Handoff` 로직을 관계형 저장 구조로 번역한 DB 명세를 정의한다.

이 문서는 기존 message persistence의 전체 계약을 다시 소유하지 않는다. `chat_messages`의 canonical persistence 계약은 `Conversation / Attachments DB`를 우선 기준으로 유지하며, 이 문서는 `chatbot_sessions`와 handoff linkage 중심의 aggregate 저장 구조와 message dependency reference를 다룬다.

이 문서가 직접 다루는 범위는 아래와 같다.

- `chatbot_sessions` 저장 구조
- `chat_messages` dependency reference
- handoff 연결 방식
- auto-expire 관련 컬럼
- ownership 및 session/message relation 제약
- 인덱스 전략
- migration 방향

이 문서는 아래를 직접 다루지 않는다.

- `inquiries` 상세 스키마 자체
- attachment 저장소 구현
- chatbot answer generation 구현
- customer UI 렌더링 방식

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- `chatbot_sessions`
- `chat_messages` reference
- session ↔ inquiry handoff linkage 기준
- session 상태와 만료 저장 구조
- customer ownership 제약

## 2.2 직접 다루지 않는 것

- inquiry aggregate 상세 스키마
- external snapshot 상세 스키마
- attachment 바이너리 저장 방식
- KPI materialization

## 3. Table Set

## 3.1 `chatbot_sessions`

### 역할
- customer self-service 챗봇 세션의 상위 저장 단위

## 3.2 `chat_messages`

### 역할
- `chatbot_session` 내부 customer / chatbot 메시지가 aggregate와 어떻게 연결되는지 reference 수준으로 설명
- canonical message persistence 구조 자체는 `Conversation / Attachments DB`를 우선 기준으로 유지

## 3.3 handoff 연결 방식

### 현재 구조
- 별도 `chatbot_handoffs` 테이블을 두지 않음
- `inquiries.linked_chatbot_session_id`로 연결을 표현

### 의미
- handoff 관계는 inquiry 쪽 링크로 표현
- 별도 handoff 이력 테이블은 MVP 범위에서 두지 않음

## 3.4 inquiry 생성 자체

- customer inquiry 생성은 기존 `inquiries`, `inquiry_messages`를 재사용한다.
- Customer Portal DB spec의 독립 테이블은 사실상 `chatbot_sessions`, `chat_messages` 중심이다.

## 4. Core Table Definitions

## 4.1 `chatbot_sessions`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `customer_id`
- `session_status`
- `knowledge_source_version` nullable
- `started_at`
- `last_message_at`
- `handoff_requested_at` nullable
- `expired_at` nullable
- `created_at`
- `updated_at`

### 비즈니스 해석
- customer ownership은 강하게 필요하다.
- `handoff_requested_at`은 실제 handoff 요청 이후에만 의미 있다.
- `expired_at`이 채워진 세션은 read-only 해석 대상이다.

## 4.2 `chat_messages`

### 참조 원칙
- `chat_messages`의 canonical 컬럼/제약/ownership 계약은 `Conversation / Attachments DB`를 우선 기준으로 유지한다.
- 본 문서에서는 `chatbot_sessions.last_message_at`, read-only 만료 규칙, handoff linkage가 어떤 message dependency를 전제로 하는지만 참조한다.

### PK
- `id`

### 핵심 컬럼
- `id`
- `chatbot_session_id`
- `sender_type`
- `message_type`
- `content_raw`
- `content_display`
- `sent_at`
- `created_by_customer_id` nullable
- `created_by_system` boolean default false

### 비즈니스 해석
- customer 질문과 chatbot 응답을 같은 테이블에 저장하되 sender/type으로 구분한다.
- `content_raw` / `content_display`는 inquiry message와 동일한 정책을 따른다.

## 4.3 handoff 연결 해석

### 방식
- `inquiries.linked_chatbot_session_id` nullable 사용

### 의미
- handoff inquiry는 linked chatbot session을 참조한다.
- `chatbot_session`당 inquiry 최대 1개 규칙은 **애플리케이션 레벨에서 보장**한다.
- DB unique 제약으로는 강제하지 않는다.

## 5. Enum / State / Ownership Rules

## 5.1 `chatbot_sessions.session_status` enum

- `ACTIVE`
- `HANDOFF_REQUESTED`
- `EXPIRED`

## 5.2 `chat_messages.sender_type` enum

- `CUSTOMER`
- `CHATBOT`

## 5.3 `chat_messages.message_type` enum

- `QUESTION`
- `ANSWER`
- `SYSTEM_NOTICE`

## 5.4 ownership rule

### `chatbot_sessions`
- 반드시 `customer_id`를 가진다.
- customer는 본인 session만 조회 가능하다.

### `chat_messages`
- 반드시 특정 `chatbot_session`에 속한다.
- orphan message는 허용하지 않는다.

## 5.5 auto-expire 해석 규칙

- `expired_at`이 채워진 session은 read-only 취급
- 만료된 session은 읽기 허용
- append / handoff는 금지

## 6. Integrity Constraints

## 6.1 `chatbot_sessions` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `customer_id` not null
- `session_status` not null
- `started_at` not null
- `last_message_at` not null
- `created_at` not null
- `updated_at` not null

### DB에서 nullable 허용
- `knowledge_source_version`
- `handoff_requested_at`
- `expired_at`

### 애플리케이션에서 보장
- `handoff_requested_at`는 handoff 요청 이후에만 사용
- `expired_at`이 채워진 session은 read-only
- 같은 session에서 linked inquiry는 최대 1개
- 만료 후 새 message append / 새 handoff 금지

## 6.2 `chat_messages` 제약

### DB에서 직접 강제
- `id` PK
- `chatbot_session_id` not null
- `sender_type` not null
- `message_type` not null
- `content_raw` not null
- `content_display` not null
- `sent_at` not null

### 애플리케이션에서 보장
- trim 후 빈 문자열 금지
- `content_raw` 최대 2000자
- `sender_type=CUSTOMER`면 customer 입력으로 해석
- `sender_type=CHATBOT`면 시스템 응답으로 해석
- 만료된 session에는 새 message 저장 금지

## 6.3 FK / reference 제약

### 추천 FK
- `chatbot_sessions.customer_id -> customers.id`
- `chat_messages.chatbot_session_id -> chatbot_sessions.id`

### handoff 연결
- `inquiries.linked_chatbot_session_id`는 nullable reference
- `chatbot_session`당 inquiry 최대 1개 규칙은 앱 로직에서 보장

## 6.4 ownership 제약

### DB에서 직접 강제
- `customer_id` not null
- `chatbot_session_id` not null

### 애플리케이션에서 보장
- customer는 본인 session만 조회 가능
- customer는 본인 session에만 message append 가능

## 7. Index Strategy

## 7.1 `chatbot_sessions` 핵심 인덱스

### 추천 인덱스
- `(customer_id)`
- `(session_status)`
- `(last_message_at desc)`
- `(started_at)`
- `(expired_at)`

### 복합 인덱스 후보
- `(customer_id, started_at desc)`
- `(session_status, last_message_at desc)`

## 7.2 `chat_messages` 핵심 인덱스

### 추천 인덱스
- `(chatbot_session_id, sent_at asc)`
- `(sender_type)`
- `(message_type)`

## 7.3 linked inquiry 조회 고려

- `inquiries.linked_chatbot_session_id` 인덱스 필요

### 목적
- session → linked inquiry 역참조
- 중복 handoff idempotent 처리
- 기존 inquiry 존재 여부 빠른 확인

## 8. Migration Considerations

## 8.1 초기 생성 순서

1. `chatbot_sessions`
2. `chat_messages`
3. `inquiries.linked_chatbot_session_id` 추가 또는 기존 필드 활용

## 8.2 enum 변경 전략

### session_status
- 초기엔 `ACTIVE`, `HANDOFF_REQUESTED`, `EXPIRED`
- 후속 추가는 append 방식 확장

### message_type
- `QUESTION`, `ANSWER`, `SYSTEM_NOTICE`
- 새로운 system message 필요 시 append 방식 확장

## 8.3 handoff 연결 전략

- 별도 `chatbot_handoffs` 테이블 없이 `inquiries.linked_chatbot_session_id`로 처리
- handoff 관계의 uniqueness는 앱 로직이 보장

## 8.4 auto-expire 전략

- 초기 스키마에 `expired_at` 포함
- auto-expire 판정은 애플리케이션 로직 수행
- DB는 상태/시각 저장만 담당

## 8.5 session history 전략

- 만료 세션도 읽기 가능
- append/handoff만 금지
- 삭제보다 상태/시간 필드 기반 유지가 더 자연스럽다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- `knowledge_source_version`의 실제 형식
- `message_type`를 더 세분화할지 여부
- expired session 조회 가능 기간의 세부 정책
- `linked_chatbot_session_id` 역참조 성능 최적화 방식
