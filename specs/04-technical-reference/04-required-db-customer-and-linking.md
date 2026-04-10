# 필수 DB - 고객 계정 연결, 스토어 연결, 주문 claim

## 목적

이 문서는 고객 앱에서 필요한 계정 연결 구조와, 외부 커머스 snapshot을 로컬 계정에 연결하기 위한 최소 DB를 정리한다.

핵심은 외부 customer/order 정보와 우리 서비스 계정을 같은 것으로 가정하지 않는 것이다.

여기서 `customer_snapshot`, `order_snapshot`, `product_snapshot`은 고객 전용 데이터가 아니라 고객과 운영자가 함께 재사용하는 공통 커머스 맥락 테이블이다.
이 문서에서는 claim/link 흐름과 직접 맞닿아 있기 때문에 함께 설명한다.

## 이 문서가 담당하는 화면/기능

- 고객 로그인 후 내 스토어 목록 표시
- 스토어 검색 후 새로운 스토어 문의 시작
- 외부 주문 claim 후보 조회
- 주문 claim 요청
- claim 상태 확인
- 필요 시 mock verification fallback

## 필수 테이블

### `customer_snapshot`

외부 스토어 쪽에서 들어온 고객 snapshot이다.

필수 필드:

- `id`
- `store_id`
- `external_reference_id`
- `name`
- `email` (optional)
- `phone_hint` (optional)
- `created_at`

이 테이블은 외부 원천 customer를 지원용으로 반영한 읽기 중심 구조다.

### `order_snapshot`

외부 주문 snapshot이다.

필수 필드:

- `id`
- `store_id`
- `customer_snapshot_id` (optional)
- `external_reference_id`
- `order_number`
- `order_status` (optional)
- `ordered_at` (optional)
- `created_at`

claim 전에는 로컬 계정과 직접 연결되지 않을 수 있으므로, snapshot으로 먼저 받아두는 구조가 중요하다.

### `product_snapshot`

외부 상품 snapshot이다.

필수 필드:

- `id`
- `store_id`
- `external_reference_id`
- `name`
- `sku` (optional)
- `created_at`

이 테이블은 문의 상세에서 상품 맥락을 보여주기 위한 최소 구조다.

### `customer_account_link`

로컬 고객 계정과 외부 customer snapshot의 연결 결과다.

필수 필드:

- `id`
- `local_user_account_id`
- `customer_snapshot_id`
- `link_status`
- `linked_at` (optional)

이 테이블이 있어야 외부 customer 기록과 우리 계정을 직접 동일시하지 않으면서도 연결 결과를 유지할 수 있다.

### `customer_store_link`

고객 포털의 `내 스토어` 목록을 빠르게 보여주기 위한 파생 관계다.

필수 필드:

- `id`
- `local_user_account_id`
- `store_id`
- `link_type`
- `created_at`

이 관계는 스토어 소유권을 뜻하지 않는다.
구매 이력 또는 연결 이력이 있는 스토어를 UI에 보여주기 위한 관계다.

### `order_claim_request`

신규 가입 고객이 외부 주문을 자신의 계정과 연결하려고 시도한 기록이다.

필수 필드:

- `id`
- `local_user_account_id`
- `order_snapshot_id`
- `verification_method`
- `claim_status`
- `created_at`

현재 specs에서 claim 요청 생성, claim 상태 확인, mock verification 보조 흐름을 유지하려면 이 테이블은 필수다.

### 축소 가능성 메모

팀이 claim 상태 화면 자체를 제거하고 즉시 연결형 흐름으로 바꾸는 경우에만 `order_claim_request`를 축소 후보로 검토한다.

## 필수 관계

- `customer_snapshot.store_id -> store.id`
- `order_snapshot.store_id -> store.id`
- `order_snapshot.customer_snapshot_id -> customer_snapshot.id` (optional)
- `product_snapshot.store_id -> store.id`
- `customer_account_link.local_user_account_id -> local_user_account.id`
- `customer_account_link.customer_snapshot_id -> customer_snapshot.id`
- `customer_store_link.local_user_account_id -> local_user_account.id`
- `customer_store_link.store_id -> store.id`
- `order_claim_request.local_user_account_id -> local_user_account.id`
- `order_claim_request.order_snapshot_id -> order_snapshot.id`

## mock verification과 DB 관계

현재 단계에서는 mock verification 전용 복잡한 테이블을 먼저 만들 필요는 없다.

기본적으로는 `order_claim_request.verification_method`와 `claim_status`로도 화면 흐름을 표현할 수 있다.

정말 필요해질 때만 아래 같은 테이블을 추가 검토한다.

- `mock_verification_session`
- `mock_verification_code_log`

하지만 현재 university-level scope에서는 필수로 보지 않는다.

## 현재 단계에서 굳이 만들지 않는 것

- 실제 통신사 연동 전용 테이블
- 복잡한 본인확인 감사 로그
- 주문 소유권 판정 규칙 이력 테이블
- 고객 프로필 확장 메타데이터 테이블

## 구현 우선순위

이 문서의 테이블들은 문의 기본 흐름이 붙은 뒤, 고객 스토어 목록과 claim/link를 붙이는 단계에서 만든다.

추천 순서는 아래와 같다.

1. `customer_snapshot`
2. `order_snapshot`
3. `product_snapshot`
4. `customer_account_link`
5. `customer_store_link`
6. `order_claim_request`
