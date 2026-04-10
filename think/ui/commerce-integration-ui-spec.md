# Commerce Integration UI 상세 명세

## 1. 문서 목적

본 문서는 `Commerce Integration` 로직이 operator 화면에서 어떤 화면 구조, 정보 배치, 상호작용 방식으로 표현되는지 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- inquiry 상세에서 연결된 customer/order/product snapshot 표시 방식
- snapshot freshness / degraded 상태 표시 방식
- entity 단위 manual resync 진입점과 피드백 방식
- operator용 snapshot 조회 화면 구조
- integration event log 조회 화면 구조

이 문서는 아래를 직접 다루지 않는다.

- webhook intake endpoint 자체의 구현 방식
- inquiry 상태 전이 상세
- customer-facing portal 화면
- ACL 내부 번역 로직 구현 상세
- DB 테이블 구조 자체

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- operator app에서 snapshot context를 보여주는 화면 구조
- degraded snapshot 상태의 시각적 구분
- entity-scoped manual resync action 위치와 피드백
- integration event processing trace 조회 화면
- missing / stale / failure 상태를 operator가 해석하는 UX 규칙

## 2.2 직접 다루지 않는 것

- inquiry detail 전체 레이아웃 authority 자체
- customer/order/product snapshot 생성/갱신 로직
- webhook validation / retry 내부 처리 로직
- customer-facing conversation 또는 self-service UX
- store-wide integration 운영 화면

## 3. Screen Set

## 3.1 Inquiry detail linked snapshot region

### 역할
- inquiry 맥락에서 연결된 external snapshot 요약과 freshness 상태를 operator에게 보여준다.

### 핵심 목적
- inquiry를 처리하는 도중에도 customer/order/product external context를 빠르게 해석할 수 있게 한다.
- snapshot 누락 또는 stale 상태여도 inquiry 처리 자체는 계속 가능하다는 점을 화면에서 분명히 한다.

### Screen 구조 해석
- 독립 페이지라기보다 inquiry detail 안의 operator 전용 region이다.
- linked snapshot이 일부만 존재해도 전체 inquiry detail은 유지하고, snapshot 영역만 degraded로 표시한다.

## 3.2 Snapshot detail and recovery screen

### 역할
- 특정 `customer`, `order`, `product` snapshot의 현재 상태와 마지막 동기화 결과를 operator가 상세 조회한다.

### 핵심 목적
- 외부 snapshot을 authoritative data가 아닌 operational view로 이해하게 한다.
- stale / missing / failure 상황에서 manual resync recovery action으로 자연스럽게 이어지게 한다.

### Screen 구조 해석
- entity type별 상세 화면이지만 공통 정보 구조를 최대한 공유한다.
- customer/order/product는 summary field만 다르고 freshness / resync / error 해석 패턴은 동일하게 유지한다.

## 3.3 Integration event log screen

### 역할
- webhook 처리 상태와 재시도/실패 내역을 operator가 조회한다.

### 핵심 목적
- integration failure를 inquiry lifecycle 문제와 분리해서 해석하게 한다.
- duplicate / ignored / failed / applied 상태를 운영 관점에서 추적 가능하게 한다.

### Screen 구조 해석
- 운영자용 관찰 화면이다.
- customer-facing 화면으로 공유하지 않는다.

## 4. Layout Regions

## 4.1 Inquiry detail linked snapshot region

### A. Linked snapshot summary strip

포함 요소:
- `Customer snapshot` 요약 카드
- `Order snapshot` 요약 카드
- `Product snapshot` 요약 카드
- 각 카드의 `last_synced_at`
- 각 카드의 freshness badge

핵심 안내:
- entity-specific summary field만 간단히 노출한다.
- 예:
  - customer: `display_name`, `masked_contact`
  - order: `order_number`, `order_status`
  - product: `product_name`

### B. Degraded state notice area

포함 요소:
- `미연결`
- `최신화 필요`
- `조회 실패`
- 간단한 설명 문구
- 조건부 manual resync action

핵심 안내:
- degraded 상태는 snapshot 카드 근처에 표시한다.
- 전체 inquiry detail을 에러 화면으로 전환하지 않는다.
- 일부 snapshot만 degraded여도 정상 snapshot 카드는 계속 표시한다.
- `미연결`은 기본적으로 linked reference가 없는 상태를 뜻한다.
- linked reference가 없으면 degraded notice만 표시하고, resync action을 기본 전제로 두지 않는다.
- linked reference는 있으나 snapshot이 아직 없거나 복구가 필요한 경우에만 entity-scoped resync action을 제공할 수 있다.

### C. Snapshot action area

포함 요소:
- snapshot detail 이동 action
- entity 단위 resync button
- 최근 resync 결과 feedback

기본 범위:
- manual resync는 `customer`, `order`, `product` 각각 개별 action으로 제공한다.
- manual resync는 대상 entity의 `external_reference_id`가 해석 가능한 경우에만 노출한다.
- store-wide resync action은 두지 않는다.

## 4.2 Snapshot detail and recovery screen

### A. Snapshot summary header

포함 요소:
- entity type badge
- `external_reference_id`
- entity-specific summary field
- `last_synced_at`
- freshness / degraded badge

핵심 안내:
- 외부 truth의 운영용 snapshot이라는 설명을 header 근처에 둔다.
- raw external payload는 기본 화면에 노출하지 않는다.
- DB persistence enum을 그대로 노출하기보다 operator-facing freshness / degraded 의미를 우선 표시한다.

### B. Snapshot content panel

포함 요소:
- canonical field 기준 상세 정보
- masked customer field
- linkage 정보
- 상태 설명 문구

핵심 안내:
- 외부 payload 원문 대신 ACL 번역 결과 기준의 canonical field만 보여준다.
- 민감정보는 최소 반영/마스킹 상태를 유지한다.

### C. Recovery panel

포함 요소:
- manual resync button
- 최근 resync request 시각
- 최근 resync 결과 상태
- 실패 시 간단한 failure reason

핵심 안내:
- recovery panel은 stale/missing/failure 상태일 때 더 눈에 띄게 보여준다.
- 정상 상태에서도 resync 진입점은 유지할 수 있다.

### D. Snapshot linkage panel

포함 요소:
- linked inquiry context 여부
- linked customer/order/product relation 요약
- 관련 operator workflow 이동 action

핵심 안내:
- snapshot은 inquiry를 직접 소유하지 않으므로 linked workflow는 이동 링크 수준으로만 제공한다.
- 이 linkage 정보는 Commerce Integration 단독 authority가 아니라 관련 operator workflow projection에 의존할 수 있다.

## 4.3 Integration event log screen

### A. Filter bar

포함 요소:
- `canonical_event_type` filter
- `processing_status` filter
- page / size control

입력 제약 포인트:
- 허용되지 않은 filter 조합은 빈 결과 또는 단순 validation 오류로 처리한다.
- 복잡한 검색 DSL은 MVP 범위 밖이다.

### B. Event log list

포함 요소:
- `external_event_id`
- `canonical_event_type`
- `processing_status`
- `received_at`
- `retry_count`

핵심 안내:
- `RECEIVED`, `IGNORED`, `FAILED`, `APPLIED`를 시각적으로 구분한다.
- failed row는 failure detail 진입점을 제공한다.
- `source_entity_type`, `source_entity_reference_id` 같은 상세 식별 정보는 detail panel 중심 노출을 기본으로 한다.

### C. Event log detail panel

포함 요소:
- `failure_reason`
- `external_occurred_at`
- `processed_at`
- retryable 여부
- 관련 snapshot 또는 entity 이동 action

핵심 안내:
- domain event 설명이 아니라 processing trace라는 점을 명시한다.
- customer-facing 데이터와 혼동되지 않도록 운영 로그 톤을 유지한다.
- raw webhook payload/body는 기본 detail UI에 노출하지 않는다.

## 5. UI State and Interaction Rules

## 5.1 Loading state

- inquiry detail 본문은 유지하고 linked snapshot region만 skeleton 또는 loading indicator를 표시할 수 있다.
- snapshot detail screen은 header와 content panel에 단계적 loading을 허용한다.
- event log filter 변경 시 list 영역만 부분 loading 처리할 수 있다.

## 5.2 Empty state

- linked snapshot이 전혀 없으면 `미연결` 안내를 보여준다.
- linked reference가 해석 가능한 경우에만 entity별 resync 가능 여부를 함께 보여준다.
- integration event log 결과가 없으면 `수신된 연동 이벤트가 없습니다.` 같은 단순 문구를 사용한다.

## 5.3 Success state

- snapshot이 최신이면 마지막 동기화 시각과 핵심 summary field를 안정적으로 보여준다.
- resync 요청 성공 시 `재동기화 요청이 접수되었습니다.` 같은 단순 성공 메시지를 사용한다.

## 5.4 Validation error state

- 잘못된 entity reference 또는 허용되지 않은 resync target 형식은 action 근처에 짧은 오류 메시지로 표시한다.
- event log filter 입력 오류는 filter bar 근처에 표시한다.

## 5.5 Forbidden / Not Found state

- operator app 내부에서 권한이 부족한 경우에는 integration region을 접근 불가 메시지로 대체할 수 있다.
- 비권한 사용자에게 리소스 존재 여부를 과도하게 노출하는 방식은 피한다.
- 존재하지 않는 snapshot reference는 해당 detail screen에서 not found를 표시하되 inquiry detail 전체를 실패 화면으로 바꾸지 않는다.
- 존재하지 않는 integration event는 event detail panel에서 not found 처리한다.

## 5.6 Degraded snapshot state

- `미연결`: linked reference 자체가 없는 상태로 표시한다.
- `최신화 필요`: snapshot은 있으나 stale한 상태로 표시한다.
- `조회 실패`: 최근 동기화 또는 조회 시도가 실패한 상태로 표시한다.
- linked reference는 있으나 snapshot이 아직 준비되지 않았거나 복구가 필요한 경우에도 기존 degraded 라벨 체계를 유지하고, 필요한 설명은 보조 문구로만 덧붙인다.
- degraded state는 badge + 짧은 설명 + recovery action 조합으로 보여준다.

## 5.7 Resync pending / result state

- resync 직후에는 `요청됨` 또는 진행 중에 가까운 상태 피드백을 표시한다.
- 기존 snapshot이 있으면 resync 실패 시에도 마지막 정상 snapshot을 계속 보여준다.
- resync 실패는 전체 화면 차단보다 panel-level feedback으로 표현한다.

## 5.8 Integration event processing state

- `RECEIVED`: 수신 완료, 후속 처리 대기/진행 상태
- `IGNORED`: 지원하지 않거나 처리 대상이 아닌 이벤트로 표시
- `FAILED`: 실패 원인 확인 가능 상태
- `APPLIED`: snapshot 반영 완료 상태
- event log는 per-attempt history 전체보다 현재 processing trace와 `retry_count` 중심으로 보여준다.

## 5.9 Interaction principles

- snapshot 일부 누락은 전체 inquiry context 실패로 해석하지 않는다.
- manual resync는 항상 entity-scoped action으로 유지한다.
- raw external payload는 기본 UI surface에 올리지 않는다.
- customer-facing support flow에는 integration event log를 노출하지 않는다.

## 6. Component Responsibilities

## 6.1 `LinkedSnapshotCards`

- inquiry detail에서 customer/order/product snapshot 요약 카드를 렌더링한다.
- 각 카드의 freshness badge와 `last_synced_at`를 보여준다.
- 존재하지 않는 entity는 빈 카드 대신 degraded card 또는 안내 block으로 처리한다.

## 6.2 `SnapshotDegradedNotice`

- `미연결`, `최신화 필요`, `조회 실패` 상태를 공통 패턴으로 표시한다.
- 상태별 설명 문구와 resync action을 함께 묶는다.

## 6.3 `SnapshotDetailHeader`

- entity type, `external_reference_id`, 대표 summary field, 최신화 시각을 보여준다.
- 운영용 snapshot이라는 맥락 설명을 제공한다.

## 6.4 `SnapshotContentPanel`

- canonical field 기준 상세 정보를 보여준다.
- customer 관련 민감정보는 마스킹 상태로 유지한다.

## 6.5 `ManualResyncAction`

- entity 단위 resync action을 실행한다.
- 요청 직후 성공/실패/요청됨 피드백을 표시한다.
- 동일 action을 inquiry detail과 snapshot detail 양쪽에서 재사용할 수 있다.

## 6.6 `IntegrationEventLogTable`

- integration event row 목록을 렌더링한다.
- status별 시각 구분과 detail 진입을 담당한다.

## 6.7 `IntegrationEventDetailPanel`

- 선택된 event의 failure reason, retry 정보, source entity reference를 보여준다.
- processing trace라는 성격을 분명히 유지한다.

## 7. Action Flows

## 7.1 Inquiry detail에서 stale snapshot 확인 흐름

1. operator가 inquiry detail을 연다.
2. linked snapshot region이 customer/order/product summary를 표시한다.
3. 특정 snapshot이 stale이면 `최신화 필요` badge와 설명 문구를 보여준다.
4. operator는 필요 시 해당 entity의 resync action을 누른다.
5. 요청 결과를 region 근처에 단순 feedback으로 표시한다.

## 7.2 Missing snapshot recovery 흐름

1. inquiry detail 또는 snapshot detail에서 linked reference는 있으나 snapshot이 없거나 복구가 필요한 상태를 본다.
2. operator는 entity별 resync action을 선택한다.
3. 시스템은 resync 요청 접수 결과를 보여준다.
4. 성공적으로 snapshot이 생성되면 summary card 또는 detail panel이 최신 값으로 갱신된다.

### 규칙
- missing snapshot이어도 inquiry 처리 action은 계속 가능해야 한다.
- linked reference가 없는 `미연결` 상태는 resync action의 직접 대상이 아닐 수 있다.

## 7.3 Snapshot detail에서 manual resync 흐름

1. operator가 특정 entity snapshot detail로 이동한다.
2. header와 content panel에서 현재 snapshot 상태를 확인한다.
3. recovery panel에서 resync를 요청한다.
4. 성공 시 마지막 동기화 시각과 상태가 갱신된다.
5. 실패 시 기존 snapshot은 유지하고 failure feedback만 갱신한다.

## 7.4 Failed integration event 확인 흐름

1. operator가 integration event log screen을 연다.
2. `FAILED` status filter 또는 list row를 선택한다.
3. detail panel에서 `failure_reason`, `retry_count`, `source_entity_reference_id`를 확인한다.
4. 필요 시 관련 snapshot detail로 이동하거나 entity resync를 시도한다.

### 규칙
- event log는 현재 처리 상태와 retry count를 중심으로 보여주며, 전체 시도 이력을 모두 재구성하는 화면을 기본 전제로 두지 않는다.

## 7.5 Ignored event 해석 흐름

1. operator가 `IGNORED` 상태의 row를 본다.
2. detail panel에서 unsupported/non-applicable event라는 점을 확인한다.
3. 이를 inquiry 오류로 해석하지 않고 운영 로그 수준의 정보로 본다.

## 8. Error / Read-only / Degraded Display Detail

## 8.1 Linked snapshot 안내 문구 예시

- `연결된 고객 정보가 없습니다.`
- `주문 정보가 최신이 아닙니다. 재동기화를 시도할 수 있습니다.`
- `최근 상품 정보 조회에 실패했습니다. 기존 정보는 유지됩니다.`

## 8.2 Resync feedback 문구 예시

- `재동기화 요청이 접수되었습니다.`
- `재동기화에 실패했습니다. 기존 스냅샷은 유지됩니다.`
- `잠시 후 다시 시도해 주세요.`

## 8.3 Event processing 상태 표시 예시

- `수신됨`
- `무시됨`
- `실패`
- `반영 완료`

## 8.4 Degraded 표시 원칙

- degraded는 card/panel 단위로 국소적으로 표시한다.
- 전체 operator workflow를 불필요하게 차단하지 않는다.
- 정상 데이터와 실패 데이터를 한 화면에서 함께 보여줄 수 있어야 한다.
- linked reference 부재와 snapshot 복구 가능 상태를 같은 의미로 혼합하지 않는다.

## 8.5 Read-only 성격

- commerce integration UI는 운영 조회/복구 중심 화면이다.
- operator가 직접 snapshot 값을 수정하는 인라인 편집 UI는 두지 않는다.
- 변경 가능한 action은 manual resync와 관련 이동 action 중심으로 제한한다.

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강할 local detail이다.

- customer/order/product detail screen을 탭 구조로 합칠지 entity별 개별 route로 둘지
- event log에서 날짜 범위 filter를 추가할지 여부
- failed event에서 direct retry action을 별도 기능으로 둘지, 계속 entity-scoped manual resync만 recovery 기준으로 둘지
- stale 판정 시간 기준의 정확한 threshold
- snapshot card 정렬 우선순위
