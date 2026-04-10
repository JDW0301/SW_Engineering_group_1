# Customer Portal / Handoff UI 상세 명세

## 1. 문서 목적

본 문서는 customer 앱에서 `Customer Portal / Handoff` 기능이 어떤 화면 구조, 정보 배치, 상호작용 방식으로 표현되는지 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- customer inquiry 목록 화면
- customer inquiry 상세 화면
- chatbot session 화면
- handoff 전환 UX
- order/product summary와 `[상세 보기]`
- expired chatbot session의 read-only 표현
- validation / error / degraded 표시

이 문서는 아래를 직접 다루지 않는다.

- operator app 화면
- backend validation 구현
- chatbot answer generation 내부 로직
- DB 구현 상세

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- inquiry list screen
- inquiry detail screen
- chatbot session screen
- handoff button / transition UX
- customer-visible message/attachment display
- expired session read-only UI

## 2.2 직접 다루지 않는 것

- operator inquiry 처리 UI
- external snapshot sync 실행 자체
- internal note UI
- summary / abuse detection 내부 계산

## 3. Screen Set

## 3.1 Customer Inquiry List Screen

### 역할
- customer가 본인 inquiry 목록을 확인하는 화면

### 핵심 목적
- 진행 중인 문의 확인
- 최근 메시지 시각과 상태 확인
- 어떤 inquiry를 다시 열어볼지 결정

## 3.2 Customer Inquiry Detail Screen

### 역할
- customer가 특정 inquiry의 상태와 대화를 확인하는 화면

### 핵심 목적
- 진행 상태 파악
- 대화 내용 확인
- 새 메시지 추가
- order/product 맥락 확인

## 3.3 Chatbot Session Screen

### 역할
- customer가 self-service chatbot과 대화하는 화면

### 핵심 목적
- 질문 입력
- 답변 확인
- 필요 시 handoff 요청
- session 만료 상태 인지

## 3.4 Screen 구조 해석

- 상위 customer support entry에서는 `문의` / `챗봇` 탭 구조가 자연스럽다.
- 하지만 명세 책임상으로는 아래 3개 화면으로 분리해 정의한다.
  - Inquiry List Screen
  - Inquiry Detail Screen
  - Chatbot Session Screen

## 4. Layout Regions

## 4.1 Customer Inquiry List Screen layout

### A. Tab / Navigation Region
- `문의` 탭
- `챗봇` 탭

### B. Inquiry List Region
각 행/카드 최소 포함 요소:
- inquiry id 또는 간단 식별자
- customer-visible status
- 최근 메시지 시각
- order/product summary 존재 여부

### C. Empty State Region
- 문의 없음 안내
- 챗봇 이동 또는 새 inquiry 생성 유도 가능

## 4.2 Customer Inquiry Detail Screen layout

### A. Status Header
- customer-visible status
- inquiry type 요약
- opened_at 또는 최근 갱신 시각

### B. Message Timeline Region
- inquiry message timeline
- `content_display`
- raw 보기 action
- attachment 썸네일
- 클릭 확대
- preview 실패 시 download fallback

### C. Order / Product Summary Region
- order 요약
- product 요약
- inquiry와 연결된 핵심 summary

### D. Detail Expansion Region
- `[상세 보기]` 이후 추가 노출되는 order/product detail

### E. Message Composer Region
- customer 새 메시지 입력
- attachment 업로드
- 전송 action

## 4.3 Chatbot Session Screen layout

### A. Session Status Region
- session 상태
- 만료 여부
- read-only 여부

### B. Chat Timeline Region
- customer question
- chatbot answer
- `content_display`
- attachment 썸네일 / 확대 / fallback

### C. Input Region
- customer 메시지 입력
- attachment 업로드
- send action

### D. Handoff Region
- 상담 전환 버튼
- handoff 안내 문구
- 기존 linked inquiry가 있으면 이동 entry 제공

### E. Expired Session Region
- “세션이 만료되었습니다”
- 새 세션 시작 버튼
- read-only 안내

## 5. UI State and Interaction Rules

## 5.1 Loading state

### Inquiry list
- 목록 skeleton 또는 loading indicator
- 상위 탭 구조는 유지

### Inquiry detail
- status header와 timeline loading 처리

### Chatbot session
- timeline / input loading 가능
- session 상태를 우선 보여줄 수 있음

## 5.2 Empty state

### Inquiry list
- 문의 없음 안내
- 챗봇 이동 또는 새 inquiry 생성 유도

### Chatbot 탭
- 세션 없음 안내
- 새 챗봇 시작 유도

## 5.3 Success state

- inquiry detail: 상태 + 대화 + summary + 메시지 전송 가능
- chatbot session: 질문/응답 가능 + handoff 가능

## 5.4 Validation error state

- inquiry 생성 입력
- inquiry message 입력
- chatbot 입력
- attachment 업로드

가능한 한 입력 근처에 표시하고, 입력값은 유지한다.

## 5.5 Forbidden / Not Found state

### Forbidden
- 다른 customer inquiry/session 접근 시도

### Not Found
- 존재하지 않는 inquiry/session
- 잘못된 링크 진입

## 5.6 Expired session read-only state

- expired chatbot session은 읽기 가능
- append / handoff 버튼은 비활성 또는 숨김
- “새 세션 시작”을 명시적으로 제공

## 5.7 Handoff interaction rule

- customer는 active chatbot session에서는 언제든 handoff 요청 가능
- 같은 session에서 중복 요청해도 새 inquiry를 계속 만들지 않음
- 이미 linked inquiry가 있으면 기존 inquiry로 이동 유도

## 5.8 Degraded summary state

- linked order/product 정보 일부 누락되어도 inquiry detail 자체는 계속 보여줌
- unavailable summary 상태는 summary 영역에 제한적으로 표시

## 6. Component Responsibilities

## 6.1 `CustomerSupportEntryPage`

- `문의` / `챗봇` 탭 진입점
- 상위 navigation 상태 유지

## 6.2 `CustomerInquiryListPage`

- customer inquiry 목록 렌더링
- inquiry 선택
- inquiry detail 이동

## 6.3 `CustomerInquiryList`

- inquiry summary projection 렌더링
- status / 최근 메시지 시각 / summary 존재 여부 표시

## 6.4 `CustomerInquiryDetailPage`

- inquiry detail 전체 조립
- timeline, summary, composer 구성

## 6.5 `CustomerInquiryHeader`

- customer-visible status 표시
- inquiry 기본 식별/시간 표시

## 6.6 `CustomerMessageTimeline`

- inquiry message timeline 렌더링
- `content_display` 표시
- raw 보기 action 연결
- attachment preview 연결

## 6.7 `CustomerMessageComposer`

- customer 새 메시지 입력
- attachment 업로드
- 전송 action
- validation 에러 표시

## 6.8 `OrderProductSummaryPanel`

- order/product summary 표시
- unavailable summary 표시
- `[상세 보기]` 확장 트리거 제공

## 6.9 `OrderProductDetailPanel`

- `[상세 보기]` 이후 확장 정보 표시

## 6.10 `ChatbotSessionPage`

- chatbot session 화면 전체 조립
- timeline / input / handoff / expired state 표현

## 6.11 `ChatbotTimeline`

- customer question / chatbot answer 렌더링
- `content_display` 표시
- attachment preview/fallback 연결

## 6.12 `ChatbotInputComposer`

- chatbot 입력
- attachment 업로드
- send action
- validation 에러 표시

## 6.13 `HandoffPanel`

- handoff 버튼 노출
- handoff 설명 문구 표시
- 기존 linked inquiry가 있으면 이동 entry 제공

## 6.14 `ExpiredSessionBanner`

- read-only 상태 안내
- 새 세션 시작 action 제공
- append / handoff 금지 상태 표시

## 7. Action Flows

## 7.1 Inquiry list → detail 이동 흐름

1. customer가 support entry 진입
2. `문의` 탭 선택
3. inquiry 목록 확인
4. 특정 inquiry 선택
5. inquiry detail page 이동

## 7.2 Customer inquiry 생성 흐름

1. customer가 새 inquiry 생성 진입
2. inquiry type 입력
3. initial message 입력
4. attachment 추가 가능
5. validation 수행
6. 성공 시 inquiry 생성 API 호출
7. 성공 응답 후 inquiry detail 이동

### 규칙
- 일반 inquiry는 `initial_message` 필수

## 7.3 Customer inquiry message append 흐름

1. inquiry detail 진입
2. `CustomerMessageComposer`에 메시지 입력
3. validation 수행
4. append API 호출
5. 성공 시 timeline 갱신
6. 필요 시 상태가 reopen될 수 있음

## 7.4 Chatbot session 시작 흐름

1. `챗봇` 탭 선택
2. session 시작 action
3. 새 chatbot session 생성
4. timeline / input 활성화

## 7.5 Chatbot message append 흐름

1. `ChatbotInputComposer`에 질문 입력
2. attachment 추가 가능
3. validation 수행
4. append API 호출
5. chatbot answer 표시

## 7.6 Handoff 요청 흐름

1. handoff 버튼 선택
2. handoff API 호출
3. linked inquiry 존재 여부 확인
4. 새 inquiry 생성 또는 기존 inquiry 연결
5. customer를 inquiry detail로 이동 가능

### 규칙
- 중복 handoff는 새 inquiry 생성이 아니라 기존 inquiry 연결

## 7.7 Expired chatbot session 흐름

1. customer가 expired session 조회
2. session은 읽기 가능
3. append 버튼 비활성 또는 숨김
4. handoff 버튼 비활성 또는 숨김
5. 새 세션 시작 action 제공

## 7.8 `[상세 보기]` 확장 흐름

1. inquiry detail에서 summary 영역 확인
2. `[상세 보기]` 클릭
3. 추가 order/product 정보 표시
4. 다시 접기 가능

## 8. Error / Read-only / Degraded Display Detail

## 8.1 Validation error display

- 입력 필드 근처에 표시
- 입력값 유지
- inline error 우선

## 8.2 Forbidden display

- 다른 customer inquiry/session 접근 시도는 접근 제한 메시지 또는 화면으로 표시

## 8.3 Not found display

- 존재하지 않는 inquiry/session 또는 잘못된 링크는 not found 상태로 표시

## 8.4 Read-only expired session display

표시 요소:
- “이 세션은 만료되었습니다”
- “새 세션 시작” 버튼
- append / handoff 불가 안내

## 8.5 Handoff idempotent display

- 중복 handoff 시 새 inquiry가 생긴 것처럼 보이지 않게 함
- 기존 inquiry로 이어졌다는 느낌을 주는 안내가 자연스럽다.

## 8.6 Degraded summary display

- linked order/product 일부 누락 시 summary 영역만 unavailable summary로 표시
- inquiry detail 자체는 계속 보여줌

## 8.7 Attachment preview failure display

- 미리보기 실패 표시
- 다운로드 action만 제공

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- expired session append/handoff 거절 코드 세부
- customer-visible status wording
- session list retention/표시 기간
- detail expansion 필드 세부 구성
