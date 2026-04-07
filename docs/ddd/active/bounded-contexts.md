# Bounded Context 정의 초안

## 1. 목적

본 문서는 현재 프로젝트에 적절한 bounded context 후보와 각 컨텍스트의 책임 경계를 정의한다.

## 2. Context 목록

## 2.1 Case Management Context

### 책임

- Support Case 생성/상태 전이/재오픈/종료
- 내부 메모
- 운영자 응답 흐름
- case timeline과 case context 조립의 기준 의미

### 소유 개념

- `support_case(inquiry)`
- `case_status`
- `internal_note`
- `handoff_event`

## 2.2 Customer Portal Context

### 책임

- 고객 문의 등록
- 고객 채팅 응답
- 고객 상태 조회

### 소유 개념

- 고객 관점 inquiry 제출 흐름
- 고객 표시용 상태 표현
- 고객 노출 메시지/첨부 정책

## 2.3 Commerce Integration Context

### 책임

- 외부 주문/상품/고객 데이터 수신
- 웹훅 처리
- 내부 snapshot 반영
- 외부 데이터와 내부 모델의 번역

### 소유 개념

- `external_reference_id`
- `commerce_snapshot`
- `integration_event`

## 2.4 Knowledge Policy Context

### 책임

- FAQ
- 정책 문서
- 응답 프리셋
- 금지/예외 응답 규칙

### 소유 개념

- `knowledge_asset`
- `policy_document`
- `response_preset`
- `forbidden_answer_rule`

## 2.5 Safety Intelligence Context

### 책임

- 메시지 요약
- 악성 표현 감지
- handoff 제안
- 상담자 보호를 위한 보조 판단

### 소유 개념

- `ai_summary`
- `abuse_detection_result`
- `safety_signal`

## 2.6 Identity & Governance Context

### 책임

- 계정/역할/권한
- 민감정보 접근 통제
- 감사 로그 및 보관 정책의 기준

### 소유 개념

- `role`
- `permission`
- `data_classification`
- `retention_policy`

## 3. 경계 규칙

- Case Management는 외부 주문/상품 데이터의 원본을 소유하지 않는다.
- Customer Portal은 상태를 직접 바꾸지 않는다.
- Safety Intelligence는 상태를 직접 확정하지 않고 제안/신호를 제공한다.
- Knowledge Policy는 메시지 자체를 처리하지 않고 판단 근거를 제공한다.
- Identity & Governance는 도메인 행위를 수행하지 않지만, 모든 컨텍스트의 접근 경계를 제한한다.

## 4. 초기 구현 권고

현재 규모에서는 이 컨텍스트를 프로세스 단위로 쪼개기보다, **하나의 Modular Monolith 안의 독립 모듈**로 유지하는 것이 적절하다.

즉, 본 문서의 bounded context는 우선 배포 단위가 아니라 **의미 경계와 모듈 책임 경계**를 정의하기 위한 것이다.
