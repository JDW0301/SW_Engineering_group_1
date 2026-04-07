# Context Map 초안

## 1. 목적

본 문서는 bounded context 사이의 협력 구조와 번역 지점을 정리한다.

## 2. 관계 요약

```text
Customer Portal
  -> Case Management

Commerce Integration
  -> Case Management

Knowledge Policy
  -> Case Management
  -> Safety Intelligence

Safety Intelligence
  -> Case Management

Identity & Governance
  -> (all contexts as policy boundary)
```

## 3. 관계 해석

## 3.1 Customer Portal -> Case Management

- 고객이 문의를 생성하면 Case Management에 support case가 만들어진다.
- Customer Portal은 Case Management의 consumer 성격을 가진다.
- 고객 표시용 상태는 Case Management 상태를 그대로 쓰지 않고 표현 계층을 둘 수 있다.

## 3.2 Commerce Integration -> Case Management

- 외부 주문/상품/고객 데이터는 그대로 쓰지 않고 내부 snapshot 또는 reference로 번역되어야 한다.
- 따라서 이 경계에는 **ACL(Anti-Corruption Layer)** 이 필요하다.

## 3.3 Knowledge Policy -> Case Management / Safety Intelligence

- 정책 문서와 FAQ는 답변/판단의 근거를 제공한다.
- Knowledge Policy가 직접 문의 상태를 바꾸지는 않는다.

## 3.4 Safety Intelligence -> Case Management

- 요약, 악성 표현 감지, handoff 제안은 Case Management의 보조 입력이다.
- Safety Intelligence가 support case aggregate를 직접 소유해서는 안 된다.

## 3.5 Identity & Governance -> All

- 권한, 마스킹, 감사 로그, 보관 정책은 cross-cutting이지만 별도 context 관점으로 보는 편이 좋다.

## 4. ACL 필요 여부

### ACL이 필요한 경계

- **외부 커머스 DB / 웹훅 -> Commerce Integration Context**

이유:

- 외부 스키마는 우리 모델과 의미가 다를 수 있다.
- 민감정보 전체를 그대로 흘려보내면 안 된다.
- 주문/상품/고객 개념은 외부 시스템의 lifecycle에 종속될 수 있다.

### ACL이 과하지 않은 이유

- 이 프로젝트는 이미 외부 DB와 프로젝트 DB를 분리해 생각하고 있다.
- 따라서 단순 DTO 매핑이 아니라, 도메인 의미 번역과 민감정보 축소가 필요한 경계다.

## 5. 이벤트 흐름 후보

### Domain Event 후보

- `CaseOpened`
- `CaseStatusChanged`
- `CaseReopened`
- `MerchantResponded`
- `CustomerMessageReceived`
- `SafetySignalRaised`
- `HandoffRequested`
- `CaseResolved`

### Integration Event 후보

- `ExternalOrderCreatedReceived`
- `ExternalOrderStatusChangedReceived`
- `ExternalCustomerUpdatedReceived`
- `ExternalProductUpdatedReceived`

## 6. 초기 구현 원칙

- 내부 모듈 간 통신은 먼저 in-process event 또는 application service 호출로 해결한다.
- 외부 이벤트만 integration event로 분리한다.
- 모든 이벤트를 메시지 브로커 기반으로 과도하게 설계할 필요는 없다.
