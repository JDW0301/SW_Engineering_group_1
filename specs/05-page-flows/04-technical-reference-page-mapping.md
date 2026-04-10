# 페이지와 기술 참조 매핑

## 목적

이 문서는 각 페이지를 구현할 때 현재 `specs/04-technical-reference/`의 어떤 문서를 함께 보면 되는지 연결해 준다.

핵심은 페이지 문서가 사용자 경험을 설명하고, 기술 참조 문서가 구현에 필요한 최소 API/DB 관점을 보강하도록 역할을 나누는 것이다.

## 페이지별 기술 참조 연결

| 페이지 | 주로 참고할 기술 문서 | 이유 |
|---|---|---|
| 공용 진입/라우팅 | `01-api-spec-summary.md` | 앱 진입과 기본 인증/세션 흐름 참조 |
| 운영자 문의 목록 | `01-api-spec-summary.md`, `03-required-db-core-and-inquiry.md`, `07-required-db-search-metrics-and-commerce-context.md` | inquiry 목록, 검색, KPI, snapshot projection 필요 |
| 운영자 문의 상세 | `01-api-spec-summary.md`, `03-required-db-core-and-inquiry.md`, `05-required-db-chatbot.md`, `06-required-db-knowledge-and-ai.md`, `07-required-db-search-metrics-and-commerce-context.md` | 문의 처리, 연결 챗봇, 요약/안전, snapshot 맥락 필요 |
| 지식/프리셋 관리 | `01-api-spec-summary.md`, `06-required-db-knowledge-and-ai.md` | knowledge file, preset, FAQ/policy 참조 |
| 스냅샷 상세/복구 | `01-api-spec-summary.md`, `07-required-db-search-metrics-and-commerce-context.md` | customer/order/product snapshot과 재동기화 참조 |
| 고객 지원 진입 | `01-api-spec-summary.md` | 고객 앱 시작점과 세션 기준 확인 |
| 내 스토어 목록/검색 | `01-api-spec-summary.md`, `04-required-db-customer-and-linking.md`, `07-required-db-search-metrics-and-commerce-context.md` | customer-link, store context, snapshot 조회 필요 |
| 주문 연결(claim/link) | `01-api-spec-summary.md`, `04-required-db-customer-and-linking.md` | 로컬 계정과 외부 snapshot 연결 흐름 필요 |
| 고객 문의 목록/상세 | `01-api-spec-summary.md`, `03-required-db-core-and-inquiry.md`, `07-required-db-search-metrics-and-commerce-context.md` | inquiry 조회, 메시지, 상태, 주문/상품 요약 필요 |
| 챗봇 세션 | `01-api-spec-summary.md`, `05-required-db-chatbot.md`, `06-required-db-knowledge-and-ai.md` | chatbot session/message, handoff, knowledge support 필요 |

## 기술 참조를 읽는 방법

### 1. 먼저 페이지 문서를 읽는다.

페이지 문서에서 아래를 먼저 확정한다.

- 누가 쓰는 페이지인지
- 어떤 행동이 가능한지
- 어떤 정보가 보여야 하는지

### 2. 그 다음 기술 문서를 읽는다.

기술 문서에서는 아래만 확인한다.

- 이 페이지에 필요한 최소 API
- 필요한 최소 데이터 구조
- inquiry / chatbot / snapshot / knowledge 간 연결 방식

### 3. MVP 범위를 넘는 구현은 뒤로 미룬다.

이 프로젝트는 학생 프로젝트이므로, 아래는 처음부터 깊게 구현하지 않는다.

- 복잡한 권한 매트릭스
- exhaustive한 예외 분기
- 고급 이벤트 추적과 재처리 관리
- 운영 정책 중심의 세부 상태 표준화

## 최소 구현 데이터 원칙

페이지 구현 시 우선 필요한 핵심 데이터는 아래 정도로 제한한다.

- `inquiry`
- `inquiry_message`
- `chatbot_session`
- `chat_message`
- `internal_note`
- `ai_summary`
- `abuse_detection_result`
- `faq_article` / `policy_document` / `response_preset`
- customer/order/product snapshot

이 원칙은 기능을 줄이자는 뜻이 아니라, 페이지가 보여줘야 하는 핵심 맥락만 먼저 구현하자는 뜻이다.

## 구현상 주의점

- 고객용 페이지와 운영자용 페이지는 같은 엔티티를 보더라도 노출 내용이 다르다.
- `chatbot_session`은 `inquiry`와 별도 흐름이다.
- handoff는 연결을 만드는 것이지 엔티티를 합치는 것이 아니다.
- snapshot 누락은 문의 자체를 무효화하지 않는다.
- summary와 safety는 참고 정보이며 최종 상태 결정 주체가 아니다.
