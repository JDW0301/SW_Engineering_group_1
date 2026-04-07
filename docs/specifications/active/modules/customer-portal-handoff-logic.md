# Customer Portal / Handoff 로직 단위 상세 명세

## 1. 문서 목적

본 문서는 `Customer Portal` bounded context에서 customer가 수행하는 핵심 행위와, chatbot self-service 흐름에서 `Case Management`로 연결되는 handoff 로직을 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- customer inquiry 생성 규칙
- customer inquiry message append 규칙
- chatbot session 시작 및 사용 규칙
- chatbot에서 inquiry로의 handoff 규칙
- customer-visible scope와 조회 규칙
- customer-facing failure / rejection 처리

이 문서는 아래를 직접 소유하지 않는다.

- inquiry 상태 lifecycle의 최종 authority
- external snapshot sync 자체
- chatbot answer generation 알고리즘 자체
- summary / abuse detection 알고리즘 자체

## 2. Scope and Ownership

## 2.1 Customer Portal이 직접 소유하는 것

- customer inquiry creation 요청
- customer inquiry message append 요청
- chatbot_session 시작과 customer-side 사용 흐름
- handoff 요청과 handoff 진입 UX 기준
- customer-visible inquiry/session projection

## 2.2 Customer Portal이 직접 소유하지 않는 것

- inquiry 상태 전이의 최종 확정
- external event / snapshot 반영
- chatbot knowledge file 관리 자체
- abuse detection / summary 생성 엔진 자체

## 3. Core Model Interpretation

## 3.1 `customer`

- customer는 inquiry와 chatbot_session의 소유 주체다.
- member-only 정책 아래에서만 유효하다.

## 3.2 `inquiry`

- customer가 생성하고 조회하는 핵심 모델이다.
- customer는 inquiry를 생성하고 메시지를 남길 수 있지만, inquiry 상태를 직접 소유하지는 않는다.

## 3.3 `inquiry_message`

- inquiry 안에서 customer와 operator가 주고받는 메시지다.

## 3.4 `chatbot_session`

- customer self-service 챗봇 대화의 별도 상위 세션이다.
- inquiry와는 별도의 top-level entity다.
- handoff의 출발점이 된다.

## 3.5 `chat_message`

- chatbot_session 내부의 customer 질문 / chatbot 응답 메시지다.

## 3.6 모델 해석 원칙

- customer는 본인 데이터만 다룬다.
- inquiry lifecycle의 최종 authority는 Case Management가 가진다.
- chatbot_session은 inquiry의 하위가 아니라 inquiry로 이어질 수 있는 선행 흐름이다.
- customer 앱에서 보이는 order/product 정보는 customer-visible scope로 가공된 snapshot 정보다.

## 4. Commands / User Actions

## 4.1 `CreateCustomerInquiry`

### 의미
- customer가 새로운 inquiry를 생성한다.

### 최소 입력
- `customer_id`
- `store_id`
- `inquiry_type`
- initial message
- linked order/product reference (optional)

### 결과
- inquiry 생성
- customer ownership 부여
- 상태 `OPEN`

## 4.2 `AppendCustomerInquiryMessage`

### 의미
- customer가 기존 inquiry에 새 메시지를 추가한다.

### 최소 입력
- `inquiry_id`
- `customer_id`
- `content_raw`
- attachments (optional)

### 결과
- `inquiry_message` 추가
- 필요 시 reopen trigger
- `last_message_at` 갱신

## 4.3 `StartChatbotSession`

### 의미
- customer가 self-service chatbot session을 시작한다.

### 최소 입력
- `customer_id`
- `store_id`

### 결과
- 새 `chatbot_session` 생성

## 4.4 `AppendChatbotMessage`

### 의미
- customer가 chatbot_session 안에 새 메시지를 추가한다.

### 최소 입력
- `chatbot_session_id`
- `customer_id`
- `content_raw`
- attachments (optional)

### 결과
- `chat_message` 추가
- chatbot 응답 생성 흐름 호출 가능

## 4.5 `RequestHandoffFromChatbot`

### 의미
- customer가 chatbot_session에서 사람 상담으로 전환을 요청한다.

### 최소 입력
- `chatbot_session_id`
- `customer_id`

### 결과
- 즉시 `inquiry` 생성 또는 기존 linked inquiry로 연결
- `linked_chatbot_session_id` 연결

## 4.6 `ViewCustomerInquiryList`

### 의미
- customer가 본인 inquiry 목록을 조회한다.

## 4.7 `ViewCustomerInquiryDetail`

### 의미
- customer가 특정 inquiry 상세를 조회한다.

## 4.8 `ViewCustomerChatbotSession`

### 의미
- customer가 본인 chatbot_session을 조회한다.

## 5. Visibility and Handoff Rules

## 5.1 Ownership visibility rule

customer는 아래만 볼 수 있다.

- 본인 inquiry
- 본인 inquiry_message
- 본인 chatbot_session
- 본인 chat_message
- 본인에게 연결된 customer-visible order/product summary

customer는 아래를 볼 수 없다.

- 다른 customer의 inquiry
- 다른 customer의 chatbot_session
- internal_note
- operator-only 판단 데이터

## 5.2 Inquiry visibility rule

- customer inquiry list는 본인 inquiry만 포함한다.
- customer inquiry detail은 아래를 포함한다.
  - 상태
  - 대화 내용
  - customer-visible order/product 요약
  - 필요 시 `[상세 보기]` 확장 영역

## 5.3 Raw content visibility rule

- customer는 customer-visible scope 안에서 `content_raw`를 확인할 수 있다.
- internal note / internal 판단 데이터 / internal intermediate data는 제외한다.

## 5.4 Attachment visibility rule

- customer는 inquiry와 chatbot 대화에 이미지 첨부 가능
- 허용 형식: `jpg`, `jpeg`, `png`
- 이미지당 5MB
- 메시지당 3장
- preview 규칙:
  - 썸네일
  - 클릭 확대
  - 실패 시 다운로드 fallback

## 5.5 Handoff rule

- customer는 chatbot_session에서 언제든 handoff 요청 가능
- handoff는 chatbot_session을 inquiry로 변환하는 것이 아니라, linked inquiry를 생성하거나 기존 linked inquiry로 연결하는 동작이다.
- operator는 linked chatbot context를 조회 가능해야 한다.

## 5.6 Handoff duplicate rule

- `chatbot_session`당 handoff로 연결되는 inquiry는 최대 1개다.
- 이미 linked inquiry가 있으면 새 inquiry를 만들지 않는다.
- 중복 handoff 요청은 기존 inquiry로 연결하는 idempotent 처리로 본다.

## 5.7 Auto-expire rule

적용 대상:

- `chatbot_session`
- chatbot handoff로 즉시 생성된 inquiry

적용 조건:

- 유의미한 기록 없음
- customer 추가 메시지 없음

시간값:

- 10분

일반 inquiry에는 auto-expire를 적용하지 않는다.

## 5.8 Customer-visible order/product rule

- 기본 화면에는 상태, 대화 내용, order/product 요약 정보를 표시한다.
- `[상세 보기]`를 통해 더 자세한 order/product 정보를 확장 조회할 수 있다.

## 6. Application Flows

## 6.1 Create customer inquiry flow

1. customer 인증 확인
2. customer context 확인
3. 입력 검증
4. linked order/product reference 확인 (optional)
5. `CreateCustomerInquiry` 수행
6. 내부적으로 `OpenInquiry` 연결
7. inquiry 생성 후 상태 `OPEN`
8. customer-visible inquiry detail 반환 가능

### 핵심 규칙
- 일반 customer inquiry 생성에서는 initial message가 필수다.

## 6.2 Append customer inquiry message flow

1. customer 인증 확인
2. inquiry 조회
3. ownership 확인
4. message/attachment validation
5. `AppendCustomerInquiryMessage` 수행
6. 내부적으로 `AppendCustomerMessage` 연결
7. `last_message_at` 갱신
8. 필요 시 reopen trigger 발생
9. customer-visible 최신 상태 반환 가능

## 6.3 Start chatbot session flow

1. customer 인증 확인
2. `StartChatbotSession` 수행
3. 새 `chatbot_session` 생성
4. session start metadata 기록

## 6.4 Append chatbot message flow

1. customer 인증 확인
2. chatbot_session 조회
3. ownership 확인
4. message/attachment validation
5. `AppendChatbotMessage` 수행
6. `chat_message` 추가
7. chatbot 응답 생성 흐름 호출 가능
8. customer-visible chat timeline 반영

## 6.5 Request handoff from chatbot flow

1. customer 인증 확인
2. chatbot_session 조회
3. ownership 확인
4. session 상태 확인
5. 기존 linked inquiry 존재 여부 확인
6. linked inquiry가 없으면 새 inquiry 생성
7. linked inquiry가 있으면 기존 inquiry로 연결
8. customer를 inquiry context로 이동 가능

### 핵심 규칙
- chatbot handoff inquiry는 initial message 없이도 생성 가능하다.
- linked chatbot context가 inquiry의 초기 맥락 역할을 한다.

## 6.6 View customer inquiry list flow

1. customer 인증 확인
2. customer ownership 기준 inquiry 조회
3. customer-visible 필드로 projection
4. list 반환

## 6.7 View customer inquiry detail flow

1. customer 인증 확인
2. inquiry 조회
3. ownership 확인
4. customer-visible scope projection
5. 상태, 대화, order/product summary 반환
6. `[상세 보기]` 요청 시 확장 정보 제공 가능

## 6.8 View customer chatbot session flow

1. customer 인증 확인
2. chatbot_session 조회
3. ownership 확인
4. session detail projection
5. 만료 여부에 따라 read-only 정책 적용

## 7. Failure and Rejection Cases

## 7.1 Unauthorized access

- 다른 customer의 inquiry/session 접근 시도
- 처리: `권한 없음`

## 7.2 Authentication missing

- 로그인 없이 inquiry/session 접근 또는 생성 시도
- 처리: 로그인 페이지 유도

## 7.3 Inquiry not found

- 존재하지 않는 inquiry 조회 / append 시도
- 처리: 단순 오류

## 7.4 Chatbot session not found

- 존재하지 않는 chatbot_session 접근
- 처리: 단순 오류 또는 새 세션 유도

## 7.5 Expired chatbot session

- 만료된 `chatbot_session`은 읽기만 허용한다.
- 새 메시지 추가는 금지한다.
- 새 handoff 요청은 금지한다.
- UI는 `세션 만료`와 `새 세션 시작`을 함께 제공한다.

## 7.6 Invalid attachment

- 허용되지 않은 형식
- 5MB 초과
- 메시지당 3장 초과
- 처리: 업로드 거절

## 7.7 Invalid message content

- blank message
- trim 후 빈 문자열
- max length 초과
- 처리: validation rejection

## 7.8 Invalid handoff

- ownership mismatch
- 이미 무효한 session
- 허용되지 않는 상태의 중복 handoff
- 처리: handoff 거절 또는 기존 inquiry로 연결

## 7.9 Missing linked order/product data

- summary/detail 영역은 degraded 상태로 표시
- inquiry/message 열람 자체는 유지

## 8. Read Model / Customer-facing Assembly

## 8.1 Customer inquiry list projection

### 최소 포함 필드
- `inquiry_id`
- 현재 상태
- 최근 메시지 시각
- 마지막 operator 응답 시각 (노출 필요 시)
- 연결된 order/product summary 존재 여부

## 8.2 Customer inquiry detail projection

### 최소 포함 요소
- inquiry 상태
- inquiry message timeline
- customer-visible order/product summary
- attachment thumbnail / preview
- `[상세 보기]` 확장 영역

### 제외 요소
- internal_note
- operator-only 판단 데이터
- internal processing intermediate data

## 8.3 Customer chatbot session list/detail projection

### 최소 포함 요소
- `chatbot_session_id`
- 최근 메시지 시각
- chatbot 대화 내용
- handoff 가능 여부
- 만료 여부

## 8.4 Customer-visible order/product display model

### 기본 표시
- order 번호 요약
- product 이름 요약
- inquiry와 연결된 핵심 요약 정보

### 확장 표시
- `[상세 보기]`를 통해 추가 detail 제공

## 8.5 Handoff-derived inquiry representation

- handoff로 생성된 inquiry는 customer에게 일반 inquiry처럼 보일 수 있다.
- 내부적으로는 `linked_chatbot_session_id`를 가지는 inquiry다.

## 8.6 Degraded customer view

- linked order/product 없음
- summary 로딩 실패
- chatbot session 만료

이 경우 degraded section만 안내하고, 본문의 inquiry/message viewing은 유지한다.

## 9. Lower-priority Local Details

아래 항목은 문서 본체를 막는 핵심 규칙은 아니며, customer-facing projection 세부로 남긴다.

- customer-visible status label의 구체적 wording
- `[상세 보기]`에서 보여줄 order/product 상세 필드 범위
- customer chatbot session list의 보관/노출 기간 세부
