# 도메인 랜드스케이프

## 1. 프로젝트의 핵심 도메인 정의

이 프로젝트의 본질은 단순 문의 게시판이 아니라, **자사몰 사업자를 위한 고객센터 운영 도메인**이다. 핵심 문제는 메시지를 저장하는 것이 아니라,

- 문의를 처리 상태로 관리하고
- 주문/상품/고객 문맥을 연결해 이해하고
- 정책과 응답 기준을 유지하며
- 공격적 메시지로부터 상담자를 보호하고
- 외부 커머스 데이터와 동기화된 운영 환경을 제공하는 것

에 있다.

따라서 이 프로젝트의 상위 도메인은 다음과 같이 정의하는 것이 적절하다.

> **Merchant Customer Support Operations**

## 2. Subdomain 분해

## 2.1 Core Subdomain

### A. Support Case Management

- 문의 생성, 상태 전이, 배정, 재오픈, 종료, 내부 메모, 상담 이력 관리
- 이 프로젝트의 운영 중심축이며, 다른 영역의 의미가 여기로 모인다.

### B. Support Safety Assistance

- 메시지 요약, 악성 표현 감지, 사람 상담 전환 보조
- 일반 CRUD보다 제품 차별성이 강하고, 상담자 보호라는 문제 정의와 직접 연결된다.

위 두 영역은 제품의 핵심 차별성과 운영 가치에 직결되므로 core로 보는 것이 타당하다.

## 2.2 Supporting Subdomain

### C. Commerce Context Integration

- 외부 시스템의 고객/주문/상품 데이터를 필요한 범위로 가져와 문의 맥락에 연결
- 자체 목적이 아니라 core domain을 보조한다.

### D. Knowledge & Policy Management

- FAQ, 응답 프리셋, 배송/환불/교환 정책, 금지 답변/예외 규칙 관리
- 상담 품질과 AI 판단의 근거를 제공하는 supporting domain이다.

### E. Customer Interaction Portal

- 고객의 문의 등록, 채팅, 상태 조회
- 사업자 운영 가치에 종속되지만 별도의 사용자 여정과 언어를 가진다.

## 2.3 Generic Subdomain

### F. Identity & Access

- 계정, 인증, 역할, 접근 제어

### G. Reporting & Search

- 검색, 필터, 운영 지표, 정렬

### H. Audit / Retention / File Handling

- 로그, 보관 정책, 마스킹, 파일 저장/검증

## 3. Core / Supporting / Generic 구분 이유

- **Core**는 제품의 차별성을 만드는 규칙 중심 영역이다.
- **Supporting**은 core를 가능하게 하지만, 제품 고유의 경쟁 우위 그 자체는 아니다.
- **Generic**은 필수지만 일반적인 솔루션 패턴을 강하게 활용할 수 있는 영역이다.

이 구분은 “중요도”가 아니라 “전략적 독자성”을 기준으로 한다.

## 4. Bounded Context 후보

현재 규모를 고려할 때 다음 6개 bounded context가 가장 적절하다.

1. **Case Management Context**
2. **Customer Portal Context**
3. **Commerce Integration Context**
4. **Knowledge Policy Context**
5. **Safety Intelligence Context**
6. **Identity & Governance Context**

`Reporting & Search`는 독립 context로 뽑기보다 초기에는 read model / supporting module로 두는 편이 과하지 않다.

## 5. 왜 이 경계를 나누는가

## 5.1 Case Management vs Customer Portal

- 둘 다 문의를 다루지만 언어가 다르다.
- 사업자는 “배정, 처리, 종료, 내부 메모”를 본다.
- 고객은 “등록, 진행 상태, 채팅 응답”을 본다.
- 같은 데이터라도 의미가 다르므로 context를 구분하는 편이 안전하다.

## 5.2 Case Management vs Commerce Integration

- 주문/상품/고객 데이터는 문의 처리를 돕지만, 문의의 상태 규칙을 직접 소유하지 않는다.
- 외부 스키마와 내부 운영 모델의 경계를 분리해야 한다.

## 5.3 Safety Intelligence vs Knowledge Policy

- 둘 다 AI 관련처럼 보이지만 역할이 다르다.
- Knowledge Policy는 “무엇을 근거로 판단할지”를 소유한다.
- Safety Intelligence는 “메시지를 어떻게 분석하고 전환 판단할지”를 소유한다.

## 6. 팀/책임/모듈 경계 적합성 판단

현재 문서 구조는 `foundation / modules / platform` 기준이라 도메인 경계를 직접 반영하지 않는다. 따라서 팀이 커질수록 아래 문제가 생길 수 있다.

- 어떤 팀이 문의 상태 규칙을 소유하는지 불명확
- 외부 연동 변경이 문의 운영 규칙에 침투할 가능성
- AI 규칙 변경과 정책 문서 변경의 책임 분리 어려움

DDD 재구성 이후에는 팀 책임도 bounded context 기준으로 맞추는 편이 낫다.

## 7. 구조적 권고

현재 프로젝트 규모에서는 **Modular Monolith**가 가장 적절하다.

이유:

- 문의 처리, 고객 포털, 외부 연동, 안전 보조가 강하게 연결되어 있다.
- 아직 팀 규모나 운영 복잡도가 microservice를 정당화할 수준으로 보이지 않는다.
- shared transaction과 빠른 모델 변경이 필요한 초기 단계다.
- 문서 기준으로도 하나의 통합 DB/모델에서 빠르게 의미를 정리하는 것이 우선이다.

단, monolith라 하더라도 **모듈 경계는 bounded context 기준으로 엄격히 나누는 것**이 바람직하다.
