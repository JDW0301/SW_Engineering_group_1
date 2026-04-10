# 필수 DB - 지식 자산과 AI 보조 영역

## 목적

이 문서는 운영자 응답과 챗봇 응답을 보조하는 지식 자산, 그리고 요약/안전 보조를 위한 최소 DB를 정리한다.

이 영역은 핵심 문의 흐름을 대체하지 않고, 빠른 이해와 응답 품질 향상을 돕는 보조 기능으로 본다.

이 문서의 `필수`는 핵심 문의 흐름 이후에도 프로젝트의 지식 지원, 요약, 안전 보조 테마를 실제 화면에서 보여주기 위해 필요한 최소 구조를 뜻한다.

## 이 문서가 담당하는 화면/기능

- FAQ 조회
- 정책 문서 조회
- 응답 프리셋 조회 및 삽입
- 챗봇 지식 파일 업로드 및 목록
- 문의 요약
- 챗봇 세션 요약
- 악성 표현 감지 결과 표시

## 필수 테이블

### `faq_article`

반복 문의에 답하기 위한 FAQ 문서다.

필수 필드:

- `id`
- `store_id` (optional)
- `title`
- `content`
- `is_active`
- `created_at`

### `policy_document`

반품, 환불, 배송 같은 운영 기준 문서다.

필수 필드:

- `id`
- `store_id` (optional)
- `title`
- `content`
- `document_type`
- `is_active`
- `created_at`

### `response_preset`

운영자가 빠르게 삽입할 수 있는 응답 템플릿이다.

필수 필드:

- `id`
- `store_id` (optional)
- `title`
- `content`
- `is_active`
- `created_at`

### `chatbot_knowledge_file`

챗봇이 참고하는 지식 파일의 메타데이터다.

필수 필드:

- `id`
- `store_id` (optional)
- `file_name`
- `file_url` 또는 `storage_key`
- `is_active`
- `created_at`

실제 임베딩 저장까지 먼저 설계할 필요는 없고, 파일 관리와 활성 여부 정도면 충분하다.

### `ai_summary`

문의 또는 챗봇 세션의 요약 결과다.

필수 필드:

- `id`
- `target_type`
- `target_id`
- `summary_text`
- `created_at`

현재 단계에서는 버전 관리보다 최신 요약을 보여주는 쪽이 중요하다.

### `abuse_detection_result`

악성 표현 또는 안전 관련 보조 판정 결과다.

필수 필드:

- `id`
- `target_type`
- `target_id`
- `result_label`
- `result_score` (optional)
- `created_at`

이 결과는 운영자 판단을 대체하지 않고, 화면 표시 보조 정보로 사용한다.

## 필수 관계

- `faq_article.store_id -> store.id` (optional)
- `policy_document.store_id -> store.id` (optional)
- `response_preset.store_id -> store.id` (optional)
- `chatbot_knowledge_file.store_id -> store.id` (optional)
- `ai_summary.target_id -> inquiry.id` 또는 `chatbot_session.id`
- `abuse_detection_result.target_id -> inquiry_message.id` 또는 `chat_message.id`

`ai_summary`와 `abuse_detection_result`는 다형 참조 개념으로 이해하면 충분하다.

엄격한 polymorphic schema를 먼저 설계하는 것보다, 어떤 대상을 위한 결과인지 화면에서 구분 가능하게 만드는 것이 더 중요하다.

## 현재 단계에서 굳이 만들지 않는 것

- 모델 버전 세부 로그
- 프롬프트 추적 테이블
- 평가 데이터셋 저장 구조
- 피드백 루프 학습용 테이블

## 구현 우선순위

이 문서의 DB는 문의/고객/챗봇 핵심 흐름이 연결된 뒤 붙인다.

추천 순서는 아래와 같다.

1. `faq_article`
2. `policy_document`
3. `response_preset`
4. `chatbot_knowledge_file`
5. `ai_summary`
6. `abuse_detection_result`
