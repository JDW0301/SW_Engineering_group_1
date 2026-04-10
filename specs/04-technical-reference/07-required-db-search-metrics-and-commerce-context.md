# 필수 DB 기준 - 검색, 지표, 커머스 맥락

## 목적

이 문서는 운영자 검색, 기본 지표, 그리고 문의 상세에 표시되는 커머스 맥락을 만들기 위해 필요한 최소 DB 기준을 정리한다.

핵심은 이 영역이 새 대규모 DB를 많이 요구하는 것이 아니라, 기존 문의/스냅샷 테이블을 잘 활용하는 쪽에 가깝다는 점이다.

이 문서는 커머스 맥락 화면에서 재사용되는 기준을 설명한다.
`customer_snapshot`, `order_snapshot`, `product_snapshot`, `customer_account_link`의 정의와 기본 책임은 `04-required-db-customer-and-linking.md`에서 먼저 본다.

## 이 문서가 담당하는 화면/기능

- 문의 검색
- KPI 요약 조회
- 고객 snapshot 조회
- 주문 snapshot 조회
- 상품 snapshot 조회
- 수동 재동기화

## 필수 테이블

### 검색 영역

현재 specs 기준에서는 검색 전용 테이블이 필수는 아니다.

아래 기존 테이블 조합으로도 충분히 검색 기능을 만들 수 있다.

- `inquiry`
- `inquiry_message`
- `store`
- `customer_snapshot`
- `order_snapshot`
- `product_snapshot`

운영자는 고객명, 주문번호, 상품명, 상태, 유형, 기간으로 검색하므로, 우선은 일반 DB 조회와 인덱스 수준으로 시작하는 것이 맞다.

### 지표 영역

현재 specs 기준에서는 KPI 집계 전용 테이블도 필수는 아니다.

아래 기존 데이터로 계산 가능하다.

- 문의 수: `inquiry`
- 평균 첫 응답 시간: `inquiry.opened_at`, `inquiry.last_response_at` 또는 첫 운영자 메시지 시각
- 해결 완료율: `inquiry.status`, `closed_at`

즉, `metrics_daily_snapshot` 같은 집계 테이블은 나중 최적화 대상이지 현재 필수는 아니다.

### 커머스 맥락 영역

커머스 맥락은 별도 복잡한 운영 테이블보다 snapshot 테이블이 핵심이다.

필수 테이블:

- `customer_snapshot`
- `order_snapshot`
- `product_snapshot`
- `customer_account_link`
- 필요 시 `customer_store_link`

이들은 이미 고객/연결 문서에서 정의되며, 검색/지표/문의 상세에서도 그대로 재사용된다.

## 수동 재동기화에 대한 기준

현재 단계에서는 수동 재동기화 요청 전용 DB 테이블도 필수로 보지 않는다.

데모 수준에서는 아래 중 하나로 충분하다.

- 버튼 클릭 시 즉시 재조회
- 서버 액션 호출 후 바로 snapshot 갱신

정말 필요할 때만 아래 같은 구조를 검토한다.

- `commerce_sync_job`
- `commerce_sync_result`

하지만 지금은 필수 DB가 아니다.

## 현재 단계에서 굳이 만들지 않는 것

- 전문 검색 인덱스 테이블
- KPI 배치 집계 테이블
- 연동 실패 재시도 큐 테이블
- 상세 sync 이벤트 로그 테이블

이 항목들은 성능과 운영성 개선용이지, 대학 프로젝트 핵심 동작을 위해 반드시 필요한 것은 아니다.

## 구현 우선순위

이 영역은 프로젝트 마지막 단계에서 붙인다.

우선은 기존 테이블만으로 화면과 기능을 동작시키고, 성능 문제가 실제로 생길 때만 보조 테이블을 검토한다.
