# API 단계별 작업 수행 파일

## 1. 작업 목적

이 문서는 `SW_Engineering_group_1` 프로젝트의 API 구현과 문서화를 단계별로 수행하기 위한 작업 파일이다.

현재 프로젝트는 인증과 고객 홈 통합 조회 API가 구현되어 있고, 문의/챗봇/운영자/지식/검색/지표 API는 화면과 DB 또는 기획 문서에만 일부 존재한다. 따라서 먼저 실제 구현 상태를 기준으로 안정화한 뒤, 제품의 핵심 흐름인 “고객 문의 생성 → 운영자 응답 → 고객 확인 → 챗봇 handoff” 순서로 확장한다.

## 2. 작업 전 확인 범위

### 반드시 확인할 서버 파일

1. `server/main.py`
2. `server/app/auth.py`
3. `server/app/customer_home.py`
4. `server/app/validation.py`
5. `server/app/security.py`
6. `server/app/repositories.py`
7. `server/app/database.py`
8. `server/app/exceptions.py`
9. `server/sql/schema.sql`

### 반드시 확인할 클라이언트 파일

1. `code/src/api/auth.js`
2. `code/src/api/customerHome.js`
3. `code/src/App.jsx`
4. `code/src/pages/auth/LoginPage.jsx`
5. `code/src/pages/auth/RegisterPage.jsx`
6. `code/src/pages/customer/CustomerApp.jsx`
7. `code/src/pages/customer/StorePage.jsx`
8. `code/src/pages/customer/ConsultTab.jsx`
9. `code/src/pages/customer/ChatbotTab.jsx`
10. `code/src/pages/customer/BoardTab.jsx`
11. `code/src/pages/customer/InquiryDetailPage.jsx`
12. `code/src/pages/operator/OperatorApp.jsx`
13. `code/src/pages/operator/OperatorMain.jsx`
14. `code/src/pages/operator/OperatorInquiryDetail.jsx`
15. `code/src/data/mockData.js`

### 반드시 확인할 명세 파일

1. `specs/04-technical-reference/01-api-spec-summary.md`
2. `specs/04-technical-reference/02-database-schema-draft.md`
3. `specs/00-overview/02-system-architecture.md`
4. `specs/00-overview/04-implementation-order.md`
5. `specs/01-operator-app/01-inquiry-workspace.md`
6. `specs/02-customer-app/01-customer-portal.md`
7. `specs/02-customer-app/02-chatbot-and-handoff.md`
8. `specs/03-features-and-logic/01-conversation-and-content.md`

## 3. 단계별 수행 계획

## 1단계: 실행 환경과 현재 API 확인

### 목표

현재 서버와 클라이언트가 어떤 API를 실제로 사용하는지 확인한다.

### 수행 작업

1. `server/README.md`의 실행 방법을 확인한다.
2. `server/sql/schema.sql`로 필요한 테이블을 확인한다.
3. `server/main.py`에서 현재 등록된 엔드포인트를 목록화한다.
4. `code/src/api/*.js`에서 클라이언트가 호출하는 API를 목록화한다.
5. 구현 API와 화면 mock 상태를 분리한다.

### 완료 기준

- 실제 구현 API 목록이 정리되어 있다.
- mock data로만 작동하는 화면을 구분했다.
- 인증이 필요한 API와 필요 없는 API를 구분했다.

## 2단계: 인증 API 안정화

### 대상 API

- `POST /api/auth/signup/customer`
- `POST /api/auth/signup/operator`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 수행 작업

1. 회원가입 필수 필드와 클라이언트 form 필드를 맞춘다.
2. 중복 아이디와 중복 이메일 오류 메시지를 확인한다.
3. 로그인 후 access token과 refresh token 저장을 확인한다.
4. 새로고침 시 `GET /api/auth/me` 또는 `POST /api/auth/refresh` 흐름이 정상인지 확인한다.
5. 운영자 `GET /api/auth/me` 응답에 store 정보가 포함되는지 확인한다.

### 완료 기준

- 고객 회원가입 후 고객 로그인 가능
- 운영자 회원가입 후 운영자 로그인 가능
- 잘못된 역할 탭으로 로그인 시 클라이언트에서 차단
- refresh token으로 세션 복구 가능
- 로그아웃 시 refresh token 폐기

## 3단계: 고객 홈 API 안정화

### 대상 API

- `GET /api/customer/home`

### 수행 작업

1. `ensure_demo_customer_home_data()`가 데모 데이터를 중복 생성하지 않는지 확인한다.
2. 고객 계정만 접근할 수 있도록 role 검증을 유지한다.
3. 주문 응답 필드가 `MainPage.jsx`에서 사용하는 필드와 일치하는지 확인한다.
4. 스토어 응답 필드가 `StorePage.jsx`에서 사용하는 필드와 일치하는지 확인한다.
5. 문의 응답 필드가 `InquiryDetailPage.jsx`에서 사용하는 필드와 일치하는지 확인한다.

### 완료 기준

- 고객 메인 화면에서 최근 주문이 표시된다.
- 주문했던 스토어가 표시된다.
- 진행 중 상담과 최근 문의가 표시된다.
- 운영자 token으로 요청하면 거부된다.

## 4단계: 문의/상담 API 구현

### 대상 API

- `GET /api/inquiries`
- `POST /api/inquiries`
- `GET /api/inquiries/{inquiryId}`
- `POST /api/inquiries/{inquiryId}/messages`
- `PATCH /api/inquiries/{inquiryId}/status`
- `POST /api/inquiries/{inquiryId}/notes`

### 수행 작업

1. 고객 문의와 상담을 서버 DB 기준으로 저장할 모델을 결정한다.
2. 현재 `support_session`과 `inquiry_post`가 분리되어 있으므로, 화면에서 `type: 상담`과 `type: 문의`를 어떻게 매핑할지 정한다.
3. 고객이 상담을 시작하면 `support_session`과 첫 `support_message`를 생성한다.
4. 고객이 문의 게시글을 작성하면 `inquiry_post`를 생성한다.
5. 운영자 답변은 상담이면 `support_message`, 게시글이면 `inquiry_post_reply`에 저장한다.
6. 상태 변경 API는 `support_status` 또는 `inquiry_status`를 갱신한다.
7. 내부 메모는 현재 `schema.sql`에 별도 테이블이 없으므로, 구현 전 테이블 추가 여부를 결정한다.

### 완료 기준

- 고객이 서버에 새 상담을 생성할 수 있다.
- 고객이 서버에 새 문의 게시글을 생성할 수 있다.
- 운영자가 서버 데이터 기준으로 문의 목록을 볼 수 있다.
- 운영자가 답변과 상태 변경을 저장할 수 있다.
- 새로고침 후에도 문의/답변/상태가 유지된다.

## 5단계: 운영자 API 구현

### 대상 API

- `GET /api/operator/inquiries`
- `GET /api/operator/inquiries/{inquiryId}`
- `POST /api/operator/inquiries/{inquiryId}/reply`
- `PATCH /api/operator/inquiries/{inquiryId}/status`
- `POST /api/operator/inquiries/{inquiryId}/internal-notes`

### 수행 작업

1. 운영자 token의 `role = OPERATOR`를 검증한다.
2. 운영자 소유 store를 기준으로 문의 목록을 필터링한다.
3. 문의 상세에 고객 정보, 주문 정보, 상품 정보를 함께 내려준다.
4. 답변 저장 후 `last_message_at`을 갱신한다.
5. 상태 변경은 단순하게 `IN_PROGRESS`, `RESOLVED`부터 지원한다.
6. 내부 메모는 고객 응답과 분리해서 저장한다.

### 완료 기준

- 운영자는 자신의 스토어 문의만 볼 수 있다.
- 운영자 답변이 고객 상세 화면에 표시된다.
- 내부 메모는 고객 화면에 노출되지 않는다.
- 상태 변경이 목록과 상세에 반영된다.

## 6단계: 챗봇 및 handoff API 구현

### 대상 API

- `POST /api/chatbot/sessions`
- `GET /api/chatbot/sessions/{sessionId}`
- `POST /api/chatbot/sessions/{sessionId}/messages`
- `POST /api/chatbot/sessions/{sessionId}/handoff`

### 수행 작업

1. 고객과 store 기준으로 `chatbot_session`을 생성한다.
2. 고객 질문을 `chatbot_message`에 저장한다.
3. 초기 챗봇 응답은 `MOCK_FAQ` 수준의 단순 규칙으로 구현한다.
4. handoff 요청 시 `support_session`을 생성하거나 기존 연결 session을 반환한다.
5. `chatbot_session.linked_support_session_id`를 저장한다.
6. 운영자 상세 화면에서 챗봇 요약 또는 메시지 일부를 볼 수 있게 응답을 구성한다.

### 완료 기준

- 고객 챗봇 대화가 새로고침 후에도 유지된다.
- handoff 시 상담이 생성된다.
- 같은 챗봇 세션에서 handoff를 반복해도 중복 상담이 생성되지 않는다.
- 운영자가 handoff 맥락을 확인할 수 있다.

## 7단계: 지식 자산 API 구현

### 대상 API

- FAQ 목록/생성/수정/삭제
- 응답 프리셋 목록/생성/수정/삭제
- 챗봇 지식 파일 업로드/목록/활성 여부 변경

### 수행 작업

1. `faq` 테이블을 기준으로 고객 챗봇 FAQ를 서버화한다.
2. `response_preset` 테이블을 기준으로 운영자 빠른 답변을 서버화한다.
3. `chatbot_knowledge_file`은 파일명, URL, 활성 여부 중심으로 단순하게 구현한다.
4. 고급 버전 관리나 승인 워크플로는 추가하지 않는다.

### 완료 기준

- 고객 챗봇 FAQ가 서버 데이터로 표시된다.
- 운영자 빠른 답변이 서버 데이터로 표시된다.
- 지식 파일 목록과 활성 여부를 확인할 수 있다.

## 8단계: 요약 및 안전 보조 API 구현

### 대상 API

- `POST /api/ai/inquiries/{inquiryId}/summary`
- `POST /api/ai/chatbot-sessions/{sessionId}/summary`
- `POST /api/ai/messages/{messageId}/safety-check`

### 수행 작업

1. 실제 외부 AI 연동 전에는 규칙 기반 또는 mock 요약으로 시작한다.
2. 고객/운영자 메시지 타임라인을 입력으로 받는다.
3. 요약은 운영자 보조 카드에 표시한다.
4. 안전 보조는 메시지 원문 삭제가 아니라 표시 완화 또는 경고 배지로 처리한다.

### 완료 기준

- 운영자가 문의 요약을 볼 수 있다.
- 챗봇 handoff 상담에서 챗봇 대화 요약을 볼 수 있다.
- 안전 보조 결과가 고객 메시지 처리에 보조 신호로만 사용된다.

## 9단계: 검색 및 지표 API 구현

### 대상 API

- `GET /api/operator/inquiries/search`
- `GET /api/operator/metrics/summary`
- `GET /api/stores/{storeId}/stats/daily`

### 수행 작업

1. 운영자 store 기준으로 검색 범위를 제한한다.
2. 고객명, 주문번호, 상품명, 상태, 유형, 기간 필터를 지원한다.
3. KPI는 먼저 실시간 DB 조회 계산으로 구현한다.
4. `store_stat_daily` 집계는 필요할 때만 사용한다.

### 완료 기준

- 운영자가 문의를 조건별로 검색할 수 있다.
- 운영자 홈에 상담 완료율, 대기 문의 수, 평균 첫 응답 시간이 표시된다.
- mock data 계산을 서버 응답으로 대체할 수 있다.

## 10단계: 커머스 맥락 및 claim/link API 구현

### 대상 API

- 주문/상품/customer snapshot 조회 API
- 주문 claim 후보 조회 API
- 주문 claim 요청 API
- mock verification 요청/확인 API

### 수행 작업

1. 로컬 계정과 외부 snapshot을 같은 사용자로 자동 취급하지 않는다.
2. 주문번호와 낮은 민감도의 정보로 claim 후보를 조회한다.
3. claim 성공 시 고객 계정과 snapshot 연결을 저장한다.
4. 필요한 경우에만 mock verification을 보조 흐름으로 둔다.
5. 주민등록번호 같은 민감 식별자는 수집하지 않는다.

### 완료 기준

- 신규 고객이 기존 주문을 자기 계정에 연결할 수 있다.
- 연결된 주문/스토어가 고객 홈에 반영된다.
- mock verification은 학교 프로젝트용 시뮬레이션으로만 설명된다.

## 4. 최종 검증 체크리스트

### 서버 검증

- [ ] FastAPI 서버가 실행된다.
- [ ] MySQL 연결이 성공한다.
- [ ] `GET /api/health`가 `{"message":"ok"}`를 반환한다.
- [ ] 회원가입, 로그인, refresh, logout이 정상 동작한다.
- [ ] 보호 API는 Authorization header 없이는 접근할 수 없다.
- [ ] role이 맞지 않는 사용자는 접근이 거부된다.

### 클라이언트 검증

- [ ] 고객 회원가입 후 로그인할 수 있다.
- [ ] 운영자 회원가입 후 로그인할 수 있다.
- [ ] 고객 홈에서 주문/스토어/문의가 보인다.
- [ ] 고객 상담/문의 작성 후 새로고침해도 데이터가 남는다.
- [ ] 운영자 화면에서 문의를 보고 답변할 수 있다.
- [ ] 운영자 상태 변경이 고객 화면에 반영된다.

### 문서 검증

- [ ] 구현된 API와 예정 API가 구분되어 있다.
- [ ] 각 API에 Method, Path, 인증 여부, 요청 필드, 응답 필드가 있다.
- [ ] 고객 기능과 운영자 기능이 섞이지 않는다.
- [ ] mock verification은 실제 본인확인으로 설명하지 않는다.
- [ ] 학생 프로젝트 범위를 넘는 과도한 운영 정책을 추가하지 않는다.

## 5. 작업 순서 요약

1. 현재 구현 API 확인
2. 인증 API 안정화
3. 고객 홈 API 안정화
4. 문의/상담 API 구현
5. 운영자 문의 처리 API 구현
6. 챗봇 및 handoff API 구현
7. 지식 자산 API 구현
8. 요약 및 안전 보조 API 구현
9. 검색 및 지표 API 구현
10. 커머스 맥락 및 claim/link API 구현
