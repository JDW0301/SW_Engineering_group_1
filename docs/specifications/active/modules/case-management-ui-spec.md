# Case Management UI 상세 명세

## 1. 문서 목적

본 문서는 운영자 앱에서 `Case Management` 기능이 어떤 화면 구조, 정보 배치, 상호작용 방식으로 표현되는지 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- inquiry 목록 화면
- inquiry 상세 화면
- 메시지 타임라인 영역
- internal note 영역
- assignment / status / reopen action UI
- degraded context 표시 규칙
- linked chatbot context 표시 규칙
- validation / conflict / error feedback 표시 규칙

이 문서는 아래를 직접 다루지 않는다.

- customer app 화면
- chatbot self-service 화면
- backend validation 구현
- 파일 저장소 구현

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- inquiry list screen
- inquiry detail screen
- message timeline UI
- internal note UI
- action panel
- degraded context 표시
- error / conflict feedback 방식

## 2.2 직접 다루지 않는 것

- customer-facing inquiry 화면
- customer chatbot 화면
- API/DB 구현
- external snapshot sync 실행 자체

## 3. Screen Set

## 3.1 Inquiry List Screen

### 역할
- 운영자가 처리 대상을 빠르게 탐색/정렬/필터링하는 화면

### 핵심 목적
- 어떤 inquiry를 먼저 열어야 하는지 판단
- 상태, 유형, 최근 메시지, degraded 여부, linked chatbot session 여부를 빠르게 확인

## 3.2 Inquiry Detail Screen

### 역할
- 특정 inquiry를 실제로 처리하는 작업 화면

### 핵심 목적
- 맥락 파악
- 메시지 확인 및 응답
- internal note 작성
- assignment 변경
- 상태 변경
- linked chatbot context 확인

## 3.3 Screen 해석 원칙

- 목록 화면은 triage 중심
- 상세 화면은 execution 중심
- MVP에서는 두 화면 안에서 핵심 운영 흐름을 끝내는 것이 기본 원칙이다.

## 4. Layout Regions

## 4.1 Inquiry List Screen layout

### A. Search / Filter Bar

포함 요소:
- customer name 검색
- order number 검색
- product name 검색
- inquiry status 필터
- inquiry type 필터
- period preset
  - 오늘
  - 최근 7일
  - 최근 30일

### B. KPI Summary Bar

포함 요소:
- inquiry count
- average first response time
- resolution rate

### C. Inquiry List Region

각 행/카드 최소 포함 요소:
- inquiry id
- status badge
- inquiry type badge
- customer name
- order/product summary
- last message time
- last response time
- degraded indicator
- linked chatbot session indicator

### D. Empty State

- 결과 없음 안내
- 필터 조건 유지
- 재검색 유도

## 4.2 Inquiry Detail Screen layout

### A. Header Region

포함 요소:
- inquiry id
- current status
- inquiry type
- opened_at
- assignee
- linked chatbot session 여부

### B. Customer / Order / Product Summary Region

포함 요소:
- customer summary
- order summary
- product summary
- degraded state
- 필요 시 manual resync 진입점

### C. Message Timeline Region

포함 요소:
- inquiry message timeline
- `content_display`
- raw 보기 action
- attachment 썸네일 / preview
- preview 실패 시 download fallback

### D. Linked Chatbot Context Panel

포함 요소:
- linked chatbot session 존재 여부
- chatbot summary 존재 여부
- 원문 context 접근 entry

### E. Internal Note Panel

포함 요소:
- internal note list
- note 작성 입력

### F. Action Panel

포함 요소:
- operator message 작성
- assignment 변경
- status 변경
- reopen action

### G. Feedback Region

포함 요소:
- validation error
- conflict error
- degraded 안내
- action success feedback

## 5. UI State and Interaction Rules

## 5.1 Loading state

### 목록 화면
- 필터 영역 유지
- 결과 영역만 loading 처리

### 상세 화면
- header와 주요 영역 loading
- inquiry 전체를 블로킹할 수 있음

## 5.2 Empty state

### 목록 화면
- 문의 없음 또는 검색 결과 없음 안내

### 상세 화면
- 일반적으로 empty보다 not found/error로 해석

## 5.3 Success state

- 목록 화면: summary + 검색 결과 표시
- 상세 화면: full context + action 가능 상태

## 5.4 Degraded state

- degraded context는 숨기지 않는다.
- 목록 화면: `미연결`, `최신화 필요`, `조회 실패` indicator 가능
- 상세 화면: summary 영역에 degraded 안내 표시
- inquiry/message 본문은 계속 열람 가능

## 5.5 Validation error state

- message 입력
- note 입력
- status change form
- assignment form

가능한 한 입력 필드 근처에 표시한다.

## 5.6 Conflict state

- 상태 변경
- assignment 변경

메시지 append는 가능한 한 conflict로 막지 않는다.

## 5.7 Forbidden / Not Found state

### Forbidden
- 권한 없음
- 제한된 action 접근

### Not Found
- 존재하지 않는 inquiry
- 잘못된 상세 링크

## 5.8 Interaction principles

- 목록에서 선택한 inquiry를 detail screen으로 이동
- 기존 검색/필터 맥락은 복귀 시 유지 가능
- 상태 변경은 보수적으로 처리
- internal note는 customer-facing content와 분리 유지
- linked chatbot context는 보조 패널로 분리 유지

## 6. Component Responsibilities

## 6.1 `InquiryListPage`

- 목록 화면 상위 조립
- 검색/필터 상태 관리
- KPI summary와 inquiry list 동시 렌더링

## 6.2 `InquiryFilterBar`

- 검색 입력
- 상태/유형 필터
- period preset 선택

## 6.3 `InquiryKpiSummary`

- inquiry count
- average first response time
- resolution rate 표시

0건일 때 평균/해결율은 `-`로 표시한다.

## 6.4 `InquiryListTable` / `InquiryListPanel`

- 목록 projection 렌더링
- degraded indicator 표시
- linked chatbot indicator 표시

## 6.5 `InquiryDetailPage`

- inquiry 상세 화면 전체 조립
- 하위 패널 배치
- action 결과 반영

## 6.6 `InquiryHeader`

- inquiry id
- status
- inquiry type
- assignee
- linked chatbot session 여부 표시

## 6.7 `ContextSummaryPanel`

- customer/order/product summary 표시
- degraded 상태 표시
- 필요 시 resync 진입점 표시

## 6.8 `MessageTimeline`

- inquiry message 목록 렌더링
- `content_display` 기본 출력
- raw 보기 action
- attachment 썸네일 / 확대 / download fallback 연결

## 6.9 `LinkedChatbotPanel`

- linked chatbot session 존재 여부 표시
- summary/context access 제공

## 6.10 `InternalNotePanel`

- internal note 목록
- note 작성
- customer-visible content와 완전히 분리

## 6.11 `ActionPanel`

- operator message 작성
- assignment 변경
- status 변경
- reopen action 제공

## 6.12 `FeedbackBanner` / `InlineError`

- validation error
- conflict 안내
- degraded 안내
- action success feedback 표시

## 7. Action Flows

## 7.1 목록 → 상세 이동 흐름

1. operator가 목록 필터/검색 사용
2. 결과 목록 확인
3. 특정 inquiry 선택
4. detail screen 진입
5. 복귀 시 이전 필터 상태 유지 가능

## 7.2 operator 메시지 작성 흐름

1. detail screen 진입
2. `ActionPanel`에서 메시지 입력
3. validation 수행
4. 성공 시 append API 호출
5. 성공 응답 후 timeline 갱신
6. 필요 시 상태 `IN_PROGRESS` 반영

## 7.3 internal note 작성 흐름

1. `InternalNotePanel`에서 메모 입력
2. validation 수행
3. note append API 호출
4. 성공 시 note 목록 갱신

## 7.4 assignment 변경 흐름

1. assignee 선택
2. assignment API 호출
3. 성공 시 header / action panel 갱신
4. conflict 시 재조회 유도

## 7.5 status 변경 흐름

1. target status 선택
2. 필요 시 reason code 입력
3. status API 호출
4. 성공 시 header / timeline / summary 갱신

## 7.6 reopen 흐름

1. `RESOLVED` inquiry detail 진입
2. reopen action 클릭
3. reopen API 호출
4. 성공 시 상태 `IN_PROGRESS` 반영
5. assignee는 `null`로 갱신

## 7.7 degraded context 대응 흐름

1. summary panel에서 degraded 상태 발견
2. 필요 시 manual resync action 사용
3. 성공 시 summary panel 재렌더링

## 7.8 linked chatbot context 확인 흐름

1. detail screen 진입
2. `LinkedChatbotPanel`에서 linked session 확인
3. 필요 시 챗봇 대화 맥락/summary 확인
4. inquiry 처리 흐름으로 복귀

## 8. Error / Degraded Display Detail

## 8.1 Validation error display

- 가능한 한 입력 필드 가까이에 표시
- 입력값은 유지
- field-level feedback 우선

## 8.2 Conflict display

- 상태 변경 / assignment 변경 충돌 시 명확히 표시
- 예: “다른 변경이 먼저 반영되었습니다. 최신 상태를 확인한 뒤 다시 시도해 주세요.”

## 8.3 Degraded snapshot display

표현:
- `미연결`
- `최신화 필요`
- `조회 실패`

`최신화 필요`, `조회 실패`에는 resync action을 제공할 수 있다.

## 8.4 Not found display

- 존재하지 않는 inquiry 또는 잘못된 진입 링크는 not found screen/panel로 표시

## 8.5 Forbidden display

- 권한 없는 inquiry 접근 또는 제한된 action 시도는 접근 제한 메시지로 표시

## 8.6 Attachment preview failure display

- 썸네일/확대 실패 시 미리보기 불가 상태를 표시하고 download action만 제공

## 8.7 Partial success display

- 일부 linked snapshot만 degraded여도 전체 화면을 실패처럼 보이게 하지 않는다.
- 성공한 영역은 그대로 유지하고 degraded 영역만 분리 표시한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강 가능한 local detail이다.

- degraded 상태 meta field naming
- customer-visible status wording과 operator 상태 배지 wording 차이
- pagination UI 세부
- linked chatbot panel의 펼침/접힘 기본 상태
