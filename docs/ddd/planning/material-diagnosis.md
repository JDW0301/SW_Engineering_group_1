# 현재 자료 구조 진단

## 1. 진단 목적

본 문서는 현재 프로젝트 자료를 **무차별 전문 정독 없이** 인덱싱하고, active/latest 기준 문서와 참조용 문서를 구분해 문서 구조의 효율성과 한계를 진단하기 위한 문서이다.

## 2. 현재 자료 인덱스

| 경로 | 종류 | 역할 | 최신성/active 여부 | 관련 도메인/주제 |
|---|---|---|---|---|
| `immediate-mvp-notes.md` | 작업 메모 | 현재 회의/결정용 실행 메모 | 최신 보조 문서, active 보조 | MVP 범위, 의사결정 |
| `docs/specifications/README.md` | 인덱스 | 구현 명세 문서군 안내 | active 기준 | 전체 명세 구조 |
| `docs/specifications/document-version-policy.md` | 정책 | 최신 active 우선 규칙 | active 기준 | 문서 버전/참조 정책 |
| `docs/specifications/active/*` | 상세 명세 | 구현 지향 명세 | active 기준 | 범위, 데이터, 상태, 기능, 보안 |
| `docs/specifications/planning/*` | 계획/진단 | 누락 분석, 우선순위 | active 보조 | 명세 의존 관계 |
| `docs/specifications/archive/README.md` | 안내 | 과거 문서 참조 원칙 | active 보조 | archive 안내 |
| `docs/project-handbook/*` | 초기 핸드북 | 문제정의/기능방향/요구사항 초안 | 구버전/참조용 | 입력 자료, 초기 구조 |
| `/home/tjwocjf0915/AGENTS.md` | 운영 규칙 | 에이전트 실행 규칙 | 현재 공통 규칙 | 에이전트 운영 |

## 3. active 기준 자료

현재 기준으로 실질적 authoritative 문서는 아래 세 축이다.

1. `docs/specifications/active/*`
2. `docs/specifications/document-version-policy.md`
3. `immediate-mvp-notes.md` (단기 실행 메모)

`project-handbook`는 현재 기준 문서가 아니라 **기준 입력 문서군**이다.

## 4. 중복/구버전/참조용 문서 판단

### 4.1 중복 성격이 있는 영역

- `specifications/active/foundation/case-lifecycle.md`
- `specifications/active/modules/workspace-and-inquiry-operations.md`
- `specifications/active/platform/integration-security-and-constraints.md`

위 세 문서는 상태/예외/권한/실패 처리 기준이 일부 겹친다.

### 4.2 구버전/참조용

- `docs/project-handbook/*`

이 문서군은 제품을 이해하는 데는 유용하지만, 최신 active 명세가 존재하므로 기본 작업 기준으로 읽을 필요는 없다.

## 5. 현재 구조의 장점

- active / planning / archive 구분이 이미 존재한다.
- 문서 버전 우선순위 원칙이 분리되어 있다.
- 제품 범위, 도메인 모델, 상태 모델, 보안 제약 등 선행 기준이 어느 정도 정리되어 있다.

## 6. 현재 구조의 비효율

## 6.1 도메인 경계보다 기능/기술 묶음 중심

현재 `foundation / modules / platform` 구분은 구현 순서에는 유리하지만, DDD 관점의 bounded context를 바로 드러내지는 못한다.

예를 들면:

- 문의 운영
- 고객 포털
- 외부 커머스 데이터 동기화
- 정책/지식 자산 관리
- 안전 보조 AI

같은 도메인 경계가 문서 폴더에서 직접 보이지 않는다.

## 6.2 여러 active 신호의 분산

- `specifications/active/*`
- `immediate-mvp-notes.md`
- `AGENTS.md`

현재 기준 문서가 여러 곳에 흩어져 있어, 에이전트나 팀원이 "무엇을 먼저 읽어야 하는지"를 한 번 더 추론해야 한다.

## 6.3 구현 명세와 전략 설계의 계층 분리 부족

현재 명세는 데이터/상태/기능 기준은 좋지만,

- Core Domain이 무엇인지
- 어떤 Supporting Subdomain이 있는지
- 어떤 Context 사이에 ACL이 필요한지
- microservice가 아니라 modular monolith가 적절한 이유가 무엇인지

같은 전략 설계 판단은 명시적으로 드러나지 않는다.

## 7. 진단 결론

현재 구조는 **초기 구현 명세 체계로는 충분히 실용적**이지만, 도메인 중심 설계와 팀/모듈 경계를 설명하는 상위 레이어가 부족하다. 따라서 다음 단계는 기존 active 명세를 폐기하는 것이 아니라, 그 위에 **DDD 전략 설계 레이어**를 추가하고, 에이전트의 참조 순서를 이 레이어 기준으로 재정렬하는 것이 적절하다.
