# 추천 문서 구조

## 1. 목적

본 문서는 현재 문서 체계를 DDD 관점으로 재배치할 때의 추천 구조를 정의한다.

## 2. 추천 상위 구조

```text
docs/
├── ddd/
│   ├── active/
│   ├── planning/
│   └── archive/
├── domains/
│   ├── active/
│   │   ├── case-management/
│   │   ├── customer-portal/
│   │   ├── commerce-integration/
│   │   ├── knowledge-policy/
│   │   ├── safety-intelligence/
│   │   └── identity-governance/
│   └── archive/
├── decisions/
│   ├── active/
│   └── archive/
└── references/
    ├── active/
    └── archive/
```

## 3. domain별 문서 배치 원칙

각 domain/context 아래에는 최소 아래 문서를 둔다.

- `overview.md`: 컨텍스트 목적과 책임
- `glossary.md`: 해당 컨텍스트 용어집
- `rules.md`: 정책/상태/제약
- `events.md`: domain event / integration event
- `spec.md`: 현재 구현 기준 명세
- `integration.md` 또는 `acl.md`: 외부 경계가 있으면 별도 분리

## 4. 문서 종류 분리 방안

## 4.1 spec

- 현재 구현 기준 명세
- 상태, 입력/출력, 예외, 제약 중심

## 4.2 decision

- 구조적 판단 근거
- 예: modular monolith 선택, ACL 필요 여부, 민감정보 축소 원칙

## 4.3 glossary

- 용어 충돌 해결
- 컨텍스트별 의미 차이 기록

## 4.4 context-map

- 컨텍스트 관계와 번역 경계 기록

## 4.5 events

- domain event / integration event 구분
- 발행 주체와 소비 컨텍스트 기록

## 4.6 rules

- 상태 전이, 정책 우선순위, 마스킹 규칙, handoff 규칙처럼 구현보다 먼저 고정해야 하는 규칙 기록

## 5. active / archive 분리 원칙

- 각 주제/컨텍스트별 최신 문서는 `active/`만 기준으로 삼는다.
- 변경 전 문서는 `archive/`로 옮기거나 링크한다.
- 과거 문서는 기본 읽기 대상이 아니다.

## 6. 현재 문서에서의 이행 방안

당장 모든 기존 문서를 물리적으로 옮길 필요는 없다. 아래 순서로 이행하는 편이 현실적이다.

1. `docs/ddd/active`를 전략 설계 기준으로 둔다.
2. 기존 `docs/specifications/active`는 구현 상세 기준으로 유지한다.
3. 이후 새 명세부터는 `domains/active/<context>/spec.md` 구조로 작성한다.
4. 점진적으로 기존 기능 문서를 해당 context 하위로 재배치한다.

## 7. 현재 구조 대비 개선점

- 기능 단위 문서에서 도메인 의미 단위 문서로 이동
- AI/정책/문의 운영의 책임 경계를 더 명확히 분리
- 에이전트가 폴더 구조만 보고도 어떤 context를 읽어야 할지 더 쉽게 판단 가능
