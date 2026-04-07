# Metrics / Search API 상세 명세

## 1. 문서 목적

본 문서는 `Metrics / Search` 로직을 HTTP/API 계약으로 번역한 명세를 정의한다.

이 문서는 기존 endpoint의 전체 계약을 다시 소유하지 않는다. 이미 `Case Management API`가 소유하는 operator inquiry list endpoint 위에서 **search / period / KPI projection 공통 계약만 표준화**하며, inquiry lifecycle과 operator action의 최종 authority는 해당 소유 문서를 우선 기준으로 유지한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- operator inquiry list search contract
- KPI summary API
- period / timezone contract
- search filter / sort contract
- exclusion / degraded projection 노출 규칙

이 문서는 아래를 직접 다루지 않는다.

- inquiry lifecycle 변경 API
- message append / note append API
- external snapshot sync API
- customer-facing search 화면
- DB 구현 상세

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- operator 조회 전용 endpoint 정의
- request / response shape
- period preset / timezone contract
- KPI projection contract
- operator inquiry list의 search/sort/query contract
- validation / rejection response
- partial degradation 반환 규칙

## 2.2 직접 다루지 않는 것

- inquiry 상태 변경
- operator 응답 작성
- external snapshot 동기화 실행
- customer-facing projection
- UI 레이아웃 구조
- operator inquiry detail/action endpoint 전체 계약

## 3. API Domain Split

## 3.1 Inquiry Search API

### 역할
- 운영자가 existing inquiry list endpoint에서 검색, 필터링, 정렬 규칙을 사용하는 공통 계약

### 포함 기능
- customer name 검색
- order number 검색
- inquiry status 필터
- inquiry type 필터
- product name 검색
- period preset 적용
- paging

### 특징
- read-only projection API다.
- 기본 정렬은 `last_message_at` 내림차순이다.
- linked snapshot 일부 누락은 전체 검색 실패가 아니라 partial degradation으로 해석한다.
- 독립 search endpoint를 새로 추가하기보다 기존 `GET /operator/inquiries` query contract를 기준으로 해석한다.

## 3.2 KPI Summary API

### 역할
- 운영자가 period 기준 KPI 집계를 조회하는 API

### 포함 기능
- inquiry count 반환
- average first response time 반환
- resolution rate 반환
- exclusion rule 요약 반환

### 특징
- KPI는 inquiry/time 기반 파생 계산 결과다.
- auto-expired inquiry와 `is_test=true` inquiry는 집계에서 제외한다.
- zero-data period는 오류가 아니라 정상 응답으로 처리한다.

## 3.3 경계 원칙

- Metrics / Search API는 원본 truth를 직접 수정하지 않는다.
- KPI와 search는 operator-facing read model/projection을 제공한다.
- snapshot 기반 일부 필드가 누락되거나 stale해도 inquiry/time 기반 조회는 계속 가능해야 한다.
- customer-facing inquiry 탐색 기능은 직접 소유하지 않는다.

## 4. Resource Set

## 4.1 Operator resources

- `GET /operator/inquiries` (search / filter / sort contract 표준화)
- `GET /operator/metrics/kpis`

## 5. Common API Rules

## 5.1 인증 / 권한 규칙

### operator API
- 세션 기반 인증 필요
- operator role 필요

## 5.2 응답 기본 구조

기본 응답 형태:

- `data`
- `meta`
- `error`

## 5.3 period / timezone 반환 규칙

- 허용 preset:
  - `today`
  - `last_7_days`
  - `last_30_days`
- period 계산 기준 timezone은 `Asia/Seoul`이다.
- inquiry search와 KPI summary는 같은 preset/timezone 기준을 사용한다.

## 5.4 search filter 반환 규칙

- MVP에서 operator search는 아래 필드를 지원한다.
  - `customer_name`
  - `order_number`
  - `status`
  - `inquiry_type`
  - `period_preset`
  - `product_name`
- 기본 정렬은 `last_message_at desc`다.
- 미처리 우선 정렬 해석은 후속 확장 후보이며 현재 기본 계약은 아니다.

## 5.5 KPI exclusion 반환 규칙

- KPI 계산에서 아래는 제외한다.
  - auto-expired inquiry
  - `is_test=true` inquiry
- `chatbot_session` 자체는 inquiry KPI population에 포함되지 않는 별도 entity로 해석한다.
- exclusion rule summary는 `meta`에서 반환하는 것을 기본으로 한다.

## 5.6 degraded projection 반환 규칙

- linked snapshot 일부 누락 또는 stale 상태는 전체 목록 조회 실패 사유가 아니다.
- snapshot 기반 일부 summary field만 degraded 될 수 있다.
- degraded snapshot indicator는 operator가 해석할 수 있는 projection으로 반환한다.

## 5.7 zero-data 반환 규칙

- zero-data period는 정상 응답으로 처리한다.
- KPI 값은 아래 형식을 따른다.
  - inquiry count = `0`
  - average first response time = `-`
  - resolution rate = `-`

## 5.8 validation / rejection HTTP 규칙

- `400` validation error
- `403` forbidden

### 기본 해석
- 허용되지 않은 `period_preset`은 `400`으로 처리한다.
- `period_preset`이 생략되면 기본 preset 적용 여부는 local detail candidate로 남긴다.

## 5.9 list / summary 차이 규칙

- search API는 list projection 중심이다.
- KPI API는 summary projection 중심이다.
- 두 API 모두 동일한 period/timezone baseline을 공유한다.

## 6. Request / Response Shape

## 6.1 `GET /operator/inquiries`

### query 예시
- `customer_name`
- `order_number`
- `status`
- `inquiry_type`
- `product_name`
- `period_preset`
- `page`
- `size`

### response shape 예시
```json
{
  "data": [
    {
      "inquiry_id": "inq_123",
      "status": "IN_PROGRESS",
      "inquiry_type": "DELIVERY",
      "customer_name": "홍길동",
      "order_number": "ORD-1001",
      "product_name": "상품A",
      "last_message_at": "2026-04-06T10:20:00+09:00",
      "last_response_at": "2026-04-06T10:15:00+09:00",
      "has_linked_chatbot_session": true,
      "degraded_snapshot_state": null
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "total": 1,
    "period_preset": "last_7_days",
    "timezone": "Asia/Seoul"
  },
  "error": null
}
```

### 핵심 원칙
- inquiry list는 lightweight projection을 반환한다.
- customer/order/product snapshot 일부 누락은 `degraded_snapshot_state`로 해석 가능해야 한다.
- 이 문서는 기존 inquiry list resource를 대체하지 않고 search / period / degradation contract만 표준화한다.

## 6.2 `GET /operator/metrics/kpis`

### query 예시
- `period_preset`

### response shape 예시
```json
{
  "data": {
    "inquiry_count": 12,
    "average_first_response_time": "1시간 20분",
    "resolution_rate": "75%"
  },
  "meta": {
    "period_preset": "last_7_days",
    "timezone": "Asia/Seoul",
    "exclusions": [
      "auto_expired",
      "is_test"
    ]
  },
  "error": null
}
```

### zero-data response 예시
```json
{
  "data": {
    "inquiry_count": 0,
    "average_first_response_time": "-",
    "resolution_rate": "-"
  },
  "meta": {
    "period_preset": "today",
    "timezone": "Asia/Seoul",
    "exclusions": [
      "auto_expired",
      "is_test"
    ]
  },
  "error": null
}
```

### 핵심 원칙
- inquiry count는 period 내 `opened_at` 기준 생성된 inquiry 수다.
- average first response time은 시간/분 자동 변환 결과를 반환한다.
- average first response time은 첫 operator response가 실제 존재하는 inquiry만 계산에 포함한다.
- resolution rate는 `%` 형식으로 반환한다.
- resolution rate는 period 내 `closed_at` 기준 종료 건수 / 같은 period 내 `opened_at` 기준 생성 건수로 계산한다.
- zero-data period는 정상 summary 응답이다.

## 7. Validation / Rejection Case Detail

## 7.1 `400 Bad Request`

적용 예:

- 허용되지 않은 `period_preset`
- 잘못된 paging 값
- 잘못된 query parameter 형식

## 7.2 `403 Forbidden`

적용 예:

- operator role 없는 metrics/search 접근

## 7.3 degraded / zero-data는 전체 오류가 아님

- snapshot 일부 누락/stale은 partial degradation이다.
- KPI 0건 기간은 정상 응답이다.
- 응답이 없는 inquiry가 있어도 KPI summary 전체는 계속 계산 가능하다.

## 8. Projection Detail

## 8.1 Inquiry search projection

### 최소 필드
- `inquiry_id`
- `status`
- `inquiry_type`
- `customer_name`
- `order_number`
- `product_name`
- `last_message_at`
- `last_response_at`
- `has_linked_chatbot_session`
- `degraded_snapshot_state`

## 8.2 KPI summary projection

### 최소 필드
- `inquiry_count`
- `average_first_response_time`
- `resolution_rate`
- `period_preset`
- `timezone`
- exclusion rule summary

## 8.3 Filter preset projection

### 최소 필드
- `today`
- `last_7_days`
- `last_30_days`
- timezone=`Asia/Seoul`

## 8.4 Failure-tolerant read rule

- 일부 linked snapshot 누락은 전체 search projection 실패가 아니다.
- KPI 계산은 inquiry/time 기준으로 계속 가능하다.
- 검색 가능한 필드만으로 partial result를 반환할 수 있다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강할 local detail이다.

- explicit start/end custom range를 MVP 이후 추가할지 여부
- 미처리 우선 정렬을 별도 sort option으로 고정할지 여부
- `degraded_snapshot_state`를 단일 값으로 둘지 field별 indicator로 확장할지 여부
- KPI 설명 주석을 API에서 고정 문자열로 줄지 UI 전용 해석으로 둘지 여부
