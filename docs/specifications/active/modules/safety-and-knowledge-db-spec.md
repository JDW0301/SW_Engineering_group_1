# Safety Intelligence / Knowledge DB 상세 명세

## 1. 문서 목적

본 문서는 `Safety Intelligence / Knowledge` 로직을 관계형 저장 구조로 번역한 DB 명세를 정의한다.

이 문서는 기존 aggregate DB spec의 전체 소유권을 다시 가져오지 않는다. 이미 `Case Management DB`, `Customer Portal / Handoff DB`, `Conversation / Attachments DB`가 소유하는 conversation 및 lifecycle 규칙 위에서 **summary / detection / knowledge asset persistence 공통 계약만 표준화**하며, inquiry/chatbot session의 상위 lifecycle과 message/attachment 저장은 각 소유 문서를 우선 기준으로 유지한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- `ai_summaries` 저장 구조
- `abuse_detection_results` 저장 구조
- knowledge asset 저장 구조
- `chatbot_knowledge_files` 저장 구조
- knowledge file 활성/충돌 저장 규칙
- 무결성 제약
- 인덱스 전략
- migration 방향

이 문서는 아래를 직접 다루지 않는다.

- `inquiries` aggregate 상세 스키마 자체
- `chatbot_sessions` aggregate 상세 스키마 자체
- `inquiry_messages`, `chat_messages` 저장 구조
- attachment 바이너리 저장 방식
- platform retention / privacy 정책 자체

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- `ai_summaries`
- `abuse_detection_results`
- `faq_articles`
- `policy_documents`
- `response_presets`
- `chatbot_knowledge_files`
- knowledge 관련 enum / state
- 조회 성능을 위한 최소 인덱스

## 2.2 직접 다루지 않는 것

- inquiry 상태 전이 상세
- chatbot session 상태 전이 상세
- message / attachment 저장 상세
- handoff 실행 자체
- 데이터 보관/삭제 정책 자체

## 3. Table Set

## 3.1 `ai_summaries`

### 역할
- `inquiry` 또는 `chatbot_session`의 최신 요약 보조 결과 저장

## 3.2 `abuse_detection_results`

### 역할
- customer-visible 대화에 대한 감지 결과와 완화 관련 보조 결과 저장

## 3.3 `faq_articles`

### 역할
- 반복 질의 대응용 FAQ 지식 자산 저장

## 3.4 `policy_documents`

### 역할
- 배송/환불/교환 등 운영 정책 근거 자산 저장

## 3.5 `response_presets`

### 역할
- operator 빠른 응답용 preset 자산 저장

## 3.6 `chatbot_knowledge_files`

### 역할
- chatbot self-service 응답에 쓰이는 knowledge file metadata 저장
- 활성 여부와 충돌 해소 기준 저장

## 3.7 knowledge asset usage log

### 현재 상태
- MVP 1차 구조에서는 별도 usage/event 테이블을 기본 도입 대상으로 두지 않는다.
- 참조한 knowledge asset version 정보는 후속 확장 가능 항목으로 유지한다.

## 4. Core Table Definitions

## 4.1 `ai_summaries`

### PK
- `id`

### 핵심 컬럼
- `id`
- `owner_type`
- `owner_id`
- `summary_text`
- `source_scope_kind` nullable
- `generated_at`
- `updated_at`

### 비즈니스 해석
- owner는 `inquiry` 또는 `chatbot_session`이다.
- owner당 최신 summary 1개만 유지한다.
- 재생성 시 기존 값을 overwrite한다.
- summary history는 MVP에서 보관하지 않는다.
- `source_scope_kind`는 필요 시 summary 생성 범위를 설명하는 보조 필드이며 MVP에서는 nullable 허용이 자연스럽다.

## 4.2 `abuse_detection_results`

### PK
- `id`

### 핵심 컬럼
- `id`
- `owner_type`
- `owner_id`
- `detection_status`
- `detected_category_set`
- `severity`
- `masked_segment_summary` nullable
- `analyzed_at`

### 비즈니스 해석
- detection result는 customer-visible 대화에 대한 참고 신호다.
- detection 실패 시에도 별도 상태를 저장할 수 있다.
- raw 원문은 conversation 영역이 소유하며, detection 결과는 완화/분석 신호만 저장한다.

## 4.3 `faq_articles`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `title`
- `body`
- `is_active`
- `updated_by_operator_id`
- `created_at`
- `updated_at`

### 비즈니스 해석
- FAQ는 운영자가 갱신하는 knowledge asset이다.
- inactive FAQ는 기본 참조 대상에서 제외할 수 있다.

## 4.4 `policy_documents`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `policy_type`
- `title`
- `body`
- `is_active`
- `updated_by_operator_id`
- `created_at`
- `updated_at`

### 비즈니스 해석
- policy document는 운영 정책의 근거 자산이다.
- FAQ와 유사하지만 정책성 문서라는 점에서 별도 분리한다.

## 4.5 `response_presets`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `preset_title`
- `preset_body`
- `is_active`
- `updated_by_operator_id`
- `created_at`
- `updated_at`

### 비즈니스 해석
- preset은 operator 빠른 삽입용 자산이다.
- 최종 응답 자체를 강제하지는 않는다.

## 4.6 `chatbot_knowledge_files`

### PK
- `id`

### 핵심 컬럼
- `id`
- `store_id`
- `file_name`
- `file_size`
- `storage_key` nullable
- `mime_type`
- `upload_status`
- `is_active`
- `uploaded_by_operator_id`
- `uploaded_at`
- `activated_at` nullable

### 비즈니스 해석
- knowledge file은 `.txt` only다.
- 다중 활성 허용이 기본이다.
- 충돌 시 최신 업로드 파일 우선 규칙을 적용한다.
- 업로드 실패한 파일은 active set을 바꾸지 않는다.
- 업로드 validation/storage 실패 row를 남길 경우 `storage_key`는 비어 있을 수 있다.

## 5. Enum / State / Ownership Rules

## 5.1 `ai_summaries.owner_type` enum

- `INQUIRY`
- `CHATBOT_SESSION`

## 5.2 `abuse_detection_results.owner_type` enum

- `INQUIRY`
- `CHATBOT_SESSION`

## 5.3 `abuse_detection_results.detection_status` enum

- `DETECTED`
- `NOT_DETECTED`
- `ANALYSIS_FAILED`

## 5.4 `abuse_detection_results.severity` enum

초기 후보:

- `LOW`
- `MEDIUM`
- `HIGH`

## 5.5 `chatbot_knowledge_files.upload_status` enum

- `UPLOADED`
- `FAILED`

## 5.6 `policy_documents.policy_type` enum

초기 후보:

- `DELIVERY`
- `REFUND`
- `EXCHANGE`
- `PAYMENT`
- `OTHER`

## 5.7 ownership rule

### `ai_summaries`
- 반드시 특정 `inquiry` 또는 `chatbot_session` owner를 가진다.
- owner당 최신 1개만 유지한다.

### `abuse_detection_results`
- 반드시 특정 customer-visible conversation owner를 가진다.
- 결과는 참고 신호이며 상위 흐름 자체를 막지 않는다.

### knowledge asset tables
- knowledge asset은 store 기준으로 소유된다.
- 운영자 갱신 주체를 추적할 수 있어야 한다.

## 6. Integrity Constraints

## 6.1 `ai_summaries` 제약

### DB에서 직접 강제
- `id` PK
- `owner_type` not null
- `owner_id` not null
- `summary_text` not null
- `generated_at` not null
- `updated_at` not null

### DB unique 제약 후보
- `(owner_type, owner_id)`

### 애플리케이션에서 보장
- owner당 최신 summary 1개만 유지
- 재생성 시 overwrite
- summary 실패가 conversation 흐름 자체를 막지 않음

## 6.2 `abuse_detection_results` 제약

### DB에서 직접 강제
- `id` PK
- `owner_type` not null
- `owner_id` not null
- `detection_status` not null
- `analyzed_at` not null

### 애플리케이션에서 보장
- dictionary 기반 탐지만 허용
- detection 실패 시 `ANALYSIS_FAILED` 상태 가능
- raw 원문은 conversation 계층이 소유하고, detection은 결과 신호만 저장

## 6.3 `faq_articles` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `title` not null
- `body` not null
- `is_active` not null
- `created_at` not null
- `updated_at` not null

### 애플리케이션에서 보장
- inactive FAQ는 기본 참조 후보에서 제외 가능

## 6.4 `policy_documents` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `policy_type` not null
- `title` not null
- `body` not null
- `is_active` not null
- `created_at` not null
- `updated_at` not null

### 애플리케이션에서 보장
- 정책 분류 변경은 append 또는 점진 migration을 선호

## 6.5 `response_presets` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `preset_title` not null
- `preset_body` not null
- `is_active` not null
- `created_at` not null
- `updated_at` not null

### 애플리케이션에서 보장
- preset은 응답 후보 자산이며 최종 응답 강제력이 없다.

## 6.6 `chatbot_knowledge_files` 제약

### DB에서 직접 강제
- `id` PK
- `store_id` not null
- `file_name` not null
- `file_size` not null
- `mime_type` not null
- `upload_status` not null
- `is_active` not null
- `uploaded_by_operator_id` not null
- `uploaded_at` not null

### DB check 제약 후보
- `file_size > 0`

### DB에서 nullable 허용
- `storage_key`

### 애플리케이션에서 보장
- `mime_type` / file extension은 `.txt`만 허용
- file당 최대 3MB
- 다중 활성 허용
- 충돌 시 최신 업로드 파일 우선
- 업로드 실패 시 기존 active set 유지
- 활성 파일 개수 제한은 MVP에서 두지 않음
- `upload_status=FAILED`면 `is_active=false`로 해석한다.
- `upload_status=UPLOADED`면 `storage_key`가 채워져 있어야 한다.

## 6.7 Foreign key / reference 전략

### 고정 규칙
- conversation raw/message 저장은 외부 참조로만 연결한다.
- retention/privacy 정책은 platform 정책을 참조한다.

### 권장 FK
- `faq_articles.store_id -> stores.id`
- `policy_documents.store_id -> stores.id`
- `response_presets.store_id -> stores.id`
- `chatbot_knowledge_files.store_id -> stores.id`

### owner reference 해석
- `ai_summaries.owner_id`와 `abuse_detection_results.owner_id`는 `owner_type`에 따라 `inquiries.id` 또는 `chatbot_sessions.id`를 의미한다.
- polymorphic owner 특성상 단일 정적 FK로 모두 강제하기 어렵다.
- owner 존재성과 owner type 일치성은 애플리케이션에서 보장한다.

## 7. Index Strategy

## 7.1 `ai_summaries` 핵심 인덱스

### 추천 인덱스
- `(owner_type, owner_id)`
- `(generated_at desc)`

## 7.2 `abuse_detection_results` 핵심 인덱스

### 추천 인덱스
- `(owner_type, owner_id)`
- `(detection_status)`
- `(severity)`
- `(analyzed_at desc)`

## 7.3 knowledge asset 테이블 핵심 인덱스

### `faq_articles`
- `(store_id, is_active)`
- `(updated_at desc)`

### `policy_documents`
- `(store_id, policy_type, is_active)`
- `(updated_at desc)`

### `response_presets`
- `(store_id, is_active)`
- `(updated_at desc)`

### `chatbot_knowledge_files`
- `(store_id, is_active)`
- `(upload_status)`
- `(uploaded_at desc)`

## 7.4 인덱스 설계 원칙

- owner별 최신 summary/detection 조회 우선
- store별 active knowledge asset 조회 우선
- 최신 업로드 우선 규칙 적용을 위한 시간 인덱스 우선
- MVP에서는 핵심 인덱스만 먼저 둔다.

## 8. Migration Considerations

## 8.1 초기 생성 순서

1. `faq_articles`
2. `policy_documents`
3. `response_presets`
4. `chatbot_knowledge_files`
5. `ai_summaries`
6. `abuse_detection_results`

conversation owner를 참조하는 보조 결과물은 상위 aggregate 존재 이후 생성하는 것이 자연스럽다.

## 8.2 enum 변경 전략

- 초기 enum은 작게 시작
- 신규 code는 append 방식 선호
- 기존 값 rename은 가급적 피함

## 8.3 overwrite summary 전략

- summary history 테이블은 1차 MVP에서 도입하지 않음
- overwrite 기반 최신 1개 유지 전략을 우선한다.

## 8.4 knowledge file activation 전략

- 다중 활성 허용을 기본으로 둔다.
- 충돌 해소는 별도 mapping 테이블보다 최신 업로드 우선 규칙으로 먼저 처리한다.
- 더 정교한 topic mapping은 후속 확장 대상으로 남긴다.

## 8.5 retention / privacy 연계 전략

- 보관/삭제 정책은 platform 문서를 참조한다.
- summary / detection / knowledge asset 저장 기간은 후속 정책 정의를 따른다.
- customer raw 원문 자체는 conversation 계층이 소유한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- `source_scope_kind` 값 세분화 여부
- `detected_category_set` 저장 포맷(JSON/array/string) 세부
- knowledge file topic 분류 필드 추가 여부
- FAQ / policy / preset 검색 인덱스 세부
- knowledge asset usage/history 테이블 도입 시점
