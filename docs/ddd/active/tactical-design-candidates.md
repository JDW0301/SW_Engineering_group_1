# 전술 설계 후보

## 1. 목적

본 문서는 현재 프로젝트 규모에 맞게 절제된 전술 DDD 적용 후보를 정리한다. 모든 CRUD 영역에 무거운 패턴을 적용하지 않는다.

## 2. Aggregate 후보

## 2.1 SupportCase Aggregate

### Aggregate Root

- `support_case` (`inquiry`와 대응)

### 포함 후보

- 상태
- 담당자 정보
- 내부 메모 추가 규칙
- handoff 이력
- 종료/재오픈 규칙

### 이유

- 상태 변화와 규칙이 가장 많이 모이는 핵심 경계다.

## 2.2 KnowledgeAsset Aggregate 후보

- `policy_document`
- `faq_article`
- `response_preset`

이들은 서로 다른 lifecycle을 가질 수 있으므로, 하나의 aggregate로 묶기보다 자산 종류별 aggregate가 적절하다.

## 2.3 Governance Policy Aggregate 후보

- `retention_policy`
- `masking_policy`

초기에는 aggregate보다 설정 집합으로 두고, 정책 변경 이력이 중요해질 때 강화하는 편이 낫다.

## 3. Entity / Value Object 후보

## 3.1 Entity 후보

- `SupportCase`
- `InternalNote`
- `HandoffEvent`
- `PolicyDocument`
- `FAQArticle`
- `ResponsePreset`
- `CommerceSnapshot(Order/Product/Customer)`

## 3.2 Value Object 후보

- `CaseStatus`
- `InquiryType`
- `OrderReference`
- `ProductReference`
- `CustomerReference`
- `MessageContent`
- `AbuseSeverity`
- `SummaryExcerpt`
- `PolicyDecision`

## 4. Domain Service / Application Service 분리

## 4.1 Domain Service 후보

- `HandoffDecisionPolicy`
  - 안전 신호, 정책 문서, 응답 실패 여부를 보고 사람 전환 필요성을 판단
- `ResponsePolicyEvaluator`
  - 금지 답변 규칙, 정책 문서, FAQ 우선순위를 평가
- `CaseReopenPolicy`
  - 종료된 케이스 재오픈 조건 판단

## 4.2 Application Service 후보

- `OpenCaseService`
- `ChangeCaseStatusService`
- `AppendCustomerMessageService`
- `ComposeMerchantResponseService`
- `ImportCommerceSnapshotService`
- `GenerateSummaryService`
- `DetectAbuseService`

### 분리 기준

- 상태를 바꾸는 orchestration은 Application Service
- 순수 판단 규칙은 Domain Service

## 5. 도메인 이벤트와 통합 이벤트 구분

## 5.1 Domain Event

- 같은 bounded context 또는 같은 모듈 내부에서 의미가 있는 사건
- 예: `CaseOpened`, `CaseResolved`, `HandoffRequested`

## 5.2 Integration Event

- 외부 시스템과의 경계를 넘어 들어오거나 나가는 사건
- 예: `ExternalOrderStatusChangedReceived`

## 6. 과적용을 피해야 하는 부분

- `product`, `customer`, `order` snapshot 영역은 초기에는 무거운 aggregate보다 snapshot/read model로 다루는 편이 낫다.
- 검색/지표는 독립 도메인 규칙보다 query model 성격이 강하므로 tactical DDD를 과하게 적용하지 않는다.
- 파일 업로드는 generic capability로 두고 core domain으로 끌어올리지 않는다.

## 7. 구현 권고

- 코드 구조는 `context -> application -> domain -> infrastructure` 수준의 모듈 분리를 권장한다.
- 다만 프로세스 분리는 하지 말고, 하나의 monolith 안에서 패키지/모듈 경계를 먼저 강하게 유지한다.
