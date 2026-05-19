# 데이터베이스 문서 안내

## 목적

이 문서는 데이터베이스 관련 문서의 진입점이다.

이제 DB 설명은 한 파일에 모두 몰아넣지 않고, 구현 영역별 필수 DB 문서로 나누어 관리한다.

## 읽는 순서

1. `03-required-db-core-and-inquiry.md`
2. `04-required-db-customer-and-linking.md`
3. `05-required-db-chatbot.md`
4. `06-required-db-knowledge-and-ai.md`
5. `07-required-db-search-metrics-and-commerce-context.md`

## 문서 작성 원칙

- 학생 프로젝트에서 실제로 화면과 기능을 작동시키는 데 필요한 테이블만 우선 정의한다.
- `필수`는 해당 영역의 화면과 흐름을 실제로 시연하려면 바로 필요한 테이블만 뜻한다.
- 최적화, 운영 편의, 추적, 집계, 고급 AI 운영 구조는 `필수`에 넣지 않는다.
- customer / operator / shared 책임 경계를 문서 계층과 맞춘다.
- 외부 snapshot과 로컬 계정은 직접 동일시하지 않고 link/claim 구조로 분리한다.
- 검색, 지표, 동기화 로그 같은 운영 보조 구조는 꼭 필요해질 때까지 최소화한다.

## 이번 분리에서 유지하는 기준

- 문의 중심 구조를 유지한다.
- 고객 앱과 운영자 앱이 공유하는 핵심 데이터는 공통 DB 문서에서 먼저 설명한다.
- 고객 전용 계정 연결과 주문 claim은 별도 문서에서 설명한다.
- 챗봇, 지식, AI 보조, 검색/지표는 각각 필요한 최소 범위만 정의한다.

## 현재 구현 반영 메모

2026-05-19 기준 현재 브랜치에서는 목업/로컬 state로만 보이던 주요 화면을 DB seed와 API로 연결했다.

현재 화면에서 사용 중인 핵심 테이블은 아래 문서에 나뉘어 있다.

- 공통 계정, 스토어, 문의, 메시지, 내부 메모: `03-required-db-core-and-inquiry.md`
- 고객 주문/스토어 맥락: `04-required-db-customer-and-linking.md`
- 상담 세션/메시지: `05-required-db-chatbot.md`
- FAQ, 응답 프리셋, 챗봇 지식 파일: `06-required-db-knowledge-and-ai.md`

스토어별 운영자 연결은 별도 권한 테이블을 만들지 않고 `store.owner_user_id -> app_user.id`로 단순하게 처리한다.

운영자 workspace 조회는 로그인한 운영자 계정이 소유한 store만 대상으로 주문, 상담, 문의를 모아 보여준다.

FAQ는 `faq_article`의 스토어별 active row를 조회하며, 고객 챗봇 화면에서 FAQ 버튼을 누르면 AI 서버 호출 없이 DB 답변을 즉시 표시한다.

## 의도적으로 아직 확장하지 않는 것

- 무거운 감사 로그
- 고급 이벤트 저장
- 세밀한 권한 전용 테이블
- 저수준 재시도/백오프 기록
- 과도한 연동 추적 저장
