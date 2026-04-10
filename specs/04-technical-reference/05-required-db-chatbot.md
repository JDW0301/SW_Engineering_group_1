# 필수 DB - 챗봇과 handoff 영역

## 목적

이 문서는 고객 self-service 챗봇과 관리자 응대 전환 흐름을 지원하는 최소 DB를 정리한다.

핵심은 챗봇이 독립 세션으로 존재하되, 필요할 때 문의와 연결될 수 있어야 한다는 점이다.

## 이 문서가 담당하는 화면/기능

- 챗봇 세션 시작
- 챗봇 메시지 송수신
- 고객 화면의 챗봇 탭
- handoff 요청
- 운영자 화면에서 연결된 챗봇 맥락 확인

## 필수 테이블

### `chatbot_session`

고객의 self-service 챗봇 세션이다.

필수 필드:

- `id`
- `store_id`
- `local_user_account_id`
- `status`
- `created_at`

이 세션은 문의와 별개로 시작될 수 있어야 하므로 독립 테이블이 필요하다.

### `chat_message`

챗봇 세션 안의 메시지다.

필수 필드:

- `id`
- `chatbot_session_id`
- `sender_type`
- `content_raw`
- `content_display`
- `created_at`

`sender_type`은 고객과 챗봇 응답을 구분하는 최소 기준이다.

## 필수 관계

- `chatbot_session.store_id -> store.id`
- `chatbot_session.local_user_account_id -> local_user_account.id`
- `chat_message.chatbot_session_id -> chatbot_session.id`
- `inquiry.linked_chatbot_session_id -> chatbot_session.id` (optional, canonical)

현재 문서에서는 handoff 이후 연결 기준을 `inquiry.linked_chatbot_session_id` 한 방향으로 정리한다.

즉, 챗봇 세션은 독립적으로 시작될 수 있고, 관리자 응대로 넘어갈 때 문의 쪽에서 연결 정보를 가진다.

## 현재 단계에서 굳이 만들지 않는 것

- 챗봇 tool-call 로그 테이블
- 모델 사용량 청구 테이블
- 프롬프트 버전 이력 저장
- 장기 메모리 벡터 저장소 전용 테이블

이 프로젝트에서 챗봇은 제품 주제상 중요하지만, LLM 운영 인프라 자체를 재현하는 것이 목표는 아니다.

## 구현 우선순위

이 문서의 DB는 문의 흐름과 고객 기본 흐름이 동작한 뒤 붙인다.

추천 순서는 아래와 같다.

1. `chatbot_session`
2. `chat_message`
3. `inquiry`와의 연결 필드 반영
