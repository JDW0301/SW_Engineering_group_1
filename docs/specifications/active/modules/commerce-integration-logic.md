# Commerce Integration 로직 단위 상세 명세

## 1. 문서 목적

본 문서는 외부 시스템과 내부 운영 시스템 사이의 integration boundary를 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- external event 수신 규칙
- webhook 처리 흐름
- ACL(Anti-Corruption Layer) 번역 규칙
- snapshot upsert 규칙
- manual resync 규칙
- stale / missing snapshot 처리 기준

이 문서는 아래를 직접 소유하지 않는다.

- inquiry lifecycle
- operator response logic
- customer portal UI
- summary / abuse detection

## 2. Scope and Ownership

## 2.1 직접 소유하는 것

- external integration event 수신
- ACL translation
- snapshot 생성/갱신
- manual resync
- stale/missing snapshot 처리 기준

## 2.2 직접 소유하지 않는 것

- inquiry 상태 전이
- operator assignment
- customer-facing inquiry flow
- automation 결과 생성

## 3. Core Models

## 3.1 `customer` snapshot

- 외부 customer truth를 내부 운영용으로 축소/번역한 snapshot

### 핵심 해석
- 내부 원본이 아님
- `external_reference_id`를 가진다.
- inquiry context에서 customer 맥락 제공 용도

## 3.2 `order` snapshot

- 외부 order truth를 내부 운영용으로 번역한 snapshot

### 핵심 해석
- `external_reference_id` 기반 매핑
- internal authoritative order 모델이 아님

## 3.3 `product` snapshot

- 외부 product truth를 내부 운영용으로 축소한 snapshot

### 핵심 해석
- inquiry context 보조 정보
- inquiry 존재 조건은 아님

## 3.4 Integration event log

- 외부 이벤트 수신/처리 상태를 기록하는 운영 로그

### 핵심 해석
- domain event가 아니라 integration processing trace
- 중복 이벤트 / 실패 / 재처리 추적용

## 3.5 External reference mapping

- 외부 식별자와 내부 snapshot/entity 연결 정보

### 핵심 해석
- `external_reference_id`가 중심축
- 외부 추적성을 유지하는 기준

## 3.6 모델 해석 원칙

- `customer`, `order`, `product`는 내부 원본이 아니라 snapshot이다.
- snapshot 누락은 inquiry 자체를 무효화하지 않는다.
- integration event log는 운영 추적용이며 inquiry lifecycle authority와 분리된다.
- ACL은 단순 field rename이 아니라 의미 번역 계층이다.

## 4. Commands / Actions

## 4.1 `ReceiveExternalWebhook`

### 의미
- 외부 시스템에서 웹훅 이벤트를 수신한다.

### 입력
- raw webhook payload
- event metadata
- external entity reference

### 결과
- 기본 검증 단계 진입

## 4.2 `ValidateExternalPayload`

### 의미
- payload 형식과 필수 메타데이터를 검증한다.

### 현재 기준
- authenticity validation은 생략
- 필수 필드 / 형식 검증은 수행

## 4.3 `TranslateExternalPayload`

### 의미
- 외부 payload를 내부 canonical snapshot 구조로 변환한다.

### 결과
- ACL 번역 결과 생성
- 내부 enum / field 구조 정규화

## 4.4 `UpsertCustomerSnapshot`

### 의미
- customer snapshot 생성 또는 갱신

## 4.5 `UpsertOrderSnapshot`

### 의미
- order snapshot 생성 또는 갱신

## 4.6 `UpsertProductSnapshot`

### 의미
- product snapshot 생성 또는 갱신

## 4.7 `ManualResyncEntity`

### 의미
- operator가 특정 entity를 외부 원본으로부터 다시 가져오도록 요청한다.

### 대상
- `customer`
- `order`
- `product`

## 4.8 `MarkIntegrationFailure`

### 의미
- webhook 처리 실패 또는 resync 실패를 운영 로그에 기록한다.

## 5. Webhook / ACL / Snapshot Rules

## 5.1 Webhook-first rule

- 외부 데이터 반영의 기본 메커니즘은 `webhook event`다.
- polling 중심 구조는 현재 MVP 범위에 두지 않는다.

## 5.2 Webhook validation posture

- 학교 프로젝트 MVP 기준으로 webhook authenticity validation은 생략한다.
- 대신 아래는 검증한다.
  - 필수 메타데이터 존재 여부
  - 허용 event type 여부
  - payload 형식

## 5.3 Duplicate event rule

- 동일 외부 이벤트는 중복 수신될 수 있다고 가정한다.
- 이미 성공 처리된 동일 이벤트는 idempotent no-op 또는 skip 처리한다.

## 5.4 Retry rule

- 일시 실패 시 최대 3회 재시도
- 간격은 1분 / 1분 / 1분
- 복잡한 backoff 정책은 MVP 범위 밖

## 5.5 ACL translation rule

- 외부 payload를 그대로 내부 도메인 모델에 저장하지 않는다.
- ACL은 아래를 수행한다.
  - field name 번역
  - 의미 번역
  - `external_reference_id` 매핑
  - 민감정보 최소 반영
  - 내부 enum/상태값 번역

## 5.6 Snapshot upsert rule

- `customer`, `order`, `product` snapshot은 upsert 방식으로 반영한다.
- 존재하면 갱신, 없으면 생성

## 5.7 Snapshot authority rule

- snapshot의 최종 기준은 외부 원본이다.
- manual resync도 외부 truth를 다시 읽어오는 동작이다.

## 5.8 Missing snapshot rule

- snapshot이 없거나 stale해도 inquiry 흐름은 계속 가능해야 한다.
- operator UI는 degraded context를 표시할 수 있어야 한다.

## 5.9 Delete handling status

- 외부 delete event 처리 방식은 아직 fully fixed되지 않았다.
- 현재 방향은 물리 삭제보다 비활성 반영 우선이다.

## 5.10 Manual resync rule

- operator는 entity 단위로만 manual resync 가능
- 대상:
  - `customer`
  - `order`
  - `product`
- store-wide resync는 MVP 범위 제외

## 5.11 Resync repetition rule

- manual resync는 반복 실행 가능해야 한다.

## 5.12 Inquiry boundary rule

- integration 계층은 inquiry를 직접 수정하지 않는다.
- inquiry lifecycle은 Case Management 소유다.

## 6. Application Flows

## 6.1 Receive webhook flow

1. raw webhook payload 수신
2. 필수 메타데이터 추출
3. 허용 event type 확인
4. 형식 검증 수행
5. 유효하면 processing 단계로 이동

## 6.2 Translate webhook payload flow

1. 외부 event type 확인
2. 외부 payload를 ACL로 전달
3. 내부 canonical field로 변환
4. `external_reference_id` 확보
5. 내부 enum/상태값 번역
6. 민감정보 최소화 반영

## 6.3 Upsert snapshot flow

1. translated payload 수신
2. target entity 종류 결정
3. 동일 `external_reference_id` 존재 여부 확인
4. 존재하면 update
5. 없으면 create
6. snapshot 저장
7. integration event log 업데이트

## 6.4 Duplicate event handling flow

1. 수신 이벤트 식별자 확인
2. 이미 처리된 동일 이벤트인지 검사
3. 중복이면 skip 또는 idempotent no-op 처리
4. 새 이벤트면 정상 처리 계속

## 6.5 Retry flow

1. webhook 처리 실패
2. 일시 오류 여부 판별
3. 일시 오류면 재시도 예약
4. 최대 3회까지 재시도
5. 간격은 1분 / 1분 / 1분
6. 최종 실패 시 integration failure 기록

## 6.6 Manual resync flow

1. operator가 특정 entity 선택
2. resync 요청
3. 외부 원본에서 최신 데이터 재조회
4. ACL 번역 수행
5. snapshot upsert
6. 결과를 operator에게 성공/실패로 표시
7. 감사/운영 로그 기록

## 6.7 Stale / missing snapshot recovery flow

1. inquiry detail 또는 operator view에서 stale/missing snapshot 발견
2. degraded context 표시
3. 필요 시 manual resync 진입점 제공
4. resync 성공 시 최신 snapshot으로 교체
5. read model 재조립 가능

## 7. Failure and Rejection Cases

## 7.1 Invalid payload

- 필수 필드 누락
- payload 형식 불일치
- entity 식별자 없음
- 처리: 반영 중단 + failure log 기록

## 7.2 Unsupported event type

- 현재 MVP에서 허용하지 않는 event type 수신
- 처리: ignored 또는 skip

## 7.3 Translation failure

- ACL 번역 실패
- enum 매핑 실패
- external_reference 해석 실패
- 처리: 반영 중단 + integration failure 기록

## 7.4 Duplicate event

- 이미 처리된 동일 external event 재수신
- 처리: idempotent no-op 또는 skip

## 7.5 Retry exhaustion

- 3회 재시도 후에도 실패
- 처리: final failure 상태 기록

## 7.6 Manual resync failure

- 외부 조회 실패
- translation 실패
- snapshot 저장 실패
- 처리: 기존 snapshot 유지 + 단순 실패 안내

## 7.7 Missing snapshot

- linked snapshot 없음
- 처리: degraded context + inquiry는 계속 유효

## 7.8 Stale snapshot

- stale snapshot 존재
- 처리: `최신화 필요` + resync 진입점 가능

## 7.9 Delete-event ambiguity

- delete event 처리 방식은 local unresolved
- 현재 방향은 비활성 반영 우선

## 8. Read Model / Operator-facing Outputs

## 8.1 Snapshot freshness projection

### 포함 요소
- snapshot 존재 여부
- freshness 상태
  - 정상
  - `최신화 필요`
  - `미연결`
  - `조회 실패`
- 마지막 동기화 시각

## 8.2 Resync availability projection

### 포함 요소
- resync 가능 여부
- 대상 entity 종류
- operator action 진입점

## 8.3 Integration failure projection

### 포함 요소
- 최근 실패 여부
- 실패 유형
- 재시도 소진 여부
- manual resync 필요 여부

## 8.4 Linked snapshot projection for Case Management

### 포함 요소
- customer snapshot summary
- order snapshot summary
- product snapshot summary
- linkage 존재 여부
- freshness/degraded 상태

## 8.5 Failure-tolerant read rule

- snapshot 일부 누락은 전체 inquiry context 실패가 아님
- 일부 linked data만 degraded 처리
- operator는 inquiry를 계속 처리 가능

## 8.6 Operator-facing degraded state rule

### 표현 방향
- `미연결`
- `최신화 필요`
- `조회 실패`

### 의미 차이
- `미연결`: reference 없음
- `최신화 필요`: reference는 있으나 stale
- `조회 실패`: 조회 시도 자체 실패

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강할 local detail이다.

- delete event 실제 반영 방식
- integration failure log retention 기간
- resync 결과 상세 메시지 wording
- stale 판단 기준의 세부 시간값
