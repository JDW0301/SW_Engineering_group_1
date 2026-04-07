# Safety Intelligence / Knowledge 로직 단위 상세 명세

## 1. 문서 목적

본 문서는 `Safety Intelligence`와 `Knowledge Policy` 계층이 inquiry/customer 흐름에 제공하는 보조 결과와 지식 자산 규칙을 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- summary 생성 및 재생성 규칙
- abuse detection 결과 생성 규칙
- FAQ / policy / preset / knowledge file 해석 규칙
- chatbot knowledge file 선택과 충돌 해소 규칙
- handoff를 위한 보조 signal 규칙

이 문서는 아래를 직접 소유하지 않는다.

- inquiry 상태 lifecycle의 최종 authority
- operator assignment
- external snapshot sync
- customer auth/session

## 2. Scope and Ownership

## 2.1 직접 소유하는 것

- summary 생성 규칙
- abuse detection 결과 생성 규칙
- knowledge source 선택 규칙
- knowledge file 업로드/활성 해석 규칙
- handoff support signal

## 2.2 직접 소유하지 않는 것

- inquiry 상태 변경의 최종 확정
- inquiry assignment
- external snapshot 갱신
- handoff 실행 자체

## 3. Core Models

## 3.1 `ai_summary`

- `inquiry` 또는 `chatbot_session`의 최신 대화 맥락을 압축한 보조 결과물

### 핵심 해석
- owner당 최신 1개만 유지
- 재생성 시 overwrite
- 현재 전체 대화 기준 생성

## 3.2 `abuse_detection_result`

- customer-visible 대화에서 감지된 부적절 표현과 완화 결과를 담는 보조 결과물

### 핵심 해석
- dictionary 기반 탐지
- raw 유지
- display 완화

## 3.3 `faq_article`

- 반복 질의에 대한 표준 지식 자산

## 3.4 `policy_document`

- 배송/환불/교환 등 정책 근거 자산

## 3.5 `response_preset`

- operator가 빠르게 삽입하는 응답 문구 자산

## 3.6 `chatbot_knowledge_file`

- store/product 정보 기반 self-service 답변에 사용하는 지식 파일

### 핵심 해석
- `.txt` only
- file당 3MB
- 다중 활성 허용
- 충돌 시 최신 업로드 파일 우선
- 업로드 실패 시 기존 활성 파일 집합 유지

## 3.7 모델 해석 원칙

- summary / abuse detection은 보조 결과물이다.
- FAQ / policy / preset / knowledge file은 지식 자산이다.
- 둘은 같은 문서에서 다루지만 책임은 다르다.

## 4. Commands / Actions

## 4.1 `GenerateSummary`

### 의미
- 특정 `inquiry` 또는 `chatbot_session`의 최초 summary를 생성한다.

### 입력
- `owner_type`
- `owner_id`
- current conversation scope

### 결과
- `ai_summary` 생성 또는 저장

## 4.2 `RegenerateSummary`

### 의미
- 현재 전체 대화를 기준으로 summary를 다시 생성한다.

### 결과
- 기존 summary를 최신 값으로 덮어쓴다.

## 4.3 `RunAbuseDetection`

### 의미
- customer-visible 메시지에 대해 dictionary 기반 감지를 수행한다.

### 결과
- `abuse_detection_result`
- `content_display` 완화 후보

## 4.4 `SelectKnowledgeSource`

### 의미
- chatbot 또는 operator support 흐름에서 어떤 지식 자산을 참조할지 선택한다.

## 4.5 `UploadKnowledgeFile`

### 의미
- operator가 knowledge file을 업로드한다.

## 4.6 `ResolveKnowledgeConflict`

### 의미
- 다중 활성 knowledge file 사이 충돌 시 최신 업로드 파일 우선 규칙을 적용한다.

## 4.7 `SuggestHandoff`

### 의미
- self-service 흐름이 충분하지 않을 때 handoff 권고 signal을 생성한다.

### 중요한 제약
- handoff를 직접 실행하지는 않는다.

## 5. Summary / Abuse / Knowledge Rules

## 5.1 Summary generation rule

- `inquiry` 또는 `chatbot_session`당 최신 summary 1개만 유지
- 재생성 시 overwrite
- 현재 전체 대화 기준 재생성
- summary history는 MVP에서 보관하지 않음

## 5.2 Summary ownership rule

- summary owner는 `inquiry` 또는 `chatbot_session`

## 5.3 Summary failure rule

- summary 생성 실패 시 원문 대화 열람은 계속 가능
- summary 실패가 inquiry/chatbot 흐름 자체를 막지 않음

## 5.4 Abuse detection rule

- dictionary 기반 탐지
- raw 유지
- display만 완화
- detection result는 참고 신호

## 5.5 Abuse detection visibility rule

- customer-facing: 완화된 display 기본, raw 확인 가능
- operator-facing: 완화된 display 기본, raw 확인 가능
- internal-only 데이터에는 직접 적용하지 않음

## 5.6 Knowledge file rule

- `.txt` only
- file당 3MB
- 다중 활성 허용
- 충돌 시 최신 업로드 파일 우선
- 업로드 실패 시 기존 활성 파일 집합 유지
- 다중 업로드 가능
- 활성 파일 목록 표시
- 업로드 결과는 파일별 성공/실패 개별 표시

## 5.7 Knowledge conflict rule

- 같은 주제에서 여러 활성 파일이 충돌하면 가장 최근 업로드 파일을 우선 기준으로 사용한다.

## 5.8 Handoff support rule

- 이 계층은 handoff를 직접 실행하지 않는다.
- handoff suggestion signal만 제공한다.

## 5.9 Response authority rule

- 지식 자산은 근거 제공
- summary는 맥락 제공
- detection은 안전 신호 제공
- 최종 응답 책임과 상태 authority는 operator / Case Management에 있다.

## 6. Application Flows

## 6.1 Generate inquiry summary flow

1. 대상 `inquiry` 조회
2. 현재 전체 `inquiry_message` 범위 수집
3. summary 생성 요청
4. 결과를 `ai_summary`로 저장
5. 기존 summary overwrite
6. operator-facing projection 반영

## 6.2 Generate chatbot session summary flow

1. 대상 `chatbot_session` 조회
2. 현재 전체 `chat_message` 범위 수집
3. summary 생성 요청
4. 결과 저장
5. 기존 summary overwrite

## 6.3 Abuse detection flow

1. customer-visible message raw content 수집
2. detection dictionary 로드
3. dictionary 기반 탐지 수행
4. `abuse_detection_result` 생성
5. 완화된 display 결과 계산
6. projection에 반영 가능

## 6.4 Operator knowledge reference flow

1. operator가 inquiry 열람
2. 관련 FAQ/policy/preset 후보 조회
3. 필요한 knowledge set 선택
4. 참고 근거 제공
5. 최종 응답은 operator가 직접 선택/작성

## 6.5 Chatbot knowledge answering flow

1. customer question 수집
2. active knowledge file set 조회
3. FAQ/policy/preset과 함께 knowledge source 선택
4. self-service answer generation 시도
5. answer 반환
6. 필요 시 handoff suggestion signal 생성

## 6.6 Knowledge file upload flow

1. operator 권한 확인
2. 파일 형식 검증 (`.txt`)
3. 크기 검증 (3MB 이하)
4. 다중 업로드 처리
5. 성공 파일은 active set 반영
6. 실패 파일은 기존 set 유지
7. 파일별 성공/실패 결과 반환
8. 활성 파일 목록 갱신

## 6.7 Knowledge conflict resolution flow

1. 여러 활성 knowledge file 후보 충돌
2. 업로드 시각 비교
3. 가장 최근 업로드 파일 우선
4. canonical answer basis 결정

## 6.8 Handoff suggestion flow

1. self-service answer 시도
2. 답변 불충분 또는 근거 부족 판단
3. handoff suggestion signal 생성
4. customer에게 handoff 유도 가능
5. 실제 inquiry 생성은 상위 flow에서 수행

## 7. Failure and Rejection Cases

## 7.1 Summary generation failure

- summary 생성 실패 시 원문 대화는 계속 열람 가능
- 상위 흐름은 계속 진행

## 7.2 Abuse detection failure

- detection 실패 시 `분석 불가` 상태 가능
- 메시지 저장/조회는 계속 가능

## 7.3 Knowledge file upload failure

- 형식 오류 / 크기 초과 / 저장 실패 시 해당 파일 업로드만 실패
- 기존 active knowledge set 유지

## 7.4 Knowledge conflict ambiguity

- 충돌 시 최신 업로드 우선 규칙 적용
- 충돌 자체가 전체 질문 처리 실패를 의미하지는 않음

## 7.5 Invalid knowledge file

- `.txt`가 아니거나 3MB 초과면 업로드 거절

## 7.6 Unsupported answer basis

- 현재 knowledge 범위를 벗어나면 self-service 확답 금지
- handoff suggestion 가능

## 7.7 Invalid handoff suggestion state

- 만료된 session, 이미 linked inquiry가 있는 상황 등에서는 새 handoff execution을 하지 않음

## 8. Read Model / Operator-facing Outputs

## 8.1 Summary projection

- 최신 `ai_summary`
- 생성 시각
- owner 정보
- source 범위 정보 (필요 시)

## 8.2 Abuse detection projection

- detection 여부
- 감지 카테고리
- severity
- 완화 대상 segment
- 분석 시각

## 8.3 Knowledge set projection

- 현재 활성 knowledge file 목록
- 업로드 시각
- 파일명
- 파일 크기
- 파일별 업로드 성공/실패 결과

## 8.4 FAQ / policy / preset reference projection

- 참조 가능한 FAQ 목록
- 관련 policy document 목록
- response preset 후보 목록

## 8.5 Handoff support projection

- self-service 한계 여부
- handoff 권고 가능 여부
- linked chatbot summary 존재 여부

## 8.6 Failure-tolerant projection rule

- summary 실패는 summary 영역만 비워짐
- detection 실패는 detection 영역만 degraded
- knowledge file 일부 업로드 실패는 해당 파일만 실패
- 전체 inquiry 흐름은 계속 유지

## 9. Local Detail Candidates

아래는 현재 핵심 baseline을 막는 규칙은 아니며, 이후 필요 시 보강할 local detail이다.

- knowledge file 정렬 방식 세부
- handoff suggestion 문구 세부 기준
- summary source range를 더 세분화할지 여부
- preset 우선순위를 더 세밀하게 둘지 여부
