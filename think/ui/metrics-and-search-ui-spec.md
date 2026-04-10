# Metrics / Search UI 상세 명세

## 1. 문서 목적

본 문서는 운영자 앱에서 `Metrics / Search` 기능이 어떤 화면 구조, 정보 배치, 상호작용 방식으로 표현되는지 정의한다.

이 문서는 기존 화면의 전체 authority를 다시 소유하지 않는다. 이미 `Case Management UI`가 소유하는 operator inquiry list screen 위에서 **search / KPI / period interpretation UI 공통 규칙만 표준화**하며, inquiry list screen의 최종 화면 authority는 해당 소유 문서를 우선 기준으로 유지한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- inquiry 목록 검색/필터 화면
- KPI summary bar 표시 규칙
- period preset / timezone 표시 규칙
- degraded search result 표시 규칙
- zero-data KPI / empty result 표시 규칙

이 문서는 아래를 직접 다루지 않는다.

- inquiry detail 처리 화면 자체
- operator message / note 작성 UI
- external snapshot sync 실행 UI 자체
- customer-facing search 화면
- backend validation 구현 상세

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- operator inquiry list screen의 검색/필터 UX
- KPI summary 영역의 표시 방식
- search result list/table의 projection 배치
- period/timezone/exclusion interpretation 표시
- partial degradation / zero-data / validation feedback 규칙

## 2.2 직접 다루지 않는 것

- inquiry detail screen의 전체 레이아웃 authority
- assignment / status / reopen action UI
- customer-facing inquiry 탐색 UX
- external snapshot detail/recovery 화면
- API/DB 구현 상세

## 3. Screen Set

## 3.1 Operator inquiry list search and metrics region

### 역할
- 운영자가 기존 inquiry list screen 안에서 inquiry 목록을 빠르게 탐색하고 KPI를 함께 해석하는 영역

### 핵심 목적
- 어떤 inquiry를 먼저 열어야 하는지 triage 판단을 돕는다.
- 기간별 KPI 변화와 현재 검색 결과를 같은 문맥에서 해석하게 한다.

### Screen 구조 해석
- 기존 operator inquiry list screen 안에 search/filter 영역, KPI summary bar, inquiry result region을 함께 둔다.
- KPI는 inquiry list와 같은 period/timezone 기준을 공유해야 한다.

## 3.2 Search interpretation support region

### 역할
- period, timezone, exclusion rule 같은 해석 보조 정보를 operator에게 제공한다.

### 핵심 목적
- KPI와 검색 결과를 숫자만이 아니라 조건과 함께 해석하게 한다.
- zero-data period와 degraded result를 오류로 오해하지 않게 한다.

### Screen 구조 해석
- 독립 페이지라기보다 inquiry list screen 안의 보조 region/panel이다.
- KPI summary bar 또는 filter bar 근처에 함께 배치할 수 있다.

## 4. Layout Regions

## 4.1 Operator inquiry list search and metrics region

### A. Search / Filter Bar

포함 요소:
- customer name 검색
- order number 검색
- product name 검색
- inquiry status 필터
- inquiry type 필터
- period preset selector

입력 제약 포인트:
- 허용 preset은 `today`, `last_7_days`, `last_30_days`만 사용한다.
- custom date range 입력 UI는 MVP 기본 범위에 두지 않는다.
- 임의 timezone 변경 UI는 두지 않는다.

### B. KPI Summary Bar

포함 요소:
- inquiry count card
- average first response time card
- resolution rate card
- 적용 period preset 표시
- timezone 표시

핵심 안내:
- KPI summary는 inquiry list와 동일한 period/timezone 기준으로 계산된 값이어야 한다.
- zero-data period일 때도 bar 자체는 숨기지 않는다.

### C. Search Interpretation Support Region

포함 요소:
- timezone=`Asia/Seoul` 안내
- exclusion rule 요약 (`auto-expired`, `is_test=true`)
- resolution rate 해석 보조 문구
- degraded result 해석 안내

핵심 안내:
- 숫자 해석에 필요한 조건을 KPI 근처에 짧게 표시한다.
- 상세 설명이 길어지면 tooltip/help text로 분리할 수 있다.

### D. Inquiry Result List Region

각 행/카드 최소 포함 요소:
- inquiry id
- status badge
- inquiry type badge
- customer name
- order number summary
- product name summary
- last message time
- last response time
- degraded snapshot indicator
- linked chatbot session indicator

핵심 안내:
- 목록은 lightweight projection을 유지한다.
- degraded indicator가 있어도 결과 row는 계속 표시한다.

### E. Empty / Feedback Region

포함 요소:
- 결과 없음 안내
- invalid filter feedback
- zero-data KPI 안내
- 재검색 유도 문구

핵심 안내:
- 검색 결과 없음과 KPI 0건은 오류처럼 표현하지 않는다.
- 필터 입력값은 가능한 한 유지한다.

## 5. UI State and Interaction Rules

## 5.1 Loading state

- filter bar는 유지하고 result list/KPI 영역만 loading 처리할 수 있다.
- period preset 변경 시 KPI summary와 result list를 함께 재조회할 수 있다.
- loading 중에도 현재 선택된 filter 문맥은 유지한다.

## 5.2 Empty state

- 검색 결과가 없으면 `조건에 맞는 문의가 없습니다.` 같은 단순 안내를 표시한다.
- KPI 0건 period라도 KPI summary bar는 유지하고 값만 `0` / `-` / `-`로 표시한다.

## 5.3 Success state

- KPI summary와 inquiry result list를 함께 표시한다.
- operator는 검색 결과에서 특정 inquiry를 선택해 detail screen으로 이동할 수 있다.

## 5.4 Degraded state

- linked snapshot 일부 누락/stale은 결과 row 단위 indicator로 표시한다.
- degraded indicator는 목록 탐색을 막지 않는다.
- KPI summary는 inquiry/time 기반 계산을 계속 유지한다.
- `조회 실패` 같은 표현은 snapshot-backed summary field 해석에 한정하고, 전체 검색 실패 의미로 사용하지 않는다.

## 5.5 Validation error state

- 허용되지 않은 preset 또는 잘못된 filter 형식은 filter bar 근처에 짧게 표시한다.
- invalid filter가 있어도 기존 입력값은 가능한 한 유지한다.

## 5.6 Forbidden / Not Found state

- operator 권한이 없으면 screen 전체를 접근 제한 메시지로 대체할 수 있다.
- 이 화면은 collection/search 성격이므로 일반적으로 not found보다 empty/validation으로 해석한다.

## 5.7 Zero-data interpretation state

- inquiry count는 `0`으로 표시한다.
- average first response time은 `-`로 표시한다.
- resolution rate는 `-`로 표시한다.
- zero-data period는 데이터 부재이지 오류가 아니다.

## 5.8 Interaction principles

- KPI와 검색 결과는 같은 period/timezone 문맥을 공유해야 한다.
- default sort는 `last_message_at` 내림차순으로 유지한다.
- snapshot 기반 일부 필드가 degraded여도 결과 목록 전체를 실패처럼 보이게 하지 않는다.
- interpretation support text는 숫자 해석을 돕되 화면을 과도하게 복잡하게 만들지 않는다.

## 6. Component Responsibilities

## 6.1 `InquiryListSearchMetricsRegion`

- 기존 inquiry list screen 안의 search/KPI 영역 조립
- filter state, KPI summary, result list를 함께 관리

## 6.2 `SearchFilterBar`

- customer/order/product 검색 입력 관리
- status/inquiry type filter 관리
- period preset 선택 관리

## 6.3 `KpiSummaryBar`

- inquiry count 표시
- average first response time 표시
- resolution rate 표시
- zero-data period 표현 유지

## 6.4 `SearchInterpretationPanel`

- timezone 표시
- exclusion rule 요약
- resolution rate 해석 보조 문구
- degraded result 해석 안내

## 6.5 `InquiryResultTable` / `InquiryResultList`

- 목록 projection 렌더링
- degraded indicator 표시
- linked chatbot session indicator 표시

## 6.6 `EmptyStatePanel` / `InlineFilterError`

- 결과 없음 안내
- validation feedback
- 재검색 유도 문구 표시

## 7. Action Flows

## 7.1 기본 목록 조회 흐름

1. operator가 inquiry list screen에 진입한다.
2. 기본 period preset과 filter 상태로 KPI summary와 result list를 조회한다.
3. screen은 동일 period/timezone 기준의 KPI와 목록을 함께 렌더링한다.

## 7.2 Filter 적용 흐름

1. operator가 customer name / order number / status / inquiry type / product name / period preset을 조정한다.
2. system이 validation 가능한 형식을 확인한다.
3. inquiry result list를 현재 filter 기준으로 다시 조회한다.
4. period preset이 함께 변경된 경우 KPI summary도 같은 period/timezone 기준으로 다시 조회한다.
5. 결과가 있으면 목록을 갱신하고, 없으면 empty state를 표시한다.

## 7.3 Period preset 변경 흐름

1. operator가 `today`, `last_7_days`, `last_30_days` 중 하나를 선택한다.
2. screen은 `Asia/Seoul` 기준으로 period를 해석한다.
3. KPI summary와 result list를 함께 갱신한다.
4. support region에서 현재 period/timezone/exclusion rule을 유지 표시한다.

## 7.4 Degraded search result 확인 흐름

1. result row에서 degraded indicator를 본다.
2. operator는 일부 snapshot 필드가 누락/stale임을 해석한다.
3. row 자체는 계속 사용 가능하며 inquiry detail 진입도 막지 않는다.

## 7.5 Result row → inquiry detail 이동 흐름

1. operator가 특정 inquiry row를 선택한다.
2. inquiry detail screen으로 이동한다.
3. 복귀 시 기존 filter/period 문맥은 유지 가능하다.

## 8. Error / Degraded Display Detail

## 8.1 Validation error display

- 가능한 한 filter input 가까이에 표시한다.
- 입력값은 유지한다.
- field-level feedback을 우선한다.

## 8.2 Degraded search result display

표현 예:
- `미연결`
- `최신화 필요`
- `조회 실패`

### 원칙
- degraded indicator는 row 단위로 국소적으로 표시한다.
- 전체 결과 목록이나 KPI summary를 실패 화면처럼 바꾸지 않는다.
- degraded wording은 linked snapshot-backed summary field의 부분 문제를 뜻해야 한다.

## 8.3 Zero-data KPI display

- inquiry count = `0`
- average first response time = `-`
- resolution rate = `-`

### 원칙
- 0건 period는 정상 해석 가능한 상태다.

## 8.4 Empty result display

- `조건에 맞는 문의가 없습니다.`
- `필터를 조정해 다시 검색해 주세요.`

## 8.5 Forbidden display

- operator 권한이 없는 경우 접근 제한 메시지로 표시한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강 가능한 local detail이다.

- period preset 생략 시 기본값을 `today`로 둘지 `last_7_days`로 둘지
- degraded indicator를 텍스트/아이콘/색상 조합 중 어떻게 고정할지
- KPI explanation tooltip 기본 노출 여부
- pagination UI 세부 배치
