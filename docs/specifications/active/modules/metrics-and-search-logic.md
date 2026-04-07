# Metrics / Search 로직 단위 상세 명세

## 1. 문서 목적

본 문서는 운영자 관점에서 inquiry 데이터를 검색하고 집계하는 파생 로직을 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- KPI 계산 규칙
- period / timezone rule
- search field 조합
- exclusion rule
- operator-facing list/read projection
- filter/sort behavior

이 문서는 아래를 직접 소유하지 않는다.

- inquiry lifecycle 자체
- message append 자체
- external snapshot sync 자체
- customer portal visibility

## 2. Scope and Ownership

## 2.1 직접 소유하는 것

- KPI derivation rule
- period/timezone rule
- search field 조합
- exclusion rule
- operator-facing read-model search/sort behavior

## 2.2 직접 소유하지 않는 것

- inquiry 상태 전이
- operator 응답 생성
- snapshot 동기화
- customer-facing projection

## 3. Core Derived Models

## 3.1 `inquiry_list_projection`

- operator가 inquiry 목록에서 검색/정렬/필터링할 수 있게 하는 파생 읽기 모델

### 최소 포함 요소
- `inquiry_id`
- `status`
- `inquiry_type`
- `customer_name`
- `last_message_at`
- `last_response_at`
- product summary presence
- linked chatbot handoff 여부
- degraded snapshot state 여부

## 3.2 `kpi_projection`

- 운영 지표 카드/대시보드에 표시할 집계 결과 모델

### 포함 요소
- inquiry count
- average first response time
- resolution rate
- applied period preset
- timezone
- exclusion summary

## 3.3 `period_filter_model`

- 목록/지표에서 공통으로 사용하는 기간 입력 모델

### 포함 요소
- preset type
  - `today`
  - `last_7_days`
  - `last_30_days`
- timezone
- explicit start/end range (향후 확장 후보)

## 3.4 `search_query_model`

- operator가 목록에서 사용하는 검색 조건 묶음

### 최소 포함 요소
- customer name
- order number
- status
- inquiry type
- period
- product name

## 3.5 파생 모델 해석 원칙

- Metrics / Search는 원본 truth를 다시 쓰지 않고 읽는다.
- 계산 기준은 `inquiry`와 관련 시간 필드에 의존한다.
- snapshot 누락은 전체 계산 실패가 아니라 부분 read degradation이다.

## 4. Search Rules

## 4.1 검색 필드 범위

MVP에서 operator search는 아래 필드를 지원한다.

- customer name
- order number
- inquiry status
- inquiry type
- period
- product name

## 4.2 검색 필드 의미

### customer name
- inquiry에 연결된 customer snapshot 기준

### order number
- linked order snapshot 기준

### inquiry status
- 현재 inquiry status 기준

### inquiry type
- inquiry 생성 시 지정된 type 기준

### product name
- linked product snapshot 기준

### period
- preset과 timezone 규칙을 따름

## 4.3 기간 프리셋 규칙

기본 프리셋:

- 오늘
- 최근 7일
- 최근 30일

달력형 “이번 주 / 이번 달”은 현재 MVP 범위에 두지 않는다.

## 4.4 Timezone 규칙

- period 계산 기준 timezone은 `Asia/Seoul`
- 목록 조회와 KPI 집계는 같은 timezone 기준을 사용한다.

## 4.5 정렬 규칙

### 기본 정렬
- `last_message_at` 내림차순

### 보조 해석
- 미처리 우선 정렬은 `RESOLVED`가 아닌 상태를 상위로 배치하는 방식으로 해석 가능

## 4.6 검색 실패 허용 범위

- linked snapshot 일부 누락은 전체 목록 조회 실패 사유가 아니다.
- snapshot 기반 일부 필드만 degraded 될 수 있다.

## 5. KPI Rules

## 5.1 KPI set

고정 KPI 세트:

- inquiry count
- average first response time
- resolution rate

## 5.2 Inquiry count rule

### 정의
- 집계 기간 내 `opened_at` 기준 생성된 신규 inquiry 수

### 제외
- 재오픈된 기존 inquiry
- `chatbot_session`
- auto-expired inquiry
- `is_test=true` inquiry

## 5.3 Average first response time rule

### 정의
- 첫 customer message 이후 첫 operator response까지 걸린 시간의 평균

### 포함 대상
- 첫 operator response가 실제로 발생한 inquiry
- auto-expired가 아닌 inquiry
- `is_test!=true` inquiry

### 제외
- 응답이 없는 inquiry
- `chatbot_session` 자체
- auto-expired inquiry
- test inquiry

## 5.4 Resolution rate rule

### 정의
- 집계 기간 내 종료(`closed_at`)된 inquiry 수 / 같은 기간 내 생성(`opened_at`)된 inquiry 수

### 분자 규칙
- 기간 내 종료된 inquiry
- auto-expired 제외
- test inquiry 제외
- 재오픈 후 다시 종료된 경우에도 최초 종료 1회만 반영

### 분모 규칙
- 기간 내 생성된 inquiry
- auto-expired 제외
- test inquiry 제외

## 5.5 Period and timezone dependency

- 모든 KPI는 `Asia/Seoul` 기준 period filter를 사용
- preset은 목록/지표 모두 동일 기준 사용

## 5.6 Zero-data display rule

- inquiry count = `0`
- average first response time = `-`
- resolution rate = `-`

## 5.7 Test inquiry exclusion rule

- `is_test=true` inquiry는 KPI 계산에서 제외

## 5.8 Auto-expire exclusion rule

- auto-expired inquiry는 KPI 계산에서 제외

## 5.9 Display formatting rule

### average first response time
- 시간/분 자동 변환
- 초 단위는 표시하지 않음

### resolution rate
- 백분율(%)로 표시

### inquiry count
- 정수로 표시

## 6. Application Flows

## 6.1 Inquiry list search flow

1. operator 인증 확인
2. `inquiry_list_projection` 조회 시작
3. period filter 적용
4. customer name / order number / status / inquiry type / product name filter 적용
5. 정렬 규칙 적용
6. operator-facing list projection 반환

## 6.2 KPI calculation flow

1. period preset 해석
2. timezone을 `Asia/Seoul`로 고정
3. KPI 대상 inquiry 집합 수집
4. exclusion rule 적용
5. KPI 계산
6. KPI projection 반환

## 6.3 Average first response time derivation flow

1. inquiry 집합 수집
2. 첫 customer message 시각 확인
3. 이후 첫 operator response 시각 확인
4. 두 시각 차이 계산
5. 응답 있는 inquiry만 평균 계산
6. UI 표시는 시간/분 자동 변환

## 6.4 Resolution rate derivation flow

1. 분자 집합 수집 (`closed_at`)
2. 분모 집합 수집 (`opened_at`)
3. auto-expired / test inquiry 제외
4. 재오픈 후 재종료는 최초 종료 1회만 반영
5. 비율 계산
6. UI에 백분율로 반환

## 6.5 Search result assembly flow

1. inquiry 기본 필드 조회
2. linked customer / order / product 요약 결합
3. degraded snapshot 상태 계산
4. sort/filter 후 projection 생성
5. operator list 반환

## 7. Failure / Edge Cases

## 7.1 Zero-data period

- 기간 내 inquiry 0건이면
  - inquiry count = `0`
  - average first response time = `-`
  - resolution rate = `-`

## 7.2 Missing response timestamps

- first operator response가 없는 inquiry는 average first response time 계산에서 제외

## 7.3 Missing linked snapshot

- 일부 snapshot 누락은 전체 검색 실패가 아님
- snapshot 기반 일부 필드만 degraded 가능

## 7.4 Stale snapshot

- stale snapshot이 있어도 KPI 계산은 inquiry 기준으로 계속 가능
- 검색 결과에는 degraded indicator를 둘 수 있음

## 7.5 Invalid preset input

- 허용되지 않은 preset 요청은 validation rejection 또는 기본 preset fallback 대상으로 둘 수 있다.

## 7.6 Test inquiry contamination

- `is_test=true` inquiry는 KPI 집합에서 반드시 제외

## 7.7 Auto-expire contamination

- auto-expired inquiry는 KPI 집합에서 제외

## 7.8 Snapshot-driven search ambiguity

- product name / customer name이 stale snapshot과 충돌할 수 있음
- 현재 projection 기준으로 검색하되 stale 여부는 indicator로 분리

## 7.9 Resolution rate interpretability issue

- resolution rate는 종료건수/생성건수 방식이므로 UI 주석으로 해석 보조 필요

## 8. Read Model / Operator-facing Outputs

## 8.1 KPI card projection

### 포함 요소
- inquiry count
- average first response time
- resolution rate
- 적용 period preset
- timezone
- exclusion rule 요약

### UI 규칙
- inquiry count: 정수
- average first response time: 시간/분 자동 변환
- resolution rate: `%`
- 0건일 때 평균/해결율은 `-`

## 8.2 Search result projection

### 포함 요소
- `inquiry_id`
- status
- inquiry type
- customer name
- order number summary
- product name summary
- last message time
- last response time
- degraded snapshot indicator
- linked chatbot handoff 여부

## 8.3 Filter preset projection

### 포함 요소
- `today`
- `last_7_days`
- `last_30_days`
- timezone=`Asia/Seoul`

## 8.4 Sort projection

### 기본 정렬
- `last_message_at` 내림차순

### 보조 해석
- 미처리 우선은 `RESOLVED` 제외 상단 배치 가능

## 8.5 Failure-tolerant read rule

- 일부 linked snapshot 누락은 전체 list projection 실패가 아니다.
- KPI 계산은 inquiry/time 기반으로 계속 가능하다.
- 검색 가능한 필드만으로 partial result 반환 가능하다.

## 8.6 Operator interpretation support rule

- period
- timezone
- exclusion rule
- resolution rate 주석

를 projection 레벨에서 함께 제공할 수 있어야 한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강할 local detail이다.

- invalid preset input 처리 방식을 fallback으로 고정할지 여부
- degraded indicator의 정확한 UI wording
- KPI 카드 소수점/표기 미세 정책
- future explicit date-range 확장 방식
