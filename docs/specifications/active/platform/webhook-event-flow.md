# 웹훅 이벤트 반영 흐름 명세

## 1. 목적

본 문서는 외부 시스템에서 들어오는 웹훅 이벤트를 어떤 방식으로 수신, 검증, 번역, snapshot 반영, 재처리하는지 정의한다.

## 2. 범위

MVP에서 웹훅으로 반영하는 대상은 아래 세 가지 snapshot 엔티티다.

- `customer`
- `order`
- `product`

문의(`inquiry`)와 챗봇 세션(`chatbot_session`)은 본 시스템 원본이므로 웹훅 반영 대상이 아니다.

## 3. 기본 원칙

### 3.1 원본 관계

- 외부 시스템은 `customer`, `order`, `product`의 source of truth다.
- 본 시스템은 운영용 snapshot만 유지한다.
- snapshot은 운영자 화면과 문의 맥락 조회를 위한 데이터이며, 외부 원본을 대체하지 않는다.

### 3.2 반영 방식

- 기본 반영 메커니즘은 `webhook event`다.
- 운영자는 필요 시 `customer`, `order`, `product` 개체 단위로 수동 재동기화를 실행할 수 있다.
- 전체 스토어 단위 재동기화는 MVP 범위에서 제외한다.

### 3.3 ACL 원칙

- 외부 이벤트 payload를 내부 엔티티에 그대로 저장하지 않는다.
- `Commerce Integration Context`에서 ACL(Anti-Corruption Layer)을 통해 내부 snapshot 모델로 번역한다.
- 민감정보는 최소 반영 원칙을 따른다.

## 4. MVP 웹훅 이벤트 집합

MVP에서 처리하는 integration event 후보는 아래와 같다.

- `ExternalCustomerUpdatedReceived`
- `ExternalOrderCreatedReceived`
- `ExternalOrderStatusChangedReceived`
- `ExternalProductUpdatedReceived`

이벤트 이름은 내부 처리용 canonical event 명으로 사용하며, 외부 시스템 원문 이벤트 이름은 별도 매핑 테이블로 관리할 수 있다.

## 5. 웹훅 처리 흐름

```text
외부 시스템
 -> 웹훅 수신
 -> 기본 검증
 -> 중복/재처리 검사
 -> ACL 번역
 -> snapshot upsert
 -> 처리 로그 기록
 -> 운영 화면 반영
```

## 6. 단계별 처리 규칙

## 6.1 웹훅 수신

- 외부 시스템은 이벤트 payload를 웹훅 엔드포인트로 전송한다.
- 수신 시 아래 최소 메타데이터를 확보해야 한다.
  - 외부 이벤트 식별자
  - 이벤트 유형
  - 발생 시각
  - 원본 엔티티 식별자

학교 프로젝트 MVP 기준으로 웹훅 진위 검증은 생략한다.
실서비스 전환 시 서명 검증 또는 최소 인증 헤더 검증이 필요하다.

## 6.2 기본 검증

- 필수 메타데이터 누락 여부를 검증한다.
- 허용되지 않은 이벤트 유형은 처리하지 않는다.
- 형식 오류 payload는 snapshot 반영 전에 중단한다.

사용자 노출은 단순 오류 체계를 따르며, 외부 연동 실패는 운영자에게만 안내 대상이 된다.

## 6.3 중복 및 재처리 검사

- 동일 외부 이벤트는 중복 수신될 수 있다고 가정한다.
- 외부 이벤트 식별자 또는 외부 엔티티 기준 조합을 사용해 idempotent하게 처리한다.
- 이미 성공 처리된 동일 이벤트는 snapshot을 다시 손상시키지 않아야 한다.

## 6.4 ACL 번역

- 외부 payload는 `Commerce Integration Context`에서 내부 snapshot 구조로 변환한다.
- 번역 과정에서 아래를 수행한다.
  - 외부 필드명 -> 내부 canonical 필드명 매핑
  - 과도한 민감정보 제거 또는 마스킹
  - `external_reference_id` 매핑
  - 내부 enum/상태값 번역

## 6.5 snapshot upsert

- 내부 snapshot은 upsert 방식으로 반영한다.
- 엔티티별 반영 규칙은 아래를 따른다.
  - `customer`: 고객 snapshot 갱신
  - `order`: 주문 snapshot 생성 또는 상태 갱신
  - `product`: 상품 snapshot 생성 또는 갱신

삭제 이벤트의 처리 방식은 **추가 정의 필요**하다. MVP에서는 비활성 상태 반영을 우선 고려한다.

## 6.6 처리 로그 기록

- 웹훅 수신 결과는 아래 상태 중 하나로 기록할 수 있어야 한다.
  - `RECEIVED`
  - `IGNORED`
  - `FAILED`
  - `APPLIED`
- 실패 원인은 내부 로그에 남긴다.

## 7. 수동 재동기화 흐름

## 7.1 대상 범위

- 운영자는 아래 개체 단위로 수동 재동기화를 수행할 수 있다.
  - `customer`
  - `order`
  - `product`

## 7.2 실행 방식

- 운영자가 특정 개체를 선택해 재동기화를 요청한다.
- 시스템은 외부 원본에서 최신 데이터를 다시 조회한다.
- 조회 결과를 ACL로 번역한 뒤 동일 snapshot upsert 규칙으로 반영한다.

## 7.3 규칙

- 수동 재동기화도 반복 실행 가능해야 한다.
- 수동 재동기화 결과는 감사/운영 로그에 남겨야 한다.
- 수동 재동기화는 웹훅 누락 또는 지연을 보완하는 복구 수단이다.

## 8. 실패 처리 원칙

## 8.1 웹훅 지연

- 외부 이벤트가 늦게 도착해도 snapshot은 최종적으로 외부 원본 기준으로 수렴해야 한다.
- 운영자는 필요 시 수동 재동기화를 사용할 수 있다.

## 8.2 형식 오류 또는 번역 실패

- 잘못된 payload는 반영하지 않는다.
- 실패 로그를 남기고 재처리 가능 여부를 기록한다.

## 8.3 일시 오류

- 일시 오류는 재시도 가능 상태로 구분한다.
- 일시 오류는 최초 실패 이후 최대 3회 재시도한다.
- 재시도 간격의 상세 정책은 **추가 정의 필요**하다.

## 8.4 누락 데이터

- 주문 또는 상품 snapshot이 아직 반영되지 않았더라도 문의 열람은 가능해야 한다.
- 운영 화면에는 "미연결" 또는 "최신화 필요" 상태를 표시할 수 있어야 한다.

## 9. 운영자 화면 연계

- 문의 상세 화면에서 연결된 고객/주문/상품 snapshot이 오래되었거나 누락된 경우 수동 재동기화 진입점을 제공할 수 있다.
- 운영자는 고객/주문/상품 단위 관리 화면에서도 재동기화를 실행할 수 있다.
- 수동 재동기화 결과는 운영자에게 단순 성공/실패 메시지로 안내한다.

## 10. 모듈 책임

- `webhook_receiver`: 웹훅 수신 및 기본 검증
- `integration_event_log_service`: 이벤트 수신/처리 로그 기록
- `acl_mapping_service`: 외부 payload를 내부 snapshot 모델로 번역
- `snapshot_sync_service`: snapshot upsert 처리
- `manual_resync_service`: 운영자 수동 재동기화 실행

## 11. 추가 정의 필요 사항

- 삭제 이벤트 처리 방식
- 재시도 간격 정책
- 이벤트 로그 보관 기간
- 외부 원문 이벤트명과 내부 canonical event 매핑표
