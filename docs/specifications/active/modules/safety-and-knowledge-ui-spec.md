# Safety Intelligence / Knowledge UI 상세 명세

## 1. 문서 목적

본 문서는 operator 앱에서 `Safety Intelligence / Knowledge` 기능이 어떤 화면 구조, 정보 배치, 상호작용 방식으로 표현되는지 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- inquiry/chatbot summary 표시 UI
- abuse detection 표시 UI
- FAQ / policy / preset 탐색 UI
- chatbot knowledge file 업로드 / 목록 UI
- degraded / partial failure 표시 규칙
- operator/customer 노출 차이에 따른 UI 해석
- validation / error feedback 표시 규칙

이 문서는 아래를 직접 다루지 않는다.

- inquiry 상태 lifecycle 자체
- handoff 실행 UX 자체
- chatbot answer generation 내부 로직
- backend validation 구현
- DB 구현 상세

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- summary panel UI
- abuse detection panel UI
- knowledge asset list / selection UI
- knowledge file upload / list UI
- degraded / partial failure feedback 방식
- operator-facing provenance 표시

## 2.2 직접 다루지 않는 것

- customer app 화면 전체
- conversation timeline 자체
- handoff button/transition owning UI
- inquiry assignment / status change UI
- external snapshot sync 실행 자체

상위 page/screen ownership은 기존 `Case Management UI`, `Customer Portal / Handoff UI`, `Conversation / Attachments UI`가 유지하며, 본 문서는 그 안에서 재사용되는 summary/detection/knowledge region의 공통 표현 규칙을 표준화한다.

## 3. Screen Set

## 3.1 Operator Inquiry Safety / Knowledge Region

### 역할
- operator inquiry detail 안에서 summary / detection / knowledge support 정보를 제공하는 핵심 region

### 핵심 목적
- 문의 핵심 맥락 빠르게 파악
- 위험 신호 인지
- 관련 FAQ / policy / preset 참조
- 답변 작성 근거 확보

## 3.2 Operator Chatbot Support Region

### 역할
- linked chatbot session 또는 chatbot summary 맥락을 보조적으로 보여주는 region

### 핵심 목적
- chatbot 대화 핵심 파악
- self-service 한계 여부 확인
- handoff support signal 인지

## 3.3 Knowledge File Management Screen

### 역할
- operator가 chatbot knowledge file을 업로드하고 active set을 관리하는 화면

### 핵심 목적
- 현재 active file 목록 확인
- 다중 파일 업로드
- 파일별 성공/실패 결과 확인
- 충돌 시 최신 업로드 우선 baseline 유지

## 3.4 Screen 구조 해석

- summary/detection/knowledge UI는 독립 업무 화면보다 inquiry/chatbot 처리 화면 안의 보조 region으로 해석하는 것이 기본이다.
- knowledge file management만 비교적 독립 화면/관리 화면으로 분리될 수 있다.
- MVP에서는 operator가 같은 작업 흐름 안에서 맥락 확인과 답변 근거 탐색을 마치는 것이 기본 원칙이다.

## 4. Layout Regions

## 4.1 Operator Inquiry Safety / Knowledge Region layout

### A. Summary Panel

포함 요소:
- 최신 inquiry summary
- summary 생성 시각
- 재생성 action
- summary 실패 시 degraded 안내

### B. Abuse Detection Panel

포함 요소:
- detection status
- severity
- 감지 category 요약
- 완화된 display 기준 안내
- raw 확인 가능 여부 안내

### C. Knowledge Reference Panel

포함 요소:
- 관련 FAQ 목록
- policy document 목록
- response preset 후보 목록
- 선택된 근거 자산 강조

### 기본 범위
- 기본적으로 현재 store의 active knowledge asset을 우선 표시한다.

### D. Feedback Region

포함 요소:
- summary 생성 실패 안내
- detection 실패 안내
- asset 조회 실패 안내
- action success feedback

## 4.2 Operator Chatbot Support Region layout

### A. Chatbot Summary Panel

포함 요소:
- 최신 chatbot session summary
- summary 생성 시각
- linked inquiry 참고 여부

### B. Handoff Support Signal Panel

포함 요소:
- self-service 한계 여부
- handoff 권고 가능 여부
- linked chatbot summary 존재 여부

### C. Safety / Detection Context Panel

포함 요소:
- detection result 요약
- display 완화 상태 안내
- degraded 여부

## 4.3 Knowledge File Management Screen layout

### A. Upload Region

포함 요소:
- 다중 파일 선택
- 업로드 action
- 형식/크기 제약 안내

### 입력 제약 포인트
- knowledge file은 `.txt`만 허용한다.
- file당 최대 3MB다.
- 다중 파일 업로드를 허용한다.

### B. Active File List Region

포함 요소:
- active knowledge file 목록
- 파일명
- 파일 크기
- 업로드 시각
- upload status

### C. Upload Result Region

포함 요소:
- 파일별 성공/실패 결과
- 실패 사유 안내 가능
- active set 유지 안내

### 핵심 안내
- 일부 실패 파일이 있어도 기존 active set은 유지된다.

### D. Conflict / Priority Hint Region

포함 요소:
- 최신 업로드 파일 우선 규칙 안내
- 충돌 시 현재 기준 파일 설명

## 5. UI State and Interaction Rules

## 5.1 Loading state

### Inquiry safety / knowledge region
- summary / detection / knowledge panel 각각 독립 loading 가능
- inquiry 본문은 계속 유지

### Knowledge file management screen
- active file 목록 loading 가능
- upload region은 유지 가능

## 5.2 Empty state

### Summary panel
- 아직 summary 없음 안내
- 생성 action 유도

### Knowledge reference panel
- 참조 가능한 asset 없음 안내

### Knowledge file management
- active file 없음 안내
- 첫 파일 업로드 유도

## 5.3 Success state

- summary가 표시되고 최신 생성 시각이 보인다.
- detection 상태와 severity가 표시된다.
- FAQ/policy/preset/knowledge file 후보가 자연스럽게 탐색 가능하다.

## 5.4 Validation error state

- knowledge file 업로드
- 검색/필터 입력

가능한 한 입력 필드 또는 upload 결과 근처에 표시한다.

## 5.5 Forbidden / Not Found state

### Forbidden
- operator 권한 없는 knowledge 관리 접근
- 제한된 raw/detection detail 접근

### Not Found
- 존재하지 않는 inquiry/session summary
- 존재하지 않는 knowledge asset

## 5.6 Degraded state

- summary 실패는 summary panel만 degraded
- detection 실패는 detection panel만 degraded
- 일부 knowledge file 업로드 실패는 해당 파일만 failed 표시
- 전체 inquiry/chatbot 흐름은 계속 유지

## 5.7 Interaction principles

- 기본 출력은 `content_display` 기준을 따른다.
- raw는 허용된 범위 안에서만 별도 action을 통해 접근한다.
- summary/detection은 참고 보조 정보이며 최종 판단 UI가 아니다.
- handoff signal은 지원 정보이지 직접 실행 버튼을 다시 소유하지 않는다.

## 6. Component Responsibilities

## 6.1 `InquirySummaryPanel`

- 최신 inquiry summary 렌더링
- 생성 시각 표시
- regenerate action 연결

## 6.2 `AbuseDetectionPanel`

- detection status / severity / category 표시
- degraded 상태 표시
- raw availability 안내

## 6.3 `KnowledgeReferencePanel`

- FAQ / policy / preset 후보 렌더링
- 선택된 근거 자산 강조

## 6.4 `ChatbotSupportSignalPanel`

- handoff suggestion signal 렌더링
- linked chatbot summary 존재 여부 표시

## 6.5 `KnowledgeFileUploadPanel`

- 다중 파일 업로드
- 형식/크기 제약 안내
- upload action 연결

## 6.6 `KnowledgeFileList`

- active file 목록 렌더링
- 파일명 / 크기 / 업로드 시각 / status 표시

## 6.7 `KnowledgeUploadResultPanel`

- 파일별 성공/실패 결과 표시
- active set 유지 안내

## 6.8 `InlineError` / `FeedbackBanner`

- validation error
- forbidden / not found 안내
- degraded 안내
- action success feedback 표시

## 7. Action Flows

## 7.1 Inquiry summary 생성 흐름

1. operator가 inquiry detail 진입
2. `InquirySummaryPanel`에서 summary 생성 action 선택
3. summary API 호출
4. 성공 시 최신 summary 표시

## 7.2 Inquiry summary 재생성 흐름

1. 기존 summary 확인
2. regenerate action 선택
3. 현재 전체 대화 기준 재생성 요청
4. 성공 시 기존 summary overwrite 반영

## 7.3 Abuse detection 확인 흐름

1. inquiry detail 진입
2. `AbuseDetectionPanel`에서 detection 결과 확인
3. severity / category / display 완화 상태 확인
4. 필요 시 raw 확인 action을 상위 conversation UI와 연동

## 7.4 Knowledge reference 탐색 흐름

1. operator가 inquiry 또는 chatbot support region 확인
2. FAQ / policy / preset 후보 확인
3. 필요한 자산 선택
4. 답변 작성 흐름으로 복귀

## 7.5 Knowledge file 업로드 흐름

1. knowledge file management screen 진입
2. 다중 파일 선택
3. 형식/크기 validation 수행
4. upload API 호출
5. 파일별 성공/실패 결과 표시
6. active file 목록 갱신

## 7.6 Knowledge conflict 확인 흐름

1. active file 목록 확인
2. 충돌 가능 파일 존재 시 우선 기준 확인
3. 최신 업로드 파일 우선 규칙 안내 확인

## 8. Error / Read-only / Degraded Display Detail

## 8.1 Validation error display

- upload/input 근처에 표시
- 입력값 유지 가능
- per-file error를 우선 표시

## 8.2 Forbidden display

- 권한 없는 knowledge asset 접근/수정 시도는 접근 제한 메시지로 표시

## 8.3 Not found display

- 존재하지 않는 summary/asset/session은 not found 상태로 표시

## 8.4 Degraded summary display

- summary 실패 시 “요약 생성 실패” 또는 동등한 안내를 표시
- 원문 conversation 접근은 계속 유지

## 8.5 Degraded detection display

- detection 실패 시 `분석 불가` 또는 동등한 degraded 상태 표시
- 전체 inquiry/chatbot 흐름은 계속 유지

## 8.6 Partial upload failure display

- 일부 파일만 실패해도 전체 업로드를 실패처럼 보이게 하지 않는다.
- 성공 파일과 실패 파일을 분리해서 보여준다.

## 8.7 Handoff support signal display

- handoff suggestion은 보조 안내처럼 표현
- handoff 실행 버튼 ownership과 혼동되지 않게 한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 보강 가능한 local detail이다.

- summary panel wording 세부
- severity badge color/label 세부
- knowledge asset 검색/필터 UI 세부
- upload result failure reason wording
- handoff support signal wording 세부
