# 도메인 모델 및 데이터 구조

## 1. 목적

본 문서는 서비스의 핵심 데이터 단위, 관계, 명명 규칙, 소유권 기준을 정의한다.

## 2. 핵심 엔티티 목록

| 엔티티 | 설명 | 주요 소유 주체 |
|---|---|---|
| `store` | 사업자가 운영하는 자사몰 단위 | merchant |
| `product` | 스토어에서 판매하는 상품의 운영용 snapshot | external sync |
| `customer` | 주문 및 문의를 발생시키는 회원 고객의 운영용 snapshot | external sync |
| `order` | 고객 주문 정보의 운영용 snapshot | external sync |
| `inquiry` | 사람 상담 대상으로 관리되는 문의 단위 | store scope |
| `inquiry_message` | 문의 맥락에 속한 고객/운영자 대화 메시지 단위 | inquiry |
| `chatbot_session` | 고객 self-service 챗봇 대화 단위 | customer portal |
| `chat_message` | 챗봇 세션에 속한 메시지 단위 | chatbot_session |
| `attachment` | 문의 또는 챗봇 대화에 첨부된 파일 | inquiry/chatbot |
| `internal_note` | 고객에게 비노출되는 내부 메모 | inquiry |
| `response_preset` | 운영자가 반복 응대에 사용하는 문구 | store |
| `faq_article` | 자주 묻는 질문 지식 항목 | store |
| `policy_document` | 배송/환불/교환 등 정책 문서 | store |
| `ai_summary` | 문의 또는 챗봇 대화 요약 결과 | inquiry/chatbot |
| `abuse_detection_result` | 자동 감지 결과 및 표시 완화 정보 | inquiry/chatbot/message |
| `handoff_event` | 챗봇 또는 자동화 흐름에서 사람 상담으로 전환된 이력 | inquiry |

## 3. 엔티티 관계

```text
store
 ├─ product (snapshot)
 ├─ customer (snapshot)
 │   ├─ order (snapshot)
 │   ├─ inquiry
 │   │   ├─ inquiry_message
 │   │   ├─ internal_note
 │   │   ├─ attachment
 │   │   ├─ ai_summary
 │   │   ├─ abuse_detection_result
 │   │   └─ handoff_event
 │   └─ chatbot_session
 │       ├─ chat_message
 │       ├─ attachment
 │       ├─ ai_summary
 │       └─ abuse_detection_result
 ├─ response_preset
 ├─ faq_article
 └─ policy_document
```

## 4. 공통 식별자 규칙

- 모든 최상위 엔티티는 고유 `id`를 가진다.
- 외부 시스템과 연동되는 snapshot 엔티티는 내부 `id`와 별도로 `external_reference_id`를 가진다.
- 스토어 범위 데이터는 반드시 `store_id`를 포함한다.
- 고객이 참여하는 문의와 챗봇 세션은 반드시 `customer_id`를 포함한다.

## 5. 엔티티별 최소 필드 초안

## 5.1 store

- `id`
- `name`
- `status`
- `owner_account_id`
- `created_at`
- `updated_at`

## 5.2 customer

- `id`
- `store_id`
- `external_reference_id`
- `name`
- `contact_masked`
- `status`
- `created_at`
- `updated_at`

## 5.3 order

- `id`
- `store_id`
- `customer_id`
- `external_reference_id`
- `order_number`
- `order_status`
- `ordered_at`
- `source_type`
- `updated_at`

## 5.4 product

- `id`
- `store_id`
- `external_reference_id`
- `name`
- `status`
- `updated_at`

## 5.5 inquiry

- `id`
- `store_id`
- `customer_id`
- `order_id` (optional)
- `product_id` (optional)
- `linked_chatbot_session_id` (optional)
- `inquiry_type`
- `inquiry_channel`
- `status`
- `assigned_operator_id` (optional)
- `opened_at`
- `last_message_at`
- `last_response_at` (optional)
- `closed_at` (optional)
- `expired_at` (optional)

`linked_chatbot_session_id`는 챗봇 self-service 흐름에서 사람 상담으로 전환된 문의에만 사용한다.

## 5.6 inquiry_message

- `id`
- `inquiry_id`
- `sender_type`
- `content_raw`
- `content_display`
- `created_at`

`content_raw`와 `content_display`를 분리하는 이유는 원문 보존과 표시 완화/마스킹을 동시에 지원하기 위함이다. 기본 UI/API 출력은 `content_display`를 사용한다.

## 5.7 chatbot_session

- `id`
- `store_id`
- `customer_id`
- `session_status`
- `knowledge_source_version` (optional)
- `started_at`
- `last_message_at`
- `handoff_requested_at` (optional)
- `expired_at` (optional)

## 5.8 chat_message

- `id`
- `chatbot_session_id`
- `sender_type`
- `message_type`
- `content_raw`
- `content_display`
- `sent_at`

## 5.9 attachment

- `id`
- `owner_type` (`inquiry_message` 또는 `chat_message`)
- `owner_id`
- `file_name`
- `mime_type`
- `file_size`
- `storage_key`
- `preview_status`
- `uploaded_by`
- `uploaded_at`

## 5.10 ai_summary

- `id`
- `owner_type` (`inquiry` 또는 `chatbot_session`)
- `owner_id`
- `source_message_range`
- `summary_text`
- `summary_version`
- `generated_at`

## 5.11 abuse_detection_result

- `id`
- `owner_type` (`inquiry_message` 또는 `chat_message`)
- `owner_id`
- `severity`
- `detected_categories`
- `masked_segments`
- `generated_at`

## 6. 데이터 소유권 기준

## 6.1 시스템 원본 여부

- `product`, `order`, `customer`는 외부 시스템이 원본(source of truth)이며 본 시스템은 운영용 snapshot만 유지한다.
- `inquiry`, `inquiry_message`, `chatbot_session`, `chat_message`, `internal_note`, `response_preset`, `faq_article`, `policy_document`, `ai_summary`, `abuse_detection_result`, `handoff_event`는 본 시스템이 원본이다.

## 6.2 충돌 처리 기준

- 외부 snapshot 갱신은 외부 시스템 우선으로 처리한다.
- 운영자가 수동 재동기화를 수행할 수 있으나, snapshot의 최종 기준은 외부 데이터다.
- 문의와 챗봇 세션 안의 메시지 원문은 본 시스템 저장 값을 기준으로 삼는다.

## 7. 통합 상담 조회용 데이터 묶음

문의 상세 화면은 다음 집합을 하나의 작업 단위로 조회한다.

- 문의 기본 정보
- 최근 문의 메시지 및 요약 정보
- 고객 기본 정보
- 고객 주문 이력
- 고객 문의 이력
- 관련 상품 정보
- 내부 메모
- 자동 감지/요약 결과
- 연결된 `chatbot_session` 참조 정보와 전체 원문 접근 링크

이 묶음을 본 문서에서는 `case_context_bundle`이라 정의한다.

## 8. 명명 규칙

- DB/백엔드 식별자: `snake_case`
- 프론트엔드 컴포넌트/모듈명: `PascalCase` 또는 `kebab-case` 경로
- 상태값 enum: `UPPER_SNAKE_CASE`
- API 필드명: 백엔드와 동일한 `snake_case`를 우선 권장

## 9. 추가 정의 필요 사항

- 고객 연락처 필드의 실제 저장 범위
- 외부 snapshot 필드별 반영 범위
- 문의가 주문 또는 상품과 연결되지 않는 경우의 처리 기준
