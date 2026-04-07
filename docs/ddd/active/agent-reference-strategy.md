# 참조 전략 가이드

## 1. 목적

본 문서는 에이전트가 자료를 과도하게 읽지 않으면서도 충분한 문맥을 확보하도록, 문서 참조 순서와 열람 범위를 통제하기 위한 가이드이다.

## 2. 기본 원칙

- 항상 **최신 active 문서**를 우선 읽는다.
- 먼저 인덱스/README/요약 문서를 읽고, 그 다음 필요한 세부 문서만 연다.
- 작업과 무관한 폴더를 넓게 스캔하지 않는다.
- 같은 정보를 여러 문서에서 반복 확인하지 않는다.
- archive/history/legacy 문서는 기본 참조 대상이 아니다.

## 3. 작업 시작 절차

1. 요청을 도메인/컨텍스트 단위로 분류한다.
2. 필요한 자료를 추정한다.
3. 최소 참조 세트를 선정한다.
4. 최신 active 문서만 읽고 답이 충분한지 판단한다.
5. 부족할 때만 추가 문서를 단계적으로 연다.

## 4. 권장 읽기 순서

## 4.1 구조나 도메인 판단이 필요한 경우

1. `docs/ddd/README.md`
2. `docs/ddd/active/domain-landscape.md`
3. `docs/ddd/active/bounded-contexts.md`
4. `docs/ddd/active/context-map.md`
5. 필요한 컨텍스트의 구현 명세만 추가 확인

## 4.2 구현 규칙 확인이 필요한 경우

1. `docs/specifications/README.md`
2. 관련 `docs/specifications/active/foundation/*`
3. 관련 `docs/specifications/active/modules/*`
4. 공통 제약이 필요할 때만 `platform/*`

## 4.3 현재 회의/결정사항 확인이 필요한 경우

1. `immediate-mvp-notes.md`
2. 관련 active 명세 문서

## 5. 과거 문서를 읽어야 하는 경우

과거 문서는 아래 조건에서만 읽는다.

1. 사용자 명시 요청
2. 현재 문서만으로 변경 이유/정책 이력이 불충분한 경우
3. 현재 문서 간 충돌/누락이 있는 경우
4. 비교/회귀/이력 추적이 필요한 경우

## 6. 과거 문서를 읽지 말아야 하는 경우

- 현재 active 문서만으로 충분한 경우
- 단순 구현 질문에 대해 배경 이력이 필요 없는 경우
- 하나의 규칙을 확인하기 위해 여러 구버전을 연쇄적으로 읽는 경우
- 인덱스 문서가 이미 authoritative 문서를 알려주는 경우

## 7. 예시 시나리오

## 시나리오 A. 문의 상태 정책을 수정해야 하는 경우

### 먼저 읽을 문서

1. `docs/specifications/active/foundation/case-lifecycle.md`
2. `docs/specifications/active/foundation/domain-model.md`
3. 필요 시 `workspace-and-inquiry-operations.md`

### 읽지 않아도 되는 문서

- `project-handbook/*`
- AI 문서 전체
- archive 문서 전체

## 시나리오 B. 외부 DB 웹훅 구조를 검토해야 하는 경우

### 먼저 읽을 문서

1. `docs/ddd/active/context-map.md`
2. `docs/ddd/active/bounded-contexts.md`
3. `docs/specifications/active/platform/integration-security-and-constraints.md`
4. `immediate-mvp-notes.md`

### 필요한 경우만 추가로 읽을 문서

- `docs/specifications/active/foundation/domain-model.md`

## 시나리오 C. 용어 충돌이 발생한 경우

### 먼저 읽을 문서

1. `docs/ddd/active/ubiquitous-language.md`
2. 관련 bounded context 문서

### 그 다음 행동

- 용어를 기술 구현 관점이 아니라 도메인 의미 관점으로 먼저 정리한다.

## 8. 과거 문서 참조 기록 방식

과거 문서를 읽었다면 결과에 아래를 남긴다.

- 읽은 이유
- 참고한 문서
- 현재 작업에 미친 영향

## 9. 결론

효율적인 참조 전략의 핵심은 **전체 자료를 식별하되, 실제 분석은 최신 active 문서의 최소 세트로 시작하는 것**이다.
