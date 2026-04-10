# 핵심 도메인 모델

## 모델링 원칙

이 프로젝트는 support case를 중심으로 한다.

내부 구현에서는 여전히 `inquiry`라는 이름을 써도 되지만, 개념적으로는 고객 행동, 운영자 처리, 챗봇 이력, 커머스 맥락을 연결하는 중심 지원 케이스로 이해하면 된다.

## 핵심 엔티티

### `inquiry`

운영자가 처리하는 고객 지원 케이스를 나타낸다.

필수 필드:

- `id`
- `store_id`
- `local_user_account_id`
- `inquiry_type`
- `status`
- `linked_chatbot_session_id` (optional)
- `order_snapshot_id` (optional)
- `product_snapshot_id` (optional)
- `opened_at`
- `last_message_at`
- `last_response_at` (optional)
- `closed_at` (optional)

여기서 `local_user_account_id`는 문의를 소유하는 로컬 고객 계정 기준으로 본다.

### `store`

고객이 문의를 보낼 대상이 되는 스토어를 나타낸다.

필수 필드:

- `id`
- `name`
- `external_reference_id` (optional)
- `is_searchable`

### `local_user_account`

우리 서비스에서 로그인 가능한 로컬 고객 계정을 나타낸다.

필수 필드:

- `id`
- `login_id`
- `display_name`
- `role`
- `created_at`

고객과 운영자는 모두 `local_user_account`로 관리하고, 역할은 `role` 값으로 구분한다.

### `customer_snapshot`

외부 스토어 원천에서 가져온 고객 snapshot을 나타낸다.

필수 필드:

- `id`
- `store_id`
- `external_reference_id`
- `name`
- `email` (optional)
- `phone_hint` (optional)
- `created_at`

### `customer_account_link`

로컬 고객 계정과 외부 customer snapshot을 연결하는 claim/link 기록이다.

필수 필드:

- `id`
- `local_user_account_id`
- `customer_snapshot_id`
- `link_status`
- `linked_at` (optional)

### `customer_store_link`

고객이 이미 구매 이력 또는 연결 이력을 가진 스토어 목록을 구성하기 위한 관계다.

이 관계는 진짜 스토어 소유권을 의미하지 않는다.
고객 포털의 `내 스토어` 화면을 빠르게 구성하기 위한 파생 관계로 이해한다.

필수 필드:

- `id`
- `local_user_account_id`
- `store_id`
- `link_type`
- `created_at`

### `order_claim_request`

신규 가입 고객이 외부 주문을 자신의 계정과 연결하려고 시도한 기록이다.

필수 필드:

- `id`
- `local_user_account_id`
- `order_snapshot_id`
- `verification_method`
- `claim_status`
- `created_at`

이 엔티티는 주문 연결 시도 이력을 남기는 workflow 기록이다.
성공한 claim의 최종 결과는 `customer_account_link`와 `customer_store_link` 쪽에 반영하는 것을 기본으로 본다.

### `inquiry_message`

문의 안에서 고객 또는 운영자가 주고받는 메시지를 나타낸다.

필수 필드:

- `id`
- `inquiry_id`
- `sender_type`
- `content_raw`
- `content_display`
- `created_at`

### `internal_note`

문의에 연결되는 운영자 전용 메모를 나타낸다.

필수 필드:

- `id`
- `inquiry_id`
- `operator_id`
- `content`
- `created_at`

### `chatbot_session`

고객의 self-service 챗봇 세션을 나타낸다.

필수 필드:

- `id`
- `store_id`
- `local_user_account_id`
- `status`
- `linked_inquiry_id` (optional)
- `created_at`

### `chat_message`

챗봇 세션 안에서 고객 또는 챗봇이 주고받는 메시지를 나타낸다.

필수 필드:

- `id`
- `chatbot_session_id`
- `sender_type`
- `content_raw`
- `content_display`
- `created_at`

### `order_snapshot`, `product_snapshot`

이들은 지원 맥락을 보조하는 엔티티다.

이 프로젝트에서는 주로 문의 처리와 화면 표시를 돕는 용도로 사용한다.

시스템의 핵심 lifecycle을 직접 정의하지는 않는다.

### `faq_article`, `policy_document`, `response_preset`, `chatbot_knowledge_file`

이들은 챗봇 응답과 운영자 응답을 지원하는 지식 자산이다.

### `ai_summary`, `abuse_detection_result`

이들은 보조 결과물이다.

운영자가 케이스를 더 빨리 이해하도록 도와주지만, 운영자의 판단을 대체하지는 않는다.

## 핵심 관계

- 하나의 `local_user_account`는 여러 `inquiry`를 가질 수 있다.
- 하나의 `inquiry`는 여러 `inquiry_message`를 가질 수 있다.
- 하나의 `inquiry`는 여러 `internal_note`를 가질 수 있다.
- 하나의 `local_user_account`는 여러 `chatbot_session`을 가질 수 있다.
- 하나의 `chatbot_session`은 여러 `chat_message`를 가질 수 있다.
- 하나의 `chatbot_session`은 최대 하나의 `inquiry`와 연결될 수 있다.
- 하나의 `inquiry`는 선택적으로 하나의 `order_snapshot`, 하나의 `product_snapshot`과 연결될 수 있다.
- 하나의 `local_user_account`는 여러 `customer_store_link`를 통해 여러 `store`와 연결될 수 있다.
- 하나의 `local_user_account`는 여러 `customer_account_link`를 가질 수 있다.
- 하나의 `customer_snapshot`은 여러 `order_snapshot`과 연결될 수 있다.

운영자도 `local_user_account`를 사용하며, 내부 메모의 `operator_id` 역시 `local_user_account.id`를 참조한다.

## 주문 연결과 소유 확인 원칙

이 프로젝트는 주문 소유 확인을 주민등록번호 같은 민감 식별자로 처리하지 않는다.

대신 아래 원칙을 사용한다.

- 외부 customer/order는 먼저 snapshot으로 반영한다.
- 로컬 사용자는 가입 후 필요한 주문을 claim/link 한다.
- 기본적인 연결 후보는 주문번호, 이메일, 전화번호 힌트, 이름 등 낮은 민감도의 정보로 찾는다.
- 더 강한 확인이 필요할 경우에만 외부 verification provider를 가정한 mock verification 흐름을 사용할 수 있다.

claim가 완료되기 전에는 `inquiry.order_snapshot_id`를 비워둘 수 있다.
이 경우 주문 연결 시도 상태는 `order_claim_request`를 통해 별도로 보여준다.

## 상태 모델

간소화된 문의 상태 집합은 아래와 같다.

- `OPEN`
- `WAITING`
- `IN_PROGRESS`
- `ON_HOLD`
- `RESOLVED`

이 프로젝트는 기능적으로 동작하기 위해 이 상태 집합이면 충분하다.

더 세밀한 상태 의미는 여기서 의도적으로 생략한다.
