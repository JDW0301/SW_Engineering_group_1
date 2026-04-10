# Conversation / Attachments UI 상세 명세

## 1. 문서 목적

본 문서는 `Conversation / Attachments` 기능이 customer 앱과 operator 앱에서 어떤 화면 구조, 정보 배치, 상호작용 방식으로 표현되는지 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- inquiry message timeline UI
- chatbot message timeline UI
- message composer UI
- attachment thumbnail / expand / download fallback UI
- raw / display 노출 UI
- expired chatbot session의 read-only 표현
- validation / error / degraded 표시 규칙

이 문서는 아래를 직접 다루지 않는다.

- inquiry lifecycle 자체
- handoff 생성 정책 자체
- backend validation 구현
- attachment 바이너리 저장소 구현
- DB 구현 상세

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- inquiry message timeline screen/region
- chatbot timeline screen/region
- customer/operator message composer
- attachment preview / fallback UI
- raw 보기 action
- read-only session 표시
- error / degraded feedback 방식

## 2.2 직접 다루지 않는 것

- inquiry list / KPI 전체 화면 구조
- assignment / status / reopen action UI
- handoff idempotency 내부 로직
- summary / abuse detection 내부 계산
- external snapshot sync 실행 자체

상위 page/screen ownership은 기존 `Case Management UI`, `Customer Portal / Handoff UI`가 유지하며, 본 문서는 그 안에서 재사용되는 conversation/timeline/composer/attachment region의 공통 표현 규칙을 표준화한다.

## 3. Screen Set

## 3.1 Inquiry Conversation Region

### 역할
- inquiry 상세 화면 안에서 human-handled conversation을 표현하는 핵심 region

### 핵심 목적
- customer / operator message 흐름 확인
- attachment 확인
- 새 메시지 작성
- raw 확인이 필요한 경우 제한적으로 접근

## 3.2 Chatbot Conversation Region

### 역할
- chatbot session 화면 안에서 customer / chatbot 대화를 표현하는 핵심 region

### 핵심 목적
- question / answer 흐름 확인
- attachment 확인
- 새 질문 입력
- expired session 여부 인지

## 3.3 Attachment Preview Surface

### 역할
- message 하위의 attachment를 썸네일 / 확대 / fallback 방식으로 표현하는 공통 UI 영역

### 핵심 목적
- 이미지 attachment 빠른 확인
- preview 실패 시 download fallback 제공
- customer/operator 공통 기본 동작 유지

## 3.4 Screen 구조 해석

- 이 문서는 독립 top-level app entry보다 conversation 관련 region/surface를 중심으로 정의한다.
- inquiry와 chatbot은 상위 화면이 다를 수 있지만, timeline / attachment 표현 규칙은 최대한 공유한다.
- MVP에서는 conversation region 안에서 message 읽기/쓰기와 attachment 확인이 자연스럽게 끝나는 것이 기본 원칙이다.

## 4. Layout Regions

## 4.1 Inquiry Conversation Region layout

### A. Conversation Header

포함 요소:
- inquiry id 또는 상위 inquiry 식별 맥락
- 현재 상태 요약
- 최근 메시지 시각

### B. Message Timeline Region

포함 요소:
- inquiry message timeline
- `content_display`
- raw 보기 action
- attachment 썸네일
- preview 실패 indicator
- download fallback action

### C. Message Composer Region

포함 요소:
- customer 또는 operator 메시지 입력
- attachment 업로드
- 전송 action
- validation error 표시

### 입력 제약 포인트
- message는 trim 후 빈 문자열이면 안 된다.
- message 최대 길이는 2000자다.
- attachment는 `jpg`, `jpeg`, `png`만 허용한다.
- attachment는 1개당 최대 5MB, message당 최대 3개다.

### D. Feedback Region

포함 요소:
- validation error
- forbidden / not found 안내
- degraded 안내
- action success feedback

## 4.2 Chatbot Conversation Region layout

### A. Session Status Region

포함 요소:
- session 상태
- read-only 여부
- 만료 여부

### B. Chat Timeline Region

포함 요소:
- customer question
- chatbot answer
- `content_display`
- raw 보기 action
- attachment 썸네일 / 확대 / download fallback

### C. Input Region

포함 요소:
- customer 메시지 입력
- attachment 업로드
- send action
- validation error 표시

### 입력 제약 포인트
- message는 trim 후 빈 문자열이면 안 된다.
- message 최대 길이는 2000자다.
- attachment는 `jpg`, `jpeg`, `png`만 허용한다.
- attachment는 1개당 최대 5MB, message당 최대 3개다.

### D. Expired Session Region

포함 요소:
- “세션이 만료되었습니다” 안내
- read-only 안내
- 새 세션 시작 action

## 4.3 Attachment Preview Surface layout

### A. Thumbnail Strip / Grid

포함 요소:
- attachment thumbnail set
- preview 가능 여부 표시

### B. Expanded Preview Surface

포함 요소:
- 확대된 이미지 보기
- 닫기 action

### C. Fallback Surface

포함 요소:
- 미리보기 실패 안내
- download action만 제공

## 5. UI State and Interaction Rules

## 5.1 Loading state

### Inquiry conversation
- timeline / composer 영역 loading 가능
- 상위 inquiry 맥락은 유지

### Chatbot conversation
- timeline / input loading 가능
- session 상태를 우선 보여줄 수 있음

### Attachment preview
- thumbnail 영역만 부분 loading 가능
- timeline 전체를 막지 않는다.

## 5.2 Empty state

### Inquiry conversation
- 아직 message 없음 안내
- 첫 메시지 입력 유도

### Chatbot conversation
- 아직 session message 없음 안내
- 첫 질문 입력 유도

### Attachment
- attachment 없음이면 별도 panel보다 조용한 비노출이 자연스럽다.

## 5.3 Success state

- inquiry conversation: timeline + composer + attachment preview 사용 가능
- chatbot conversation: question/answer 확인 + 입력 가능
- attachment: thumbnail/확대/fallback 중 가능한 상태를 표시

## 5.4 Validation error state

- message 입력
- attachment 업로드

가능한 한 입력 필드 근처에 표시하고, 입력값은 유지한다.

## 5.5 Forbidden / Not Found state

### Forbidden
- 허용되지 않은 conversation/raw 접근 시도

### Not Found
- 존재하지 않는 inquiry/session
- 잘못된 대화 진입 링크

## 5.6 Expired session read-only state

- expired chatbot session은 읽기 가능
- append action은 비활성 또는 숨김
- 새 세션 시작 action 제공

## 5.7 Degraded preview state

- preview 실패는 전체 conversation 실패가 아니다.
- 해당 attachment만 degraded로 표시
- message 본문과 timeline은 계속 보여준다.

## 5.8 Interaction principles

- 기본 출력은 `content_display`
- raw는 허용된 범위 안에서만 action을 통해 노출
- attachment는 message 하위에서만 접근
- customer/operator는 공통 기본 rendering 원칙을 공유한다.

## 6. Component Responsibilities

## 6.1 `InquiryConversationPanel`

- inquiry conversation region 전체 조립
- timeline / composer / feedback 배치

## 6.2 `InquiryMessageTimeline`

- inquiry message timeline 렌더링
- `content_display` 기본 출력
- raw 보기 action 연결
- attachment preview/fallback 연결

## 6.3 `InquiryMessageComposer`

- customer 또는 operator 메시지 입력
- attachment 업로드
- send action
- validation 에러 표시

## 6.4 `ChatbotConversationPanel`

- chatbot conversation region 전체 조립
- session status / timeline / input / expired state 배치

## 6.5 `ChatbotMessageTimeline`

- customer question / chatbot answer 렌더링
- `content_display` 표시
- raw 보기 action 연결
- attachment preview/fallback 연결

## 6.6 `ChatbotInputComposer`

- customer 질문 입력
- attachment 업로드
- send action
- validation 에러 표시

## 6.7 `AttachmentThumbnailList`

- attachment thumbnail set 렌더링
- preview 가능 여부 표시
- click-to-expand 연결

## 6.8 `AttachmentPreviewModal` / `AttachmentPreviewPanel`

- 확대 이미지 표시
- 닫기 action 제공
- preview 실패 시 fallback state 전환

## 6.9 `AttachmentFallbackAction`

- 미리보기 실패 시 download action 제공
- 미리보기 불가 상태 안내

## 6.10 `ReadOnlySessionBanner`

- expired/read-only 상태 안내
- 새 세션 시작 action 제공
- append 불가 상태 표시

## 6.11 `InlineError` / `FeedbackBanner`

- validation error
- forbidden / not found 안내
- degraded preview 안내
- action success feedback 표시

## 7. Action Flows

## 7.1 Inquiry conversation message append 흐름

1. inquiry conversation region 진입
2. `InquiryMessageComposer`에 메시지 입력
3. attachment 추가 가능
4. validation 수행
5. append API 호출
6. 성공 시 timeline 갱신

## 7.2 Chatbot message append 흐름

1. chatbot conversation region 진입
2. `ChatbotInputComposer`에 질문 입력
3. attachment 추가 가능
4. validation 수행
5. append API 호출
6. 성공 시 chatbot timeline 갱신

## 7.3 Attachment preview 흐름

1. timeline에서 attachment thumbnail 확인
2. thumbnail 클릭
3. preview resource 확인
4. 가능하면 확대 view 표시
5. 닫기 후 timeline으로 복귀

## 7.4 Attachment fallback 흐름

1. preview 시도
2. preview 생성 또는 로딩 실패
3. degraded indicator 표시
4. download action 제공

## 7.5 Raw content 확인 흐름

1. message에서 raw 보기 action 선택
2. 허용된 customer-visible scope인지 확인
3. 허용되면 raw content 노출
4. internal-only data는 계속 비노출

## 7.6 Expired chatbot session 흐름

1. expired session 진입
2. 기존 timeline은 읽기 가능
3. input은 비활성 또는 숨김
4. 새 세션 시작 action 제공

## 8. Error / Read-only / Degraded Display Detail

## 8.1 Validation error display

- 입력 필드 근처에 표시
- 입력값 유지
- inline error 우선

## 8.2 Forbidden display

- 허용되지 않은 raw access 또는 conversation 접근 시도는 접근 제한 메시지로 표시

## 8.3 Not found display

- 존재하지 않는 inquiry/session 또는 잘못된 링크는 not found 상태로 표시

## 8.4 Read-only expired session display

표시 요소:
- “이 세션은 만료되었습니다”
- “새 세션 시작” 버튼
- append 불가 안내

## 8.5 Degraded preview display

- preview 실패 attachment만 degraded 상태로 표시
- message/timeline 전체는 정상 맥락 유지

## 8.6 Attachment preview failure display

- 미리보기 실패 표시
- download action만 제공

## 8.7 Partial success display

- 일부 attachment만 preview 실패해도 전체 conversation을 실패처럼 보이게 하지 않는다.
- 성공한 attachment와 message 본문은 그대로 유지한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- raw 보기 action wording
- attachment thumbnail 크기 및 grid 배치 세부
- expanded preview modal 기본 크기/배경 처리
- degraded preview indicator wording
- download action icon / text wording
