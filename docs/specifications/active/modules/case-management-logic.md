# Case Management 로직 단위 상세 명세

## 1. 문서 목적

본 문서는 `Case Management` bounded context의 핵심 로직을 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- `inquiry` 생성과 lifecycle
- `inquiry_message` append 규칙
- `internal_note` append 규칙
- assignment, reopen, 상태 전환 규칙
- `case_context_bundle` 조립 기준
- linked snapshot 누락 상황에서의 처리 기준

이 문서는 아래를 직접 소유하지 않는다.

- 외부 snapshot 동기화 자체
- chatbot knowledge file 관리
- abuse detection 알고리즘 자체
- summary 생성 알고리즘 자체

## 2. Scope and Ownership

## 2.1 Case Management가 직접 소유하는 것

- inquiry 생성
- inquiry 상태 전이
- inquiry 재오픈
- inquiry 담당자 배정
- customer/operator 메시지 append
- internal note append
- inquiry 관련 event 발생
- operator용 inquiry context 조립 기준

## 2.2 Case Management가 직접 소유하지 않는 것

- `customer`, `order`, `product` snapshot 동기화
- external event 수신과 ACL 변환
- chatbot answer 생성
- summary 생성 로직
- abuse detection 로직

## 3. Core Aggregate and Supporting Models

## 3.1 Aggregate Root: `inquiry`

`inquiry`는 Case Management의 aggregate root다.

이 aggregate는 아래 핵심 책임을 가진다.

- 상태를 보유한다.
- customer/operator interaction의 중심이 된다.
- reopen, resolve, assignment 등 lifecycle 규칙을 보호한다.

## 3.2 Aggregate 핵심 속성

- `id`
- `store_id`
- `customer_id`
- `status`
- `inquiry_type`
- `inquiry_channel`
- `assigned_operator_id` (optional)
- `linked_chatbot_session_id` (optional)
- `opened_at`
- `last_message_at`
- `last_response_at` (optional)
- `closed_at` (optional)
- `expired_at` (optional)

`order_id`, `product_id`는 inquiry 존재 조건이 아니라 optional linked reference로 해석한다.

## 3.3 Child / related models

- `inquiry_message`
- `internal_note`

## 3.4 Read-side assembly model

- `case_context_bundle`

## 4. Commands

## 4.1 `OpenInquiry`

### 의미
- 새로운 inquiry를 생성한다.

### 호출 주체
- customer app
- chatbot handoff flow

### 최소 입력
- `store_id`
- `customer_id`
- `inquiry_type`
- `inquiry_channel`
- initial linkage reference (optional)
- `linked_chatbot_session_id` (optional)

### 결과
- inquiry 생성
- 초기 상태 설정
- `opened_at` 설정

## 4.2 `AppendCustomerMessage`

### 의미
- customer가 inquiry에 새 메시지를 추가한다.

### 호출 주체
- customer

### 최소 입력
- `inquiry_id`
- `customer_id`
- `content_raw`
- attachment metadata (optional)

### 결과
- `inquiry_message` 추가
- `last_message_at` 갱신
- 필요 시 reopen candidate 판단

## 4.3 `AppendOperatorMessage`

### 의미
- operator가 inquiry에 응답 메시지를 추가한다.

### 호출 주체
- operator

### 최소 입력
- `inquiry_id`
- `operator_id`
- `content_raw`
- attachment metadata (optional)

### 결과
- `inquiry_message` 추가
- `last_message_at` 갱신 가능
- `last_response_at` 갱신

## 4.4 `AssignOperator`

### 의미
- inquiry 담당 운영자를 설정 또는 변경한다.

### 호출 주체
- operator

### 최소 입력
- `inquiry_id`
- `operator_id`

### 결과
- `assigned_operator_id` 갱신

## 4.5 `ChangeInquiryStatus`

### 의미
- 운영자가 상태를 변경한다.

### 호출 주체
- operator

### 최소 입력
- `inquiry_id`
- `target_status`
- optional reason code

### 결과
- 상태 전이 검증
- 상태 변경
- 필요 시 `closed_at` 갱신

## 4.6 `ReopenInquiry`

### 의미
- 종료된 inquiry를 다시 처리 대상으로 되돌린다.

### 호출 주체
- customer message 후 시스템 규칙
- operator 명시적 조작

### 최소 입력
- `inquiry_id`
- reopen reason / trigger context

### 결과
- 상태를 `IN_PROGRESS`로 전환

## 4.7 `AddInternalNote`

### 의미
- customer 비노출 내부 메모를 추가한다.

### 호출 주체
- operator

### 최소 입력
- `inquiry_id`
- `operator_id`
- note content

### 결과
- `internal_note` 추가

## 5. Domain State Rules

## 5.1 초기 상태 규칙

- `OpenInquiry`로 생성된 inquiry의 기본 상태는 `OPEN`이다.
- chatbot handoff로 즉시 생성된 inquiry도 기본은 `OPEN`이다.
- automation은 inquiry를 직접 `IN_PROGRESS`로 만들지 않는다.

## 5.2 허용 전이

- `OPEN -> WAITING`
- `OPEN -> IN_PROGRESS`
- `WAITING -> IN_PROGRESS`
- `IN_PROGRESS -> ON_HOLD`
- `IN_PROGRESS -> RESOLVED`
- `ON_HOLD -> IN_PROGRESS`
- `RESOLVED -> IN_PROGRESS`

## 5.3 상태 전이 권한

- operator: 상태 전이 가능
- customer: 직접 상태 전이 불가
- automation: 상태 직접 확정 불가

## 5.4 종료 규칙

- `IN_PROGRESS -> RESOLVED`는 operator 명시적 조작으로 발생한다.
- 종료 시 필요하면 `closed_at`을 기록한다.

## 5.5 재오픈 규칙

- `RESOLVED` 상태의 inquiry에 customer 메시지가 추가되면 reopen trigger가 발생한다.
- 재오픈 기본 상태는 `IN_PROGRESS`다.

## 5.6 메시지와 상태의 관계

### customer message
- `last_message_at` 갱신
- `RESOLVED`이면 reopen candidate 판단

### operator message
- `last_response_at` 갱신
- 필요 시 `OPEN` 또는 `WAITING`에서 `IN_PROGRESS`로 조정 가능

## 5.7 금지 규칙

- customer가 직접 `ChangeInquiryStatus` 수행
- automation이 inquiry 상태 직접 확정
- 존재하지 않는 inquiry에 message append
- customer-visible scope에 internal_note 노출
- 일반 inquiry에 auto-expire 적용

## 6. Business Invariants

## 6.1 Ownership invariant

- 모든 inquiry는 정확히 하나의 `customer`에 귀속된다.
- `customer_id` 없이 inquiry는 생성되지 않는다.

## 6.2 Visibility invariant

- `internal_note`는 어떤 경우에도 customer-visible scope에 포함되지 않는다.

## 6.3 Validity invariant

- linked `order`, `product` snapshot이 없거나 stale해도 inquiry 자체는 유효하다.

## 6.4 Lifecycle authority invariant

- 최종 inquiry 상태는 operator 또는 Case Management 도메인 규칙만 변경할 수 있다.
- automation은 상태를 직접 확정하지 않는다.

## 6.5 Message integrity invariant

- 모든 customer/operator 대화 메시지는 반드시 특정 inquiry 문맥에 속해야 한다.

## 6.6 Auto-expiry scope invariant

- 일반 inquiry에는 auto-expire를 적용하지 않는다.

## 6.7 Timestamp invariant

- `last_message_at`은 가장 최근 메시지 시각을 반영해야 한다.
- `last_response_at`은 운영자 측 가장 최근 응답 시각만 반영해야 한다.

## 7. Reopen and Edge Handling

## 7.1 Reopen trigger

- `RESOLVED` 상태의 inquiry에 customer 메시지가 append되면 reopen trigger가 발생한다.

## 7.2 Reopen target state

- 재오픈된 inquiry의 기본 상태는 `IN_PROGRESS`다.

## 7.3 Reopen assignee rule

- customer message로 재오픈되는 경우, 기존 assignee가 유효하면 유지한다.
- 기존 assignee가 없거나 더 이상 유효하지 않으면 `unassigned`로 되돌린다.
- operator가 수동으로 재오픈한 경우에는 자동 재할당하지 않고 `unassigned`로 둔다.

## 7.4 Duplicate inquiry relation

- 동일 customer의 유사 문의가 짧은 시간 안에 여러 개 생성될 수 있다.
- 기본 원칙은 별도 inquiry로 저장하되, operator가 관계를 인지할 수 있어야 한다.

## 7.5 Status-change vs new-message race

- 상태 변경과 새 customer 메시지가 충돌하면 더 늦게 기록된 이벤트를 기준으로 최종 상태를 정한다.
- 종료 이후 새 customer 메시지가 기록되면 reopen 처리한다.

## 7.6 Concurrent operator response conflict

- operator 메시지 append는 동시에 발생해도 둘 다 기록될 수 있다.
- 상태 변경과 assignment 변경은 충돌 감지가 필요하며, 먼저 반영된 변경이 있으면 나중 요청은 `conflict`로 거절한다.

## 7.7 Missing snapshot edge case

- linked customer/order/product snapshot이 오래되었거나 없어도 inquiry 처리는 계속 가능해야 한다.
- UI는 `미연결` 또는 `최신화 필요`를 표시할 수 있어야 한다.

## 8. Application Service Flows

## 8.1 Open inquiry flow

1. actor/customer 유효성 확인
2. 입력 검증
3. `OpenInquiry` 수행
4. 초기 상태 `OPEN` 설정
5. linked chatbot_session 참조 연결 (있을 경우)
6. `InquiryOpened` 기록
7. 읽기 모델 반영

## 8.2 Append customer message flow

1. customer 권한 확인
2. inquiry 조회
3. ownership 확인
4. message validation
5. `AppendCustomerMessage` 수행
6. `last_message_at` 갱신
7. 필요 시 reopen trigger 판단
8. `RESOLVED` 상태였다면 reopen 수행
9. event 기록

## 8.3 Append operator message flow

1. operator 권한 확인
2. inquiry 조회
3. message validation
4. `AppendOperatorMessage` 수행
5. `last_response_at` 갱신
6. 필요 시 상태를 `IN_PROGRESS`로 조정
7. event 기록

## 8.4 Change status flow

1. operator 권한 확인
2. inquiry 조회
3. target status 유효성 확인
4. 전이 가능 여부 검증
5. 최신 상태 기준 충돌 여부 검증
6. `ChangeInquiryStatus` 수행
7. 필요 시 `closed_at` 갱신
8. 상태 변경 event 기록

## 8.5 Reopen inquiry flow

1. inquiry 조회
2. 현재 상태가 `RESOLVED`인지 확인
3. trigger 유형 확인
4. `ReopenInquiry` 수행
5. 상태를 `IN_PROGRESS`로 전환
6. reopen event 기록

## 8.6 Add internal note flow

1. operator 권한 확인
2. inquiry 조회
3. note content validation
4. `AddInternalNote` 수행
5. note added event 기록

## 8.7 Build case context flow

1. inquiry 기본 정보 조회
2. inquiry_message 조회
3. internal_note 조회
4. linked customer/order/product snapshot 조회
5. linked chatbot_session 참조 조회
6. summary / abuse detection 결과 조회
7. `case_context_bundle` 조립
8. missing data는 degraded context로 반환

### degraded context 표현 규칙
- linked reference 자체가 없으면 `미연결`
- linked reference는 있으나 snapshot이 stale하면 `최신화 필요`
- linked reference는 있고 조회를 시도했지만 실패하면 `조회 실패`
- `최신화 필요`, `조회 실패`에는 manual resync 진입점을 제공할 수 있다.

## 9. Domain / Application Events

## 9.1 `InquiryOpened`

- 발생 시점: `OpenInquiry` 성공 후
- 의미: 새 inquiry 생성 완료
- 최소 payload 예시:
  - `inquiry_id`
  - `store_id`
  - `customer_id`
  - `inquiry_type`
  - `inquiry_channel`
  - `opened_at`
  - `linked_chatbot_session_id` (optional)

## 9.2 `CustomerMessageAppended`

- 발생 시점: `AppendCustomerMessage` 성공 후
- 의미: customer 새 메시지 추가
- 최소 payload 예시:
  - `inquiry_id`
  - `message_id`
  - `customer_id`
  - `created_at`

## 9.3 `OperatorMessageAppended`

- 발생 시점: `AppendOperatorMessage` 성공 후
- 의미: operator 응답 추가
- 최소 payload 예시:
  - `inquiry_id`
  - `message_id`
  - `operator_id`
  - `created_at`

## 9.4 `InquiryAssigned`

- 발생 시점: `AssignOperator` 성공 후
- 의미: 담당자 설정 또는 변경
- 최소 payload 예시:
  - `inquiry_id`
  - `assigned_operator_id`
  - `assigned_at`

## 9.5 `InquiryStatusChanged`

- 발생 시점: `ChangeInquiryStatus` 성공 후
- 의미: 상태 전이 기록
- 최소 payload 예시:
  - `inquiry_id`
  - `from_status`
  - `to_status`
  - `changed_by`
  - `changed_at`

## 9.6 `InquiryReopened`

- 발생 시점: `ReopenInquiry` 성공 후
- 의미: 종료된 inquiry의 재활성화
- 최소 payload 예시:
  - `inquiry_id`
  - `trigger_type`
  - `reopened_at`

## 9.7 `InternalNoteAdded`

- 발생 시점: `AddInternalNote` 성공 후
- 의미: 내부 협업 메모 추가
- 최소 payload 예시:
  - `inquiry_id`
  - `note_id`
  - `operator_id`
  - `created_at`

## 10. Failure and Rejection Cases

## 10.1 Inquiry not found

- 존재하지 않는 `inquiry_id`로 조작 시도
- 사용자 노출 기준: 단순 오류

## 10.2 Unauthorized actor

- 다른 customer의 inquiry 접근 시도
- customer의 상태 변경 시도
- 권한 없는 operator action

## 10.3 Invalid state transition

- 허용되지 않은 상태 전이 시도
- 상태는 변경되지 않음

## 10.4 Invalid reopen

- `RESOLVED`가 아닌 inquiry에 대한 reopen 시도
- 기존 상태 유지

## 10.5 Invalid message content

- 빈 문자열
- 허용되지 않은 attachment 형식
- customer/operator 메시지 2000자 초과
- internal note 1000자 초과
- 저장 전 앞뒤 trim 적용 후 빈 문자열이 되면 거절

## 10.6 Snapshot linkage missing

- linked snapshot 누락은 hard failure가 아니라 degraded context다.

## 10.7 Concurrency conflict

- 상태 변경, assignment, customer 새 메시지 간 충돌 감지 필요

## 10.8 Internal note exposure failure

- customer-visible payload에 internal_note가 포함되면 안 된다.

## 11. Read Model and Query Assembly

## 11.1 Inquiry list read model

### 최소 포함 필드
- `inquiry_id`
- `status`
- `inquiry_type`
- `customer_name`
- `last_message_at`
- `last_response_at`
- linked chatbot handoff 여부
- linked order/product summary presence 여부

### 정렬 기준
- 기본: `last_message_at` 내림차순
- 미처리 우선: `RESOLVED` 제외 상단 배치

## 11.2 Inquiry detail read model

### 최소 포함 요소
- inquiry 기본 정보
- inquiry_message 타임라인
- internal_note
- linked customer snapshot
- linked order snapshot
- linked product snapshot
- summary / abuse detection 결과
- linked chatbot_session 참조 정보

## 11.3 `case_context_bundle`

### 정의
- operator가 inquiry를 처리할 때 필요한 묶음 조회 결과

### 포함 원칙
- inquiry가 중심
- linked snapshot은 보조 맥락
- internal_note는 operator 전용
- linked chatbot_session은 원문 참조 가능 형태로 연결

### 중요 규칙
- linked snapshot 일부 누락 허용
- 누락 시 전체 실패가 아니라 degraded bundle 반환

## 11.4 Customer-visible read separation

- internal_note 제외
- internal operational judgment 제외
- raw content는 customer-visible scope 안에서만 허용
- 상태는 customer용 표현 계층을 둘 수 있다.

## 11.5 Missing linkage representation

표현 후보:

- `미연결`
- `최신화 필요`
- `챗봇 기록 조회 실패`

`없음`, `오류`, `stale`는 같은 의미로 취급하지 않는다.

## 11.6 Read/write responsibility split

### write-side
- inquiry lifecycle
- message append
- note append
- assignment
- reopen

### read-side
- list projection
- detail projection
- `case_context_bundle`
- degraded context 표현

## 12. Local Unresolved Items

아래 항목은 global baseline 문제가 아니라, Case Management logic spec 내부에서 이후 더 보강할 local detail이다.

- hold / resolve 사유 코드에 대한 운영자 UI 입력 방식
- duplicate inquiry relation UI 표현 방식
- conflict 발생 시 operator 안내 문구
- manual resync 버튼 노출 UI 방식

## 13. Fixed Local Rules for Current Version

### 13.1 Message and note validation
- customer/operator 메시지 최대 길이: 2000자
- internal note 최대 길이: 1000자
- 공백만 있는 입력은 허용하지 않는다.
- 저장 전 앞뒤 trim을 적용한다.

### 13.2 Hold reason code
- `WAITING_CUSTOMER_INPUT`
- `WAITING_INTERNAL_CONFIRMATION`
- `WAITING_EXTERNAL_SYNC`
- `OTHER`

`ON_HOLD` 전환 시 reason code는 필수이며, 메모는 선택이다.

### 13.3 Resolve reason code
- `ANSWERED`
- `CUSTOMER_CONFIRMED`
- `DUPLICATE_MERGED`
- `NO_FURTHER_ACTION`
- `OTHER`

`RESOLVED` 전환 시 reason code는 필수이며, 메모는 선택이다.

### 13.4 Duplicate inquiry relation
- duplicate inquiry는 자동 병합하지 않는다.
- operator가 대표 inquiry(master)를 수동 지정할 수 있다.
- 연결된 inquiry도 상태와 메시지는 독립 유지한다.
