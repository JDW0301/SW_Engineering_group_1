# 로직 단위 상세 명세 전 향후 진행 방향

## 1. 목적

이 문서는 현재 기준선 검토 이후, 로직 단위 상세 명세를 쓰기 전과 쓰는 중에 어떤 순서로 진행하는 것이 가장 실용적인지 정의한다.

목적은 일반적인 프로젝트 관리가 아니라, 문서 간 의존 관계를 고려해 재작업을 줄이는 것이다.

## 2. 핵심 결론

이제는 **큰 prerequisite phase가 더 이상 필요하지 않다**.

권장 경로는 아래와 같다.

1. 짧은 reconciliation / cleanup pass 수행
2. 남은 cross-cutting local rule 고정
3. 의존 관계 순서대로 logic-level detailed spec 작성 시작

## 3. 로직 명세 전 반드시 하면 좋은 것

이 항목들은 아직 cross-document 영향이 있으므로, 로직 명세 전에 정리하는 편이 좋다.

### 3.1 용어 / naming freeze

다음 용어에 대해 canonical internal mapping을 정해야 한다.

- `support case`
- `inquiry`
- `conversation`
- `chatbot_session`

이건 대규모 문서 개편이 아니라, 다음 단계에서 같은 개념을 다르게 부르지 않게 하기 위한 정리다.

### 3.2 cross-cutting rule freeze

여러 문서에 반복될 항목은 먼저 묶어서 정리하는 편이 좋다.

- lifecycle edge rule
- test inquiry exclusion
- timezone / date preset rule
- webhook retry interval / delete handling
- privacy/governance detail

### 3.3 active doc cleanup

이미 결정된 항목이 여전히 TODO처럼 남아 있는 곳을 마지막으로 한 번 정리한다.

## 4. 로직 명세를 쓰면서 정해도 되는 것

아래 항목들은 다음 단계 전체를 막지 않으므로, 각 문서 안에서 local decision으로 처리해도 된다.

- message max length
- note edit-history detail
- attachment storage backend
- event log retention detail
- precise upload UI polishing
- file storage implementation detail
- advanced dashboard behavior

## 5. 권장 작성 순서

다음 로직 명세는 기능 인기도가 아니라 **의존 관계** 기준으로 써야 한다.

### 5.1 Case Management logic spec first

왜 먼저인가:

- 이 시스템의 중심이기 때문이다.
- Customer Portal, Safety Intelligence, Commerce Integration이 모두 이쪽으로 흘러든다.
- inquiry lifecycle, 상태 전환, 담당자 처리, 재오픈, context assembly가 모두 여기 속한다.

포함해야 할 것:

- inquiry 생성
- 상태 전환 규칙
- 재오픈 처리
- 담당자 및 concurrency rule
- `case_context_bundle`
- order/product/customer snapshot 누락 시 처리

### 5.2 Customer Portal / Handoff logic spec second

왜 두 번째인가:

- Customer flow는 case를 만들거나 feed하지만, case state를 소유하지는 않는다.
- 안정적인 case 생성과 visible-state semantics에 의존한다.

포함해야 할 것:

- customer inquiry 생성
- customer message append rule
- chatbot-to-inquiry handoff
- customer-visible state mapping
- auto-expire candidate flow

### 5.3 Conversation / Attachments logic spec third

왜 세 번째인가:

- portal, workspace, chatbot 모두가 공유하는 층이기 때문이다.
- automation logic을 더 깊게 쓰기 전에 message/attachment invariants가 먼저 안정되어야 한다.

포함해야 할 것:

- message write/read rule
- `content_raw` / `content_display`
- attachment validation
- preview fallback
- deletion/retention hook

### 5.4 Safety Intelligence / Knowledge logic spec fourth

왜 네 번째인가:

- 안정된 conversation input에 의존한다.
- signal과 knowledge를 제공하지만, 최종 inquiry state는 소유하지 않아야 한다.

포함해야 할 것:

- summary regeneration rule
- abuse detection flow
- knowledge-file selection rule
- chatbot answer boundary
- handoff linkage

### 5.5 Commerce Integration logic spec fifth

왜 다섯 번째인가:

- 중요하지만, core case logic은 외부 sync detail이 모두 완성되기 전에도 먼저 쓸 수 있다.
- 현재 workspace도 stale/missing snapshot을 허용하는 방향이다.

포함해야 할 것:

- canonical integration event
- ACL translation rule
- idempotent snapshot upsert
- manual resync behavior
- stale/missing snapshot handling

### 5.6 Metrics / Search logic spec last

왜 마지막인가:

- lifecycle, timestamp, exclusion, integration assumption에서 파생되기 때문이다.
- 운영 로직이 먼저 안정된 뒤 쓰는 것이 가장 좋다.

포함해야 할 것:

- KPI derivation rule
- event-time aggregation
- period preset / timezone
- exclusion rule
- list / sort / read-model behavior

## 6. 지금 당장 실무적으로 해야 할 순서

가장 실용적인 다음 순서는 아래와 같다.

1. active baseline 최종 cleanup
2. naming / cross-cutting rule freeze note 작성
3. `Case Management` 로직 단위 상세 명세 시작
4. 이후 위 순서대로 확장

## 7. 다음 단계 작업 규칙

logic-level spec을 쓰는 동안은 아래 원칙을 따른다.

- 이미 안정된 product decision은 실제 충돌이 없는 한 다시 열지 않는다.
- local unresolved item은 가능하면 해당 spec 안에서 해결한다.
- 여러 context에 동시에 영향을 주는 이슈만 cross-document decision으로 올린다.

## 8. 최종 권장

이 저장소는 이제 다음 단계로 넘어갈 준비가 되어 있다.

완벽하게 모든 것이 끝났기 때문이 아니라, 남은 open item이 대부분 **localized** 되었기 때문이다.

따라서 다음 단계는 다음처럼 가는 것이 가장 적절하다.

> **짧은 cleanup -> 의존 관계 순서의 logic specs -> 각 spec 내부에서 local rule 해소**
