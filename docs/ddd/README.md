# DDD 재구성 문서 안내

이 디렉터리는 프로젝트를 최신 DDD 관점으로 재해석한 **전략 설계 기준 문서군**이다. 기존 `docs/specifications/active`가 구현 명세의 현재 기준이라면, 본 디렉터리는 **도메인 경계, 컨텍스트, 용어, 이벤트, 문서 체계, 에이전트 참조 규칙**을 정의하는 상위 설계 기준이다.

## 문서 역할

- `active/`: 현재 기준 DDD 설계 문서
- `planning/`: 현재 자료 구조 진단 및 재편 배경 문서
- `archive/`: 이전 기준 또는 비교용 안내

## 우선 읽기 순서

1. `active/domain-landscape.md`
2. `active/ubiquitous-language.md`
3. `active/bounded-contexts.md`
4. `active/context-map.md`
5. `active/document-architecture.md`
6. `active/agent-reference-strategy.md`

아래 문서는 **필요할 때만** 추가로 읽는다.

- `planning/material-diagnosis.md`: 현재 자료 구조 진단이 필요할 때
- `active/tactical-design-candidates.md`: 코드 구조/모듈 설계 판단이 필요할 때

## 이 문서군의 목적

- 기능 목록이 아니라 **도메인 의미 단위**로 프로젝트를 다시 해석한다.
- Core / Supporting / Generic 경계를 과도하지 않게 식별한다.
- 문서 구조와 에이전트 참조 순서를 도메인 경계에 맞게 통제한다.
- 마이크로서비스보다 Modular Monolith가 적절한지 같은 구조적 판단 근거를 남긴다.
- bounded context는 우선 **논리적 모듈 경계**로 취급하며, 곧바로 배포 단위나 서비스 분리로 해석하지 않는다.
