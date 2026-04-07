# 로직 단위 상세 명세 작성 전 현재 기준선 검토

## 1. 검토 범위

이 검토는 현재 활성(active) 문서와 `immediate-mvp-notes.md`만을 기준으로 수행했다.

- `docs/ddd/active/*`
- `docs/specifications/active/*`
- `immediate-mvp-notes.md`

archive/history 문서는 사용하지 않았다.

## 2. 전체 판단

현재 기준선은 **로직 단위 상세 명세를 곧 시작할 수 있을 만큼 충분히 강해졌지만**, 아직 완전히 정리된 상태는 아니다.

전략 방향, 제품 구조, 데이터 소유권 분리, 핵심 문의 lifecycle, 챗봇 handoff 구조, 고객/운영자 분리, KPI 기준선, 웹훅 중심 동기화 모델은 이미 깊은 명세 작성이 가능할 만큼 안정적이다.

남아 있는 약점은 주로 아래 세 가지다.

1. 일부 문서에 남아 있는 오래된 unresolved marker
2. 한 번 더 정리해야 하는 cross-cutting rule
3. 아키텍처 차원의 blocker가 아니라, 로컬 구현 파라미터 수준으로 내려온 세부 미정 항목

즉,

> 이 프로젝트는 더 이상 아키텍처/정책 레벨에서 막힌 상태는 아니지만, 로직 명세가 여러 문서로 갈라지기 전에 한 번 더 review-and-cleanup을 거치면 훨씬 안정적이다.

## 3. 이미 충분히 안정된 부분

### 3.1 전략 아키텍처

- active DDD 문서에서 6개 bounded context가 명확히 정의되어 있다.
- 프로젝트 방향은 일관되게 **Modular Monolith**다.
- `Commerce Integration`은 내부 case 소유권과 분리되어 있다.
- 외부 커머스 데이터에 대한 ACL 경계도 이미 기준선에 포함되어 있다.

### 3.2 제품 및 사용자 구조

- 고객 앱과 운영자 앱은 2개의 앱 엔트리로 분리되어 있다.
- 두 앱은 하나의 backend, 하나의 domain model, 하나의 storage boundary를 공유한다.
- 고객 접근은 회원 전용으로 고정되어 있다.
- MVP 운영자 역할은 의도적으로 단일 운영자 역할로 단순화되어 있다.

### 3.3 데이터 소유권 및 메시지 구조

- `customer/order/product`는 외부 원본 snapshot으로 취급된다.
- `inquiry`, `inquiry_message`, `chatbot_session`, `chat_message`, `internal_note`, 자동화 결과는 내부 원본이다.
- `content_raw` / `content_display` 분리가 고정되어 있다.
- `chatbot_session`은 `inquiry`와 분리되어 있고, handoff 시 즉시 `inquiry`를 생성한다.

### 3.4 Lifecycle 및 자동화

- Inquiry lifecycle은 5개 상태로 좁혀졌다.
  - `OPEN`
  - `WAITING`
  - `IN_PROGRESS`
  - `ON_HOLD`
  - `RESOLVED`
- 자동화 범위는 아래로 의도적으로 제한되어 있다.
  - 요약
  - 사전 기반 악성 표현 감지
  - 스토어 정보 기반 챗봇
- 광범위한 답변 추천 / 생성형 상담 대체는 MVP 범위 밖이다.

### 3.5 지표 및 동기화 기준선

- KPI 세트가 이미 고정되어 있다.
  - 문의 수
  - 평균 첫 응답 시간
  - 해결 완료율
- 웹훅 중심 동기화와 개체 단위 수동 재동기화가 이미 고정되어 있다.
- 검색/필터와 운영 지표도 사용 가능한 수준의 기준선을 갖췄다.

## 4. 아직 일관성을 해칠 수 있는 부분

이 항목들은 넓은 아키텍처 blocker는 아니지만, 로직 명세를 곧바로 시작하면 재작업 위험이 생길 수 있는 지점들이다.

### 4.1 용어 드리프트

DDD 문서는 `support case` / `conversation` 쪽으로 기울어져 있지만, active 구현 명세는 여전히 `inquiry`, `inquiry_message`, `chat_message` 중심이다.

이건 당장 구현을 막지는 않지만, 이후 로직 문서에서 aggregate, command, event, naming convention을 더 깊게 정의하기 시작하면 drift를 만들 수 있다.

### 4.2 Lifecycle edge rule

주 상태 모델은 안정적이지만, 아래 edge behavior는 아직 지역적으로 열려 있다.

- 재오픈 시 담당자 유지 여부
- hold reason code
- resolve reason code
- duplicate inquiry 관계 처리
- 운영자 동시 응답 충돌 처리
- 상태 변경 직전 새 메시지 도착 처리

이 항목들은 전체 다음 단계를 막지는 않지만, 해당 로직 명세 안이나 직전에 정리되어야 한다.

### 4.3 Privacy / governance detail

방향은 안정적이지만, 정확한 구현 규칙은 아직 완전히 닫히지 않았다.

- 민감 필드 목록
- 보관 기간
- 삭제 vs 익명화 정책
- 감사 로그 범위
- 일부 raw-content 접근 / 파일 처리 detail

### 4.4 Integration contract detail

Integration 경계는 개념적으로 강하지만, contract 수준에서는 아직 덜 내려왔다.

- 외부 시스템 실제 형태
- snapshot 필드 반영 범위
- 삭제 이벤트 처리 방식
- retry interval/backoff 정책
- 이벤트 로그 보관 기간

### 4.5 약한 TODO 흔적

active 문서들은 이전보다 훨씬 정리되었지만, 실제로는 이미 결정된 항목이 여전히 “추가 정의 필요”로 남아 있을 가능성이 있다.

이런 흔적들은 logic spec이 하나의 truth를 상속받도록, 짧은 reconciliation pass에서 정리하는 것이 좋다.

## 5. 안전하게 뒤로 미뤄도 되는 것

다음 항목들은 다음 단계 전체를 막지 않고, 후속 또는 개별 logic spec 안에서 다뤄도 된다.

- 문서 물리적 재배치
- 파일 저장소 vendor 선택
- 법적 보관 구현 detail
- 영상 정책 (현재 핵심 MVP 이미지 흐름 밖)
- 고급 BI / SLA 대시보드
- 다중 운영자 역할 확장

## 6. 로직 명세 전 최소 정리 권장 사항

이건 로직 단위 상세 명세를 본격적으로 쓰기 전에 최소한으로 권장하는 cleanup 세트다.

### 6.1 내부 기준 용어 1회 고정

다음 용어를 다음 단계 문서에서 어떻게 사용할지 고정할 필요가 있다.

- `support case`
- `inquiry`
- `conversation`
- `chatbot_session`

핵심은 지금 당장 전체 이름을 다 바꾸는 것이 아니라, 이후 로직 문서들이 혼합된 용어를 쓰지 않도록 막는 것이다.

### 6.2 cross-cutting local rule 1회 정리

여러 문서에 반복될 shared rule은 한 번 정리하는 편이 낫다.

- lifecycle edge rule
- privacy/governance detail
- webhook retry interval / delete handling
- test inquiry exclusion
- timezone / date preset rule

### 6.3 stale unresolved marker 제거

이미 결정된 항목이 여전히 TBD처럼 남아 있지 않도록 한 번 더 정리하는 것이 좋다.

## 7. 실무적 결론

현재 기준선은 더 이상 raw 상태가 아니다.

이미 로직 단위 상세 명세 작성을 지탱할 만큼 안정적인 구조를 갖췄고, 남은 것은 대규모 prerequisite 탐색이 아니라 짧은 reconciliation phase와 dependency-aware writing이다.

가장 현실적인 해석은 이렇다.

> 이제 다음 단계로 넘어가도 되지만, 지금 active 기준선을 마지막으로 한 번 더 다듬고 들어가는 편이 훨씬 안전하다.
