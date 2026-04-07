# 상세 명세 문서 안내

이 폴더는 기존 `project-handbook` 문서를 기반으로, 실제 구현에 바로 활용할 수 있도록 재구성한 상세 명세 문서 세트이다. 기존 문서는 문제 정의와 기능 방향을 정리한 **핸드북 성격의 1차 문서**로 유지하고, 본 폴더는 구현·설계·정책 결정을 위한 **현재 기준(active) 명세**를 제공한다.

## 폴더 구조

```text
docs/specifications/
├── README.md
├── active/
│   ├── README.md
│   ├── foundation/
│   │   ├── product-scope.md
│   │   ├── domain-model.md
│   │   ├── roles-and-permissions.md
│   │   └── case-lifecycle.md
│   ├── modules/
│   │   ├── workspace-and-inquiry-operations.md
│   │   ├── chat-and-attachments.md
│   │   └── ai-assistant-and-knowledge.md
│   └── platform/
│       └── integration-security-and-constraints.md
├── planning/
│   ├── gap-analysis.md
│   └── specification-priority.md
└── archive/
    └── README.md
```

## 문서 역할

- `active/`: 현재 기준으로 읽어야 하는 구현 지향 명세
- `planning/`: 빈 부분 진단, 선행 정의 우선순위, 의존 관계 정리
- `archive/`: 비교를 위한 이전 문서군 참조 안내
- `document-version-policy.md`: 최신 문서 우선 원칙과 과거 버전 참조 기준

## 읽기 순서

1. `planning/gap-analysis.md`
2. `planning/specification-priority.md`
3. `document-version-policy.md`
4. `active/foundation/product-scope.md`
5. `active/foundation/domain-model.md`
6. `active/foundation/roles-and-permissions.md`
7. `active/foundation/case-lifecycle.md`
8. `active/modules/*`
9. `active/platform/integration-security-and-constraints.md`

## 문서 작성 원칙

- 기존 문서를 복제하지 않고, 구현에 필요한 규칙과 기준을 보강한다.
- 확정되지 않은 사항은 `확인 필요`, `추가 정의 필요`, `정책 결정 필요`로 표시한다.
- 기능 설명만이 아니라 로직, 상태 변화, 예외 처리, 데이터 구조, 모듈 책임, 의존 관계를 함께 기록한다.
- 현재 기준 문서는 `active/`에만 두고, 이전 문서군은 `archive/`에서 추적한다.
- 문서 참조는 항상 최신 active 문서를 우선하며, 과거 문서는 정책상 필요한 경우에만 선택적으로 참조한다.
