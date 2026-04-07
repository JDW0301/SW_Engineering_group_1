# SW_Engineering_group_1

AI 기반 소프트웨어공학 1조 프로젝트 문서 저장소입니다. 이 저장소는 자사몰 사업자를 위한 고객센터 운영 도메인을 중심으로, 도메인 설계(DDD)와 구현 지향 명세를 정리한 현재 기준 문서를 담고 있습니다.

## Overview

이 프로젝트는 단순 문의 게시판이 아니라 **Merchant Customer Support Operations**를 다룹니다. 핵심 관심사는 문의를 처리 상태로 관리하고, 주문/상품/고객 맥락을 연결하며, 정책과 응답 기준을 유지하고, 공격적 메시지로부터 상담자를 보호하는 운영 환경을 설계하는 것입니다.

현재 문서 기준에서 권장하는 구조는 **Modular Monolith**이며, 배포 단위 분리보다 먼저 명확한 도메인 경계와 모듈 책임을 정리하는 데 초점을 둡니다.

## Documented Bounded Contexts

프로젝트는 다음 6개의 bounded context를 기준으로 해석됩니다.

1. **Case Management**
   - 문의 생성, 상태 전이, 재오픈, 종료, 내부 메모, 운영자 응답 흐름
2. **Customer Portal**
   - 고객 문의 등록, 고객 채팅 응답, 고객 상태 조회
3. **Commerce Integration**
   - 외부 주문/상품/고객 데이터 수신, 웹훅 처리, 내부 스냅샷 반영
4. **Knowledge Policy**
   - FAQ, 정책 문서, 응답 프리셋, 금지/예외 응답 규칙
5. **Safety Intelligence**
   - 메시지 요약, 악성 표현 감지, handoff 제안, 상담자 보호 보조 판단
6. **Identity & Governance**
   - 계정/역할/권한, 민감정보 접근 통제, 감사/보관 정책 기준

## Repository Structure

```text
.
├── README.md
├── AGENTS.md
├── immediate-mvp-notes.md
├── db/
│   └── mysql/
└── docs/
    ├── ddd/
    │   ├── active/
    │   ├── planning/
    │   └── archive/
    ├── specifications/
    │   ├── active/
    │   │   ├── foundation/
    │   │   ├── modules/
    │   │   └── platform/
    │   ├── planning/
    │   └── archive/
    ├── project-handbook/
    └── agent-governance/
```

### Main directories

- `docs/ddd/`: 도메인 경계, 컨텍스트, 용어, 문서 구조를 정의하는 전략 설계 문서
- `docs/specifications/`: 실제 구현에 연결되는 현재 기준 명세 문서
- `db/mysql/`: 초기 안전 스키마와 데이터베이스 관련 메모
- `immediate-mvp-notes.md`: 현재 MVP 범위와 결정 상태 확인용 메모

## How to Read the Docs

이 저장소의 문서는 최신 active 문서를 우선 기준으로 사용합니다.

### Strategic design

다음 순서로 읽는 것을 권장합니다.

1. `docs/ddd/README.md`
2. `docs/ddd/active/domain-landscape.md`
3. `docs/ddd/active/ubiquitous-language.md`
4. `docs/ddd/active/bounded-contexts.md`
5. `docs/ddd/active/context-map.md`

### Implementation-facing specifications

구현 관점에서는 다음 문서들부터 읽으면 됩니다.

1. `docs/specifications/README.md`
2. `docs/specifications/active/README.md`
3. `docs/specifications/active/foundation/*`
4. `docs/specifications/active/modules/*`
5. `docs/specifications/active/platform/*`

## Notes

- `active/` 디렉터리의 문서가 현재 기준입니다.
- `planning/` 문서는 공백 분석과 우선순위 판단을 위한 참고 자료입니다.
- `archive/` 문서는 비교나 이력 확인이 필요할 때만 읽는 것을 전제로 보관됩니다.

## Team

AI 기반 소프트웨어공학 1조

- 서재철
- 조규상
- 윤건호
- 조동욱
