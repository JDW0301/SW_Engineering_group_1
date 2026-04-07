# Conversation / Attachments DB 상세 명세

## 1. 문서 목적

본 문서는 `Conversation / Attachments` 로직을 관계형 저장 구조로 번역한 DB 명세를 정의한다.

이 문서는 기존 aggregate DB spec의 전체 소유권을 다시 가져오지 않는다. 이미 `Case Management DB`, `Customer Portal / Handoff DB`가 소유하는 상위 aggregate 규칙 중에서 **message/attachment persistence 공통 계약만 표준화**하며, `inquiries`, `chatbot_sessions`의 상위 lifecycle 규칙은 각 소유 문서를 우선 기준으로 유지한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- `inquiry_messages` 저장 구조
- `chat_messages` 저장 구조
- `attachments` 저장 구조
- message ↔ attachment ownership 저장 규칙
- raw / display 저장 규칙
- preview 상태 저장 규칙
- 무결성 제약
- 인덱스 전략
- migration 방향

이 문서는 아래를 직접 다루지 않는다.

- `inquiries` aggregate 상세 스키마 자체
- `chatbot_sessions` aggregate 상세 스키마 자체
- attachment 바이너리 저장소 vendor 상세
- UI 렌더링 / thumbnail 크기 세부
- KPI materialized projection

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- `inquiry_messages`
- `chat_messages`
- `attachments`
- message content 저장 구조
- attachment ownership / preview 상태 저장 구조
- 조회 성능을 위한 최소 인덱스

## 2.2 직접 다루지 않는 것

- `inquiries` 상태 전이 상세
- `chatbot_sessions` 상태 전이 상세
- handoff 연결 정책 자체
- internal note 저장 구조
- 파일 바이너리 저장소 구현

## 3. Table Set

## 3.1 `inquiry_messages`

### 역할
- inquiry 내부 human-handled message timeline 저장

## 3.2 `chat_messages`

### 역할
- `chatbot_session` 내부 customer / chatbot message timeline 저장

## 3.3 `attachments`

### 역할
- 특정 message owner에 종속된 attachment metadata 저장
- preview / fallback 판단에 필요한 상태 저장

## 3.4 attachment binary 자체

### 현재 상태
- attachment 바이너리 자체는 DB의 핵심 책임이 아니다.
- DB는 `storage_key`와 metadata를 저장하고, 실제 바이너리는 외부 저장소에 둔다.

## 4. Core Table Definitions

## 4.1 `inquiry_messages`

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
- sender가 customer면 `created_by_customer_id`를 사용한다.
- sender가 operator면 `created_by_operator_id`를 사용한다.
- `content_raw`와 `content_display`는 항상 함께 저장한다.

## 4.2 `chat_messages`

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
- customer 입력이면 `created_by_customer_id`를 사용한다.
- chatbot/system 생성 메시지는 `created_by_system=true`로 해석할 수 있다.

## 4.3 `attachments`

### PK
- `id`

### 핵심 컬럼
- `id`
- `owner_type`
- `owner_id`
- `file_name`
- `mime_type`
- `file_size`
- `storage_key`
- `preview_status`
- `uploaded_by_type`
- `uploaded_by_customer_id` nullable
- `uploaded_by_operator_id` nullable
- `created_at`

### 비즈니스 해석
- attachment는 반드시 특정 message owner에 종속된다.
- orphan attachment는 허용하지 않는다.
- `owner_type`은 attachment가 `inquiry_message`에 속하는지 `chat_message`에 속하는지 구분한다.
- `storage_key`는 외부 바이너리 저장소 위치 식별자다.
- `preview_status`는 thumbnail/preview 가능 여부를 판단하는 저장 상태다.

## 5. Enum / State / Ownership Rules

## 5.1 `inquiry_messages.sender_type` enum

- `CUSTOMER`
- `OPERATOR`

## 5.2 `chat_messages.sender_type` enum

- `CUSTOMER`
- `CHATBOT`

## 5.3 `chat_messages.message_type` enum

- `QUESTION`
- `ANSWER`
- `SYSTEM_NOTICE`

## 5.4 `attachments.owner_type` enum

- `INQUIRY_MESSAGE`
- `CHAT_MESSAGE`

## 5.5 `attachments.preview_status` enum

초기 후보:

- `PENDING`
- `READY`
- `FAILED`

핵심 목적은 preview 가능 여부와 fallback 필요 여부를 저장하는 것이다.

## 5.6 ownership rule

### `inquiry_messages`
- 반드시 특정 `inquiry`에 속한다.
- orphan message는 허용하지 않는다.

### `chat_messages`
- 반드시 특정 `chatbot_session`에 속한다.
- orphan message는 허용하지 않는다.

### `attachments`
- 반드시 특정 message owner를 가진다.
- 하나의 attachment는 한 owner만 가진다.

## 6. Integrity Constraints

## 6.1 `inquiry_messages` 제약

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

## 6.3 `attachments` 제약

### DB에서 직접 강제
- `id` PK
- `owner_type` not null
- `owner_id` not null
- `file_name` not null
- `mime_type` not null
- `file_size` not null
- `storage_key` not null
- `preview_status` not null
- `uploaded_by_type` not null
- `created_at` not null

### DB check 제약 후보
- `file_size > 0`
- `owner_type in (INQUIRY_MESSAGE, CHAT_MESSAGE)`

### 애플리케이션에서 보장
- 허용 형식은 `jpg`, `jpeg`, `png`
- attachment 1개당 최대 5MB
- message당 최대 3개
- preview 실패는 attachment 자체 실패가 아니라 preview 상태 실패로 처리
- `uploaded_by_*` 필드는 uploader type과 일관되게 채운다.

## 6.4 Foreign key / owner binding 전략

### 고정 규칙
- message ownership은 강하게 묶는다.
- attachment binary는 soft reference가 아니라 `storage_key` 기반 외부 저장소 참조를 사용한다.

### 권장 FK
- `inquiry_messages.inquiry_id -> inquiries.id`
- `chat_messages.chatbot_session_id -> chatbot_sessions.id`

### owner binding 해석
- `attachments.owner_id`는 `owner_type`에 따라 `inquiry_messages.id` 또는 `chat_messages.id`를 의미한다.
- polymorphic owner binding 특성상 단일 정적 FK로 모두 강제하기 어렵다.
- owner 존재성과 owner type 일치성은 애플리케이션에서 보장한다.

## 6.5 raw / display 저장 규칙

### DB에서 직접 강제
- `content_raw` not null
- `content_display` not null

### 애플리케이션에서 보장
- 기본 출력은 `content_display`
- raw visibility는 customer-visible conversation scope에서만 허용
- internal-only data는 raw visibility 대상이 아니다.

## 7. Index Strategy

## 7.1 `inquiry_messages` 핵심 인덱스

### 추천 인덱스
- `(inquiry_id, created_at asc)`
- `(sender_type)`
- `(created_by_customer_id)`
- `(created_by_operator_id)`

## 7.2 `chat_messages` 핵심 인덱스

### 추천 인덱스
- `(chatbot_session_id, sent_at asc)`
- `(sender_type)`
- `(message_type)`
- `(created_by_customer_id)`

## 7.3 `attachments` 핵심 인덱스

### 추천 인덱스
- `(owner_type, owner_id, created_at asc)`
- `(preview_status)`
- `(uploaded_by_customer_id)`
- `(uploaded_by_operator_id)`

### 복합 인덱스 후보
- `(owner_type, owner_id, preview_status)`

## 7.4 인덱스 설계 원칙

- 상세 타임라인 기준 필드 우선
- owner binding 조회 기준 필드 우선
- preview 상태 점검 기준 필드 우선
- MVP에서는 핵심 인덱스만 먼저 둔다.

## 8. Migration Considerations

## 8.1 초기 생성 순서

1. `inquiry_messages`
2. `chat_messages`
3. `attachments`

상위 aggregate인 `inquiries`, `chatbot_sessions`가 이미 존재한다는 전제에서 message/attachment 확장 순서로 생성한다.

## 8.2 enum 변경 전략

- 초기 enum은 작게 시작
- 신규 code는 append 방식 선호
- 기존 값 rename은 가급적 피함

## 8.3 polymorphic owner 전략

- `attachments`는 `owner_type + owner_id` 조합으로 owner를 가리킨다.
- DB 단일 FK 강제보다 애플리케이션 레벨 검증을 우선한다.
- owner binding 오류는 write path에서 조기 거절한다.

## 8.4 preview 상태 전략

- 초기 스키마에 `preview_status` 포함
- preview 생성/실패 판정은 애플리케이션 로직 수행
- DB는 상태와 storage linkage 저장만 담당한다.

## 8.5 attachment history 전략

- preview 실패 attachment도 metadata는 유지한다.
- 다운로드 fallback 판단은 상태 기반으로 수행한다.
- attachment 삭제보다 상태/소유 관계 유지가 기본이다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- `storage_key` 실제 포맷 규칙
- `preview_status` 세부 상태 확장 여부
- attachment uploader 추적 필드를 더 단순화할지 여부
- polymorphic owner binding을 보조 테이블로 바꿀지 여부
- delete/anonymize 정책이 attachment metadata에 미치는 영향
