# AGENTS 한국어 요약

> 이 문서는 **사람 검토용 요약**이다.
> 규범 문서는 `AGENTS.md`이며, 에이전트는 이 파일을 기본적으로 읽지 않는다.
> 아래 내용은 `AGENTS.md`의 실행 규칙을 빠르게 확인하기 위한 압축 요약이다.

## 1. 문서 목적

- 이 프로젝트에서 에이전트가 **최소한의 올바른 문맥만 읽도록 통제**한다.
- 프로젝트 소개가 아니라, **참조 순서와 읽기 범위**를 제한하는 운영 규칙 문서다.

## 2. 기본 참조 우선순위

기본적으로 아래 순서로 본다.

1. `docs/ddd/README.md`
2. `docs/ddd/active/` 관련 문서
3. `docs/specifications/README.md`
4. `docs/specifications/active/` 관련 문서
5. `immediate-mvp-notes.md`는 현재 결정사항 확인이 필요할 때만

기본 참조 대상이 아닌 문서:

- `docs/project-handbook/*`
- `docs/specifications/archive/*`
- `docs/ddd/archive/*`
- 기타 legacy/history/archive 문서

## 3. 참조 최소화 원칙

- 무관한 폴더를 넓게 스캔하지 않는다.
- 먼저 README/요약/인덱스를 본다.
- 도메인 또는 bounded context를 먼저 식별한 뒤 세부 문서를 연다.
- active 문서만으로 충분하면 과거 문서를 추가로 읽지 않는다.
- 같은 사실을 여러 문서에서 반복 확인하지 않는다.

## 4. 작업 시작 절차

1. 요청을 **도메인/컨텍스트 단위**로 분류
2. 필요한 자료를 추정
3. 최소 참조 세트 선정
4. 최신 active 문서부터 읽기
5. 부족할 때만 추가 문서 열람

## 5. 버전 문서 처리 원칙

- 기본 작업 기준은 항상 **최신 active 문서**다.
- 기존 파일은 유지하고 새 버전을 만든다.
- 과거 문서는 아래 경우에만 읽는다.
  1. 사용자가 특정 구버전을 요청함
  2. 현재 문서만으로 근거나 이력이 부족함
  3. 현재 문서 간 충돌이 있음
  4. 회귀/영향/배경 확인이 필요함
- 과거 문서를 읽었으면
  - 왜 읽었는지
  - 어떤 문서를 읽었는지
  - 현재 작업에 어떤 영향을 줬는지
  를 밝혀야 한다.

## 6. DDD 관점 작업 규칙

- UI나 DB보다 **도메인 의미**부터 본다.
- 구현보다 먼저 **규칙, 정책, 상태 변화, 이벤트**를 뽑는다.
- 용어가 충돌하면 ubiquitous language 후보부터 정리한다.
- 단순 CRUD 영역에 무거운 전술 DDD를 과도하게 적용하지 않는다.

## 7. 현재 프로젝트의 기본 bounded context

- Case Management
- Customer Portal
- Commerce Integration
- Knowledge Policy
- Safety Intelligence
- Identity & Governance

전략 설계는 아래 문서를 우선 본다.

- `docs/ddd/active/domain-landscape.md`
- `docs/ddd/active/bounded-contexts.md`
- `docs/ddd/active/context-map.md`
- `docs/ddd/active/ubiquitous-language.md`

구현 상세는 그 다음 `docs/specifications/active/*`를 본다.

## 8. 질문 유형별 권장 읽기 순서

### 도메인/아키텍처 질문
- `docs/ddd/README.md`
- `docs/ddd/active/domain-landscape.md`
- `docs/ddd/active/bounded-contexts.md`
- `docs/ddd/active/context-map.md`

### 구현/명세 질문
- `docs/specifications/README.md`
- 관련 `foundation/*`
- 관련 `modules/*`
- 필요 시 `platform/*`

### 현재 회의/범위 결정 질문
- `immediate-mvp-notes.md`
- 관련 active DDD/spec 문서

## 9. 효율 규칙

- “프로젝트 전체 검토”는 모든 파일 전문 정독이 아니다.
- 자료를 식별하고 분류한 뒤, 최신 active 문서 위주로 분석한다.
- README가 authoritative 문서를 알려주면 불필요한 추가 탐색을 멈춘다.

## 10. 출력 원칙

응답 시 아래를 구분해 드러낸다.

- 현재 active 문서 기반인지
- 구조상 추론인지
- 과거 문서에 의존한 것인지

과거 문서를 읽지 않았다면 굳이 언급하지 않는다.
