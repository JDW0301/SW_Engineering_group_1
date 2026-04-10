# 필수 DB - 공통 코어와 문의 영역

## 목적

이 문서는 프로젝트 전체가 공통으로 사용하는 최소 DB 구조와, 문의 중심 기능을 작동시키기 위한 필수 테이블을 정리한다.

가장 먼저 구현해야 하는 DB도 이 문서에 있는 테이블들이다.

## 이 문서가 담당하는 화면/기능

- 고객 로그인 이후 지원 영역 진입
- 운영자 로그인 이후 문의 목록/상세 진입
- 문의 생성
- 문의 목록 조회
- 문의 상세 조회
- 고객/운영자 메시지 송수신
- 첨부 업로드
- 운영자 내부 메모
- 문의 상태 변경

## 필수 테이블

### `local_user_account`

로그인 가능한 로컬 계정 테이블이다.

고객과 운영자를 분리된 계정 시스템으로 두지 않고, 하나의 테이블에서 `role`로 구분한다.

필수 필드:

- `id`
- `login_id`
- `display_name`
- `role`
- `created_at`

현재 specs 기준에서 이 테이블은 공통 인증 진입과 운영자/고객 구분의 최소 기준이다.

### `store`

고객이 문의를 보낼 대상 스토어다.

필수 필드:

- `id`
- `name`
- `external_reference_id` (optional)
- `is_searchable`

이 테이블은 고객의 스토어 선택, 스토어 검색, 문의 대상 지정에 필요하다.

### `inquiry`

프로젝트의 중심 지원 케이스다.

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

문의 흐름이 제품 중심이므로, 이 테이블이 실제 DB 설계의 중심축이 된다.

여기서 `local_user_account_id`는 문의를 소유하는 로컬 고객 계정을 뜻한다.
운영자 계정은 같은 `local_user_account` 테이블을 쓰더라도 이 컬럼에 들어가지 않는다.

### `inquiry_message`

문의 안에서 오가는 메시지다.

필수 필드:

- `id`
- `inquiry_id`
- `sender_type`
- `content_raw`
- `content_display`
- `created_at`

`sender_type`은 고객/운영자를 구분하는 최소 기준으로 사용한다.

### `message_attachment`

문의 메시지에 연결되는 이미지 첨부다.

필수 필드:

- `id`
- `inquiry_message_id`
- `file_name`
- `file_url` 또는 `storage_key`
- `mime_type`
- `created_at`

이 프로젝트에서는 이미지 첨부가 핵심 UX이므로, 파일 저장소 세부 구조를 복잡하게 만들지 않더라도 연결 메타데이터는 필요하다.

### `internal_note`

운영자만 보는 메모다.

필수 필드:

- `id`
- `inquiry_id`
- `operator_id`
- `content`
- `created_at`

운영자 앱에서 고객 메시지와 구분되는 내부 기록을 만들기 위해 필요하다.

## 필수 관계

- `inquiry.local_user_account_id -> local_user_account.id`
- `inquiry.store_id -> store.id`
- `inquiry.order_snapshot_id -> order_snapshot.id` (optional)
- `inquiry.product_snapshot_id -> product_snapshot.id` (optional)
- `inquiry.linked_chatbot_session_id -> chatbot_session.id` (optional, canonical)
- `inquiry_message.inquiry_id -> inquiry.id`
- `message_attachment.inquiry_message_id -> inquiry_message.id`
- `internal_note.inquiry_id -> inquiry.id`
- `internal_note.operator_id -> local_user_account.id`

## 현재 단계에서 굳이 분리하지 않는 것

- 고객/운영자별 별도 계정 프로필 테이블
- 읽음 상태 전용 테이블
- 메시지 수정 이력 테이블
- 메모 이력 테이블
- 문의 이벤트 로그 테이블

이 항목들은 나중에 필요해질 수 있지만, 현재 university-level 목표에서는 필수가 아니다.

## 구현 우선순위

이 문서의 테이블들은 전체 프로젝트에서 가장 먼저 만든다.

특히 아래 순서가 가장 안전하다.

1. `local_user_account`
2. `store`
3. `inquiry`
4. `inquiry_message`
5. `internal_note`
6. `message_attachment`
