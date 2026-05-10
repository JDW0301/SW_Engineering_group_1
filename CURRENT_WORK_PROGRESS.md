# 현재까지 실제 작업 내역 정리

작성 기준: 2026-05-10 19:29 KST  
대상 브랜치: `temporary`  
프로젝트 경로: `/home/donguk/project2/SW_Engineering_group_1`

이 문서는 현재 세션까지 실제로 수행한 작업, 확인한 상태, 수정된 코드, DB 반영 내용, 검증 결과, 남은 작업을 한 번에 보기 위해 만든 진행상황 요약 문서다.

---

## 1. 전체 요약

현재 프로젝트는 고객/운영자 화면, FastAPI 백엔드, MySQL DB, 외부 AI 서버 연동을 함께 다루고 있다.

현재까지 실제로 진행한 핵심 작업은 다음과 같다.

1. API 상세 명세서와 단계별 작업 수행 문서를 작성하고 `BE` 브랜치에 커밋/푸시했다.
2. 프로젝트 실행 상태를 확인하고 FE/BE/DB 연결을 점검했다.
3. `Chatbot_Model` 브랜치의 AI 서버 문서를 가져와 저장했다.
4. 백엔드에서 외부 AI 서버 `203.234.62.47:8000`과 통신하는 `/api/ai/*` 프록시를 구현했다.
5. 프론트 챗봇이 기존 로컬 mock 답변이 아니라 백엔드와 AI 서버를 거쳐 실제 응답을 받도록 연결했다.
6. 최근 주문 클릭 시 상담 시작 화면이 아니라 바로 챗봇 대화창이 열리도록 수정했다.
7. 관리자 계정에서 스토어명을 변경할 수 있도록 백엔드 API와 프론트 설정 화면을 추가했다.
8. 주문했던 스토어 영역에 목업 페이지 기준 스토어를 복구했다.
9. DB에 목업 스토어 5개를 실제 `store` 테이블에 반영했다.
10. merge conflict marker로 인한 Vite 빌드 오류를 해결했다.

---

## 2. 문서 작업 내역

### 2.1 API 상세 명세서 작성

작성/수정 파일:

- `specs/04-technical-reference/08-api-feature-specification-detailed.md`

주요 내용:

- 실제 구현된 API와 예정 API를 분리해 정리했다.
- 공통 API 규칙을 추가했다.
  - 기본 prefix: `/api`
  - 인증 방식: `Authorization: Bearer {accessToken}`
  - 에러 형식: `{ message, details }`
  - 성공 응답은 현재 프로젝트 방식에 맞춰 직접 객체 반환 방식으로 정리
  - 프론트 API 파일은 `code/src/api/*.js`로 기능별 분리
  - 백엔드 endpoint는 `server/main.py`, 비즈니스 로직은 `server/app/*.py`, DB 접근은 repository 함수로 분리
- 구현 API 목록과 예정 API 목록을 나눴다.
- `/api/ai/*` 프록시 API 내용을 반영했다.

### 2.2 단계별 작업 수행 파일 작성

작성/수정 파일:

- `specs/04-technical-reference/09-api-step-by-step-work-plan.md`

주요 내용:

- 현재 구현 API 확인 단계
- 인증 API 안정화
- 고객 홈 API 안정화
- 문의/상담 API 구현 계획
- 운영자 API 구현 계획
- 챗봇 및 handoff API 구현 계획
- AI 요약/안전 보조 API 구현 계획
- 검색/지표 API 구현 계획
- 최종 검증 체크리스트

### 2.3 커밋/푸시 완료 내역

이미 원격 `BE` 브랜치에 푸시한 커밋:

- `2872f7f api상세 명세서 및 단계별 작업 수행 추가`

원격 저장소:

- `https://github.com/JDW0301/SW_Engineering_group_1.git`

---

## 3. 실행 환경 확인 내역

### 3.1 프론트엔드

현재 프론트엔드는 Vite로 실행된다.

- URL: `http://localhost:5173/`
- 현재 응답 상태: `200 OK`
- 확인 결과: 로그인 화면 정상 표시

### 3.2 백엔드

현재 백엔드는 FastAPI/uvicorn으로 실행된다.

- URL: `http://localhost:4000`
- Health endpoint: `GET /api/health`
- 현재 응답:

```json
{"message":"ok"}
```

### 3.3 DB

현재 DB 설정:

- DB host: `127.0.0.1`
- DB port: `3307`
- DB name: `swe_helpdesk`
- DB user: `root`

현재 주요 테이블 row 수:

| 테이블 | row 수 | 의미 |
|---|---:|---|
| `app_user` | 6 | 고객/운영자 계정 |
| `store` | 8 | 운영자 대표 스토어 + 데모/목업 스토어 |
| `product` | 5 | 데모 상품 |
| `order_table` | 5 | 데모 주문 |
| `inquiry_post` | 4 | 데모 문의 게시글 |
| `support_session` | 4 | 데모 상담 세션 |
| `chatbot_session` | 0 | 챗봇 대화 저장 테이블은 있으나 아직 저장 API 미구현 |
| `refresh_token` | 55 | 로그인/refresh 기록 |

---

## 4. AI 서버 연동 작업

### 4.1 가져온 AI 문서

`origin/Chatbot_Model` 브랜치에서 가져와 저장한 파일:

- `README.md`
- `docs/INTERFACE_SPEC.md`

### 4.2 AI 서버 상태 확인

확인한 AI 서버:

- `http://203.234.62.47:8000`

Health check 결과:

```json
{"status":"ok","words_loaded":270,"model":"beomi/beep-koelectra-base-v3-discriminator-hate"}
```

### 4.3 백엔드 AI 프록시 구현

추가/수정 파일:

- `server/app/ai_client.py`
- `server/app/config.py`
- `server/main.py`
- `server/.env`

구현한 BE endpoint:

| Method | BE 경로 | AI 원 서버 경로 | 설명 |
|---|---|---|---|
| GET | `/api/ai/health` | `/health` | AI 서버 상태 확인 |
| POST | `/api/ai/detect` | `/detect` | 욕설 감지 |
| POST | `/api/ai/neutralize` | `/neutralize` | 욕설 중립화 |
| POST | `/api/ai/classify` | `/classify` | 문의 분류 |
| POST | `/api/ai/chatbot` | `/chatbot` | 챗봇 일반 응답 |
| POST | `/api/ai/chatbot/stream` | `/chatbot/stream` | 챗봇 SSE 스트리밍 |
| POST | `/api/ai/summarize` | `/summarize` | 대화 요약 |

동작 원칙:

- FE는 AI 서버를 직접 호출하지 않고 BE의 `/api/ai/*`를 호출한다.
- `/api/ai/health`를 제외한 AI proxy endpoint는 Bearer token 인증을 요구한다.
- AI 연결 실패 시 BE는 `{ message, details }` 형태로 오류를 반환한다.

검증 결과:

- `/api/ai/chatbot` 실제 응답 확인 성공
- `/api/ai/chatbot/stream` SSE 응답 확인 성공
- 고객 계정 `customer01` token으로 호출 성공

---

## 5. 프론트 챗봇 연동 작업

### 5.1 기존 상태

기존 `ChatbotTab.jsx`는 로컬 함수 `getBotReply()`로 답변했다.

기존 문제:

- 실제 AI 서버와 통신하지 않음
- FAQ 클릭도 mock 답변만 표시
- 새로고침/페이지 이동 시 대화 내역이 사라짐

### 5.2 변경 내용

추가/수정 파일:

- `code/src/api/ai.js`
- `code/src/pages/customer/ChatbotTab.jsx`

구현 내용:

- `streamChatbotReply()` 추가
- FE에서 `POST /api/ai/chatbot/stream` 호출
- `Authorization: Bearer <accessToken>` 적용
- SSE stream의 `data: ...` 라인 파싱
- `message`, `history`, `store_context`를 `docs/INTERFACE_SPEC.md` 형식에 맞춰 전달
- FAQ 클릭도 실제 AI 응답 흐름으로 연결
- `can_answer: false` 또는 오류 발생 시 상담사 연결 안내 표시

검증 결과:

- 프론트 로그인 후 챗봇 탭에서 메시지 전송 성공
- `/api/ai/chatbot/stream` 요청 `200`
- AI 답변이 화면에 표시됨

### 5.3 아직 남은 점

챗봇 대화 내역은 아직 DB에 저장되지 않는다.

이미 DB와 문서에는 아래 테이블/API 계획이 있다.

관련 DB 테이블:

- `chatbot_session`
- `chatbot_message`
- `chatbot_message_image`

예정 API:

- `POST /api/chatbot/sessions`
- `GET /api/chatbot/sessions/{sessionId}`
- `POST /api/chatbot/sessions/{sessionId}/messages`
- `POST /api/chatbot/sessions/{sessionId}/handoff`

현재 상태:

- 테이블은 존재하지만 row 수는 0이다.
- 실제 저장/조회 API는 아직 구현되지 않았다.
- 따라서 새로고침하거나 다른 화면으로 이동하면 챗봇 대화 내역이 사라진다.

---

## 6. 고객 화면 수정 작업

### 6.1 최근 주문 클릭 시 바로 챗봇 열기

수정 파일:

- `code/src/pages/customer/MainPage.jsx`
- `code/src/pages/customer/OrdersPage.jsx`
- `code/src/pages/customer/StorePage.jsx`

기존 문제:

- 최근 주문 카드 클릭 시 `openStore(s, "consult", order)`로 이동했다.
- 화면 상단 탭은 챗봇처럼 보이지만 실제 내용은 `ConsultTab`이었다.
- 사용자는 문의 게시판 등 다른 탭을 눌렀다가 다시 챗봇을 눌러야 대화창을 볼 수 있었다.

변경 내용:

- 최근 주문 클릭 시 `openStore(s, "chatbot", order)`로 이동
- 주문 목록 페이지에서도 주문 클릭 시 `chatbot`으로 이동
- `StorePage`의 챗봇 탭 active 조건에서 `consult`를 제거

검증 결과:

- `customer01` 로그인
- 최근 주문 `ORD-2026-030` 클릭
- 바로 챗봇 대화창 표시 확인
- “상담 시작” 또는 “진행 중인 상담” 화면이 먼저 뜨지 않는 것 확인

### 6.2 주문했던 스토어 영역 목업 스토어 복구

수정 파일:

- `code/src/pages/customer/MainPage.jsx`

기존 문제:

- “주문했던 스토어” 영역이 백엔드에서 내려온 `stores` 기준으로만 표시됐다.
- 사용자가 원한 목업 페이지 기준 스토어 목록이 사라져 보였다.

변경 내용:

- `MOCK_STORES`를 import했다.
- “주문했던 스토어” 영역은 목업 스토어 목록을 우선 표시하도록 복구했다.
- 최근 주문 클릭 시 store id가 백엔드와 목업 사이에서 맞지 않아도 `storeName`으로 fallback 검색하도록 처리했다.

검증 결과:

- `MainPage.jsx` diagnostics 오류 없음
- `npm run build` 성공

---

## 7. 관리자 스토어명 변경 기능

### 7.1 기존 상태

기존 관리자 설정 화면:

- 전화번호
- 주소
- 상담 운영 시간
- 소개글

문제:

- 스토어명 입력 필드가 없었다.
- 저장 버튼이 실제 API에 연결되어 있지 않았다.
- DB의 `store.name`을 변경할 수 없었다.

### 7.2 백엔드 구현

추가/수정 파일:

- `server/main.py`
- `server/app/operator.py`
- `server/app/repositories.py`
- `server/app/validation.py`

추가 endpoint:

```http
PATCH /api/operator/store
Authorization: Bearer <accessToken>
Content-Type: application/json
```

요청 body:

```json
{
  "storeName": "스토어명",
  "storePhone": "전화번호",
  "address": "주소",
  "businessHours": "운영 시간",
  "description": "소개글"
}
```

응답 body:

```json
{
  "store": {
    "id": 1,
    "owner_user_id": 4,
    "name": "스토어명",
    "category": "의류",
    "description": "소개글",
    "phone": "전화번호",
    "address": "주소",
    "business_hours": "운영 시간",
    "status": "ACTIVE"
  }
}
```

권한 규칙:

- `role = OPERATOR`만 수정 가능
- 고객 계정은 `403`
- store가 없으면 `404`

### 7.3 프론트 구현

추가/수정 파일:

- `code/src/api/operator.js`
- `code/src/App.jsx`
- `code/src/pages/operator/OperatorApp.jsx`
- `code/src/pages/operator/OperatorSettings.jsx`

구현 내용:

- `updateOperatorStore()` API client 추가
- `OperatorSettings`에 스토어명 input 추가
- 저장 버튼 클릭 시 `PATCH /api/operator/store` 호출
- 저장 성공 시 상단 관리자 nav의 스토어명도 즉시 반영
- 저장 성공/실패 메시지 표시

### 7.4 발견한 버그와 수정

처음 구현한 store update repository 함수는 `owner_user_id` 기준으로 update했다.

문제:

- `owner_user_id=4`에 여러 demo store가 연결되어 있었다.
- 관리자 스토어명 변경 시 id 4~8의 목업 스토어까지 함께 바뀌는 문제가 발생했다.

수정:

- `update_store_by_owner_user_id()`를 `update_store_by_id()`로 변경
- `find_store_by_owner_user_id()`로 대표 store 1개를 찾은 뒤, 그 store의 `id` 기준으로만 update
- 이로 인해 관리자 대표 스토어 `id=1`만 수정되고, 목업 스토어 `id=4~8`은 보존된다.

검증 결과:

- Python compile 성공
- 실제 API 테스트 성공
- 관리자 화면에서 스토어명 변경/저장 UI 동작 확인
- 변경 후 다시 원래 이름으로 복구 확인
- 목업 스토어 id 4~8이 더 이상 같이 바뀌지 않는 것 확인

---

## 8. DB 반영 작업

### 8.1 목업 스토어 5개 DB 반영

사용자가 “주문했던 스토어 그대로 DB에 넣을 수 있나”라고 요청했고, 1번 방식인 “이미 있으면 업데이트, 없으면 추가” 방식으로 진행했다.

실제 처리:

- 기존 주문/상품 FK가 store id 4~8을 바라보고 있었기 때문에 새 insert보다 기존 id 4~8을 목업 값으로 복구/업데이트했다.

현재 DB의 목업 스토어:

| id | name | category | phone | address | business_hours | description |
|---:|---|---|---|---|---|---|
| 4 | 패션스토어 루미 | 의류 | 02-1234-5678 | 서울시 강남구 역삼동 123-4 | 평일 09:00 ~ 18:00 | 트렌디한 의류 전문 스토어 |
| 5 | 맛있는 빵집 | 음식 | 02-9876-5432 | 서울시 마포구 합정동 56-7 | 매일 08:00 ~ 22:00 | 수제 빵과 디저트 |
| 6 | 테크존 전자 | 전자기기 | 031-555-1234 | 경기도 성남시 분당구 정자동 89 | 평일 10:00 ~ 19:00 | 가전/IT 기기 전문 |
| 7 | 그린라이프 마트 | 생활용품 | 02-333-4444 | 서울시 송파구 잠실동 200 | 매일 10:00 ~ 21:00 | 친환경 생활용품 전문 |
| 8 | 북카페 서랍 | 기타 | 02-777-8888 | 서울시 종로구 삼청동 33 | 화~일 11:00 ~ 20:00 | 책과 커피가 있는 공간 |

### 8.2 현재 DB 저장 상태 요약

현재 DB에는 다음 데이터가 저장되어 있다.

- 고객/운영자 계정
- 운영자 대표 스토어
- 목업 기준 데모 스토어 5개
- 데모 상품 5개
- 데모 주문 5개
- 데모 문의글 4개
- 데모 문의 답변 2개
- 데모 상담 세션 4개
- 데모 상담 메시지 8개
- refresh token 기록

현재 비어 있는 주요 영역:

- 챗봇 세션
- 챗봇 메시지
- 챗봇 메시지 이미지
- FAQ
- 응답 프리셋
- 지식 파일
- 통계 테이블

---

## 9. Git/원격 브랜치 작업

### 9.1 `UI 수정` 커밋 확인 및 파일 다운로드

원격 브랜치:

- repository: `https://github.com/JDW0301/SW_Engineering_group_1.git`
- branch: `BE`

확인한 커밋:

- `9dbe05c UI 수정`

해당 커밋에서 가져온 주요 프론트 파일:

- `code/src/data/mockData.js`
- `code/src/pages/customer/ChatbotTab.jsx`
- `code/src/pages/customer/ConsultTab.jsx`
- `code/src/pages/customer/CustomerApp.jsx`
- `code/src/pages/customer/CustomerInquiryListPage.jsx`
- `code/src/pages/customer/CustomerSupportListPage.jsx`
- `code/src/pages/customer/InquiryDetailPage.jsx`
- `code/src/pages/customer/MainPage.jsx`
- `code/src/pages/customer/MyInquiryTab.jsx`
- `code/src/pages/customer/OrderSummaryCard.jsx`
- `code/src/pages/customer/OrdersPage.jsx`
- `code/src/pages/customer/StorePage.jsx`
- `code/src/pages/operator/ChannelPage.jsx`
- `code/src/pages/operator/OperatorApp.jsx`
- `code/src/pages/operator/OperatorInquiryDetail.jsx`
- `code/src/pages/operator/OperatorMain.jsx`
- `code/src/pages/operator/OrderRow.jsx`
- `code/src/pages/operator/StatsPage.jsx`

### 9.2 특정 파일 원격에서 가져오기

요청에 따라 원격 `BE` 브랜치에서 아래 파일을 가져왔다.

- `code/src/pages/customer/MyInquiryTab.jsx`

---

## 10. Merge conflict 해결 작업

Vite 빌드 중 아래 에러가 발생했다.

```text
[plugin:vite:oxc] Transform failed with 1 error:
[PARSE_ERROR] Error: Encountered diff marker
```

원인:

- 일부 파일에 Git conflict marker가 남아 있었다.

해결한 파일:

- `code/src/pages/customer/MainPage.jsx`
- `code/src/pages/customer/ChatbotTab.jsx`
- `code/src/pages/customer/OrdersPage.jsx`
- `code/src/pages/operator/OperatorApp.jsx`

유지한 방향:

- 원격의 UI 개선 내용 유지
- 최근 주문 클릭 시 챗봇으로 바로 이동하는 변경 유지
- AI 챗봇 연동 유지
- 관리자 스토어명 변경을 위한 `onUpdateUser` 전달 유지

검증 결과:

- conflict marker 검색 결과 0건
- `npm run build` 성공

---

## 11. 현재 남아 있는 변경 파일

현재 Git 기준 수정된 파일:

```text
code/src/pages/customer/ChatbotTab.jsx
code/src/pages/customer/MainPage.jsx
code/src/pages/customer/OrdersPage.jsx
code/src/pages/operator/OperatorApp.jsx
server/app/operator.py
server/app/repositories.py
CURRENT_WORK_PROGRESS.md
```

참고:

- 생성된 `__pycache__` 변경은 실제 코드 변경이 아니어서 정리했다.
- 현재 문서는 새로 추가된 파일이다.
- 커밋은 아직 하지 않았다.

---

## 12. 검증한 명령/결과

### 12.1 프론트 빌드

명령:

```bash
npm run build
```

결과:

```text
✓ built
```

### 12.2 백엔드 health

명령:

```bash
curl http://localhost:4000/api/health
```

결과:

```json
{"message":"ok"}
```

### 12.3 프론트 접속

URL:

```text
http://localhost:5173/
```

결과:

- HTTP `200 OK`
- 로그인 화면 정상 표시

### 12.4 AI 챗봇 API

검증 endpoint:

- `POST /api/ai/chatbot`
- `POST /api/ai/chatbot/stream`

결과:

- 고객 token으로 호출 성공
- 일반 응답에서 `reply`, `can_answer`, `latency_ms` 확인
- stream 응답에서 `thinking`, `thinking_end`, `token` 이벤트 확인

### 12.5 관리자 스토어명 변경 API

검증 endpoint:

- `PATCH /api/operator/store`

결과:

- 운영자 token으로 호출 성공
- 대표 store 1개만 변경됨
- 목업 store id 4~8은 유지됨

---

## 13. 현재 실행 중인 서비스

현재 확인 기준:

- 프론트엔드: 실행 중
- 백엔드: 실행 중
- MySQL DB: 연결 가능
- 외부 AI 서버: 이전 health check 기준 정상

접속 주소:

| 서비스 | 주소 |
|---|---|
| FE | `http://localhost:5173/` |
| BE | `http://localhost:4000` |
| BE health | `http://localhost:4000/api/health` |
| AI 원 서버 | `http://203.234.62.47:8000` |

---

## 14. 아직 미완료/주의할 점

### 14.1 챗봇 대화 내역 DB 저장

현재 챗봇은 AI 응답을 실제로 받아오지만, 대화 내역은 React state에만 있다.

남은 작업:

- `POST /api/chatbot/sessions`
- `GET /api/chatbot/sessions/{sessionId}`
- `POST /api/chatbot/sessions/{sessionId}/messages`
- `POST /api/chatbot/sessions/{sessionId}/handoff`
- `chatbot_session`, `chatbot_message` 저장/조회 구현

### 14.2 문의/상담 실제 DB 저장

현재 고객/운영자 상담과 문의 화면은 상당 부분 mock state 기반이다.

남은 작업:

- 고객 문의 생성 API
- 고객 문의 조회 API
- 운영자 문의 목록/상세 API
- 메시지 저장 API
- 상태 변경 API
- 내부 메모 API

### 14.3 프론트 목업 데이터와 DB 데이터 혼재

현재 일부 화면은 DB 응답을 사용하고, 일부 화면은 mock data를 사용한다.

주의:

- `MainPage`의 “주문했던 스토어”는 목업 스토어 기준으로 복구했다.
- `orders`는 DB 응답 기반이다.
- id/name 매칭 fallback이 있으나, 장기적으로는 DB 기준으로 통일하는 것이 좋다.

### 14.4 문서 최신화 필요

이 문서는 현재까지의 실제 작업 내역을 정리한 최신 문서다.

다만 아래 기존 문서들은 현재 코드 상태와 일부 차이가 있을 수 있다.

- `specs/04-technical-reference/08-api-feature-specification-detailed.md`
- `specs/04-technical-reference/09-api-step-by-step-work-plan.md`
- `code/FE변경사항.md`

필요하면 다음 단계에서 이 문서들을 현재 구현 기준으로 다시 업데이트해야 한다.

---

## 15. 추천 다음 작업 순서

1. 현재 변경사항을 기능 단위로 나누어 정리한다.
2. 빌드와 핵심 수동 검증을 다시 한 번 수행한다.
3. 챗봇 대화 저장 API를 구현한다.
4. 고객 문의/상담 저장 API를 구현한다.
5. 운영자 문의 목록/상세/답변/상태 변경 API를 구현한다.
6. mock data 의존 화면을 DB API 기준으로 단계적으로 교체한다.
7. 진행상황 문서를 변경 시마다 업데이트한다.

---

## 16. 커밋 상태

현재 이 문서 작성 시점 기준:

- 새 진행상황 문서 생성 완료
- 일부 코드 변경 미커밋 상태
- DB에는 목업 스토어 복구가 실제 반영됨
- 커밋/푸시는 아직 하지 않음
