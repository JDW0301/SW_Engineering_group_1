# 로직 단위 상세 명세 전 정합성 고정 노트

## 1. 목적

이 문서는 앞으로 작성할 로직 단위 상세 명세에서 공통 기준으로 삼아야 할 shared rule과 canonical interpretation을 고정한다.

이 문서는 active 명세 문서 자체를 대체하지 않는다. 여러 downstream logic spec 사이에서 drift를 줄이기 위한 cross-cutting consistency note다.

## 2. 이 문서의 상태

- 범위: 현재 프로젝트 기준선, 로직 단위 명세 작성 직전
- 기준 소스:
  - `docs/ddd/active/*`
  - `docs/specifications/active/*`
  - `immediate-mvp-notes.md`
- 우선순위: active 문서 여러 곳에 같은 결정이 다르게 표현되어 있을 때 reconciliation layer로 사용한다.

## 3. canonical terminology

## 3.1 Core case term

- 구현 기준의 canonical term은 여전히 **`inquiry`**다.
- `support case`는 전략/DDD 설명에서는 사용할 수 있지만, downstream logic spec에서는 글로벌 rename이 있기 전까지 명시적으로 **`inquiry`**에 매핑해서 사용한다.

### 작성 규칙

- 전략 설명: `support case (inquiry)` 허용
- 로직/데이터/애플리케이션 명세: `inquiry` 우선

## 3.2 Conversation term

- `inquiry_message`: 사람 상담 inquiry 흐름 내부 메시지
- `chat_message`: `chatbot_session` 내부 메시지
- `conversation`: 일반적 개념어로는 허용되지만, 현재 구현 기준선에서 primary persisted entity name으로 쓰지 않는다.

## 3.3 Chatbot handoff term

- `chatbot_session`은 `inquiry`와 분리된 top-level entity다.
- Handoff는 **기존 chatbot session에 연결된 inquiry를 새로 만드는 것**이지, chatbot session 자체를 inquiry로 변환하는 것이 아니다.

## 4. 제품 및 구조 고정

- 앱 엔트리 2개
  - customer app
  - operator app
- backend/domain/storage boundary는 하나
- customer access는 member-only
- MVP operator role은 단일 운영자 역할

위 항목은 downstream logic spec에서 다시 열지 않는 고정 baseline assumption으로 본다.

## 5. 데이터 소유권 고정

## 5.1 External source of truth

- `customer`, `order`, `product`는 외부 원본 snapshot이다.
- 이 시스템의 로컬 데이터는 운영용 snapshot일 뿐이다.

## 5.2 Internal source of truth

- `inquiry`
- `inquiry_message`
- `chatbot_session`
- `chat_message`
- `internal_note`
- `ai_summary`
- `abuse_detection_result`
- `handoff_event`

위 항목은 내부 원본이며, 외부 authoritative data로 취급하지 않는다.

## 6. Lifecycle 고정

## 6.1 Inquiry state

MVP inquiry state의 canonical set은 아래와 같다.

- `OPEN`
- `WAITING`
- `IN_PROGRESS`
- `ON_HOLD`
- `RESOLVED`

이후 문서에서 새로운 운영 상태 enum을 추가하는 것은 새로운 cross-document decision이 아닌 한 금지한다.

## 6.2 Automation과 state의 관계

- Automation은 suggest, summarize, detect, handoff trigger는 가능하다.
- Automation은 최종 inquiry-state authority를 직접 가지지 않는다.

## 6.3 Reopen / edge-case rule 상태

아래 항목은 아직 local unresolved item이며, 해당 logic spec 안에서 명시적으로 정리해야 한다.

- 재오픈 시 담당자 유지 여부
- hold reason code
- resolve reason code
- duplicate/linked inquiry 처리
- 운영자 동시 응답 충돌 처리

이건 다시 아키텍처를 여는 문제가 아니라, local rule을 신중히 써야 하는 문제다.

## 7. Content visibility 고정

## 7.1 Raw/display split

- `content_raw`와 `content_display`는 둘 다 canonical이다.
- 기본 UI/API 출력은 `content_display`를 사용한다.
- raw visibility는 customer-visible conversation scope에만 허용되며, internal-only data에는 적용하지 않는다.

## 7.2 Raw content visibility boundary

customer와 operator는 customer-visible conversation scope 안에서만 raw content를 볼 수 있다.

아래 항목은 raw visibility 대상에서 제외한다.

- internal note
- internal operational judgment data
- internal processing-only intermediate data

## 8. Attachment 고정

- customer attachment 허용
- image only
- 허용 형식:
  - `jpg`
  - `jpeg`
  - `png`
- 최대 크기: 이미지 1개당 5MB
- 최대 개수: 메시지당 3장
- preview behavior:
  - 대화 내부 썸네일
  - 클릭 시 확대
  - preview 실패 시 다운로드만 제공

영상, 문서, 기타 파일은 현재 MVP 범위 밖이다.

## 9. Summary 및 automation 고정

## 9.1 Summary policy

- `inquiry` 또는 `chatbot_session`당 active summary 1개
- 재생성 시 이전 summary는 덮어쓰기
- 재생성은 현재 전체 대화 기준
- MVP에서는 summary history를 보관하지 않음

## 9.2 Abuse detection policy

- LLM judgment가 아니라 dictionary-based detection
- detection은 raw storage를 바꾸지 않고 기본 display behavior를 조정한다.

## 9.3 Chatbot knowledge-file policy

- 파일 형식: `.txt`만
- 최대 크기: 파일당 3MB
- 여러 파일 동시 활성 허용
- 충돌 시 최신 업로드 파일 우선
- 업로드 실패 시 기존 활성 파일 집합 유지
- 학교 프로젝트 MVP 기준으로 활성 파일 개수 제한 없음

## 9.4 Knowledge-file upload UI policy

- 다중 파일 업로드 지원
- 운영자는 현재 활성 파일 목록을 확인 가능
- 업로드 결과는 파일별 성공/실패를 개별 표시

## 10. Handoff 및 auto-expiry 고정

## 10.1 Handoff rule

- customer는 chatbot에서 언제든 handoff 요청 가능
- handoff는 즉시 `inquiry` 생성
- 연결된 chatbot context는 operator가 확인 가능해야 함

## 10.2 Auto-expiry rule

Auto-expiry는 아래에만 적용한다.

- `chatbot_session`
- chatbot handoff로 생성된 inquiry

그리고 아래 조건을 모두 만족할 때만 적용한다.

- meaningful chatbot record가 없음
- 추가 customer message가 없음

### 시간값

- Auto-expiry 시간은 **10분**으로 고정

일반 inquiry에는 auto-expiry를 적용하지 않는다.

## 11. Auth/session 고정

- MVP 인증 방식은 세션 기반
- 세션은 브라우저 종료 시 만료
- 현재 MVP 범위에서는 inactivity timeout을 두지 않음
- 세션 유실 후 재진입 시 로그인 페이지로 유도

이건 MVP 단순화 정책이며, 실제 서비스 배포 단계에서는 재검토 대상이다.

## 12. Search 및 metrics 고정

## 12.1 Search scope

운영자 검색은 아래 필드를 지원한다.

- customer name
- order number
- inquiry status
- inquiry type
- period
- product name

## 12.2 Period 및 timezone

기본 기간 프리셋:

- 오늘
- 최근 7일
- 최근 30일

Timezone baseline:

- `Asia/Seoul`

## 12.3 KPI interpretation

고정 KPI 세트:

- inquiry count
- average first response time
- resolution rate

### KPI exclusion

- auto-expired inquiry 제외
- `is_test=true` inquiry 제외

### KPI UI rule

- average first response time: 시간/분 자동 변환
- 0건일 때:
  - inquiry count = `0`
  - average first response time = `-`
  - resolution rate = `-`

## 13. Webhook 고정

## 13.1 Integration event posture

- Webhook-first snapshot sync가 기본 메커니즘
- Manual resync는 operator-triggered, entity-scoped

## 13.2 Validation posture

- 현재 학교 프로젝트 MVP 범위에서는 webhook authenticity validation을 생략
- 이는 production recommendation이 아님

## 13.3 Retry posture

- Retry count: 3
- Retry interval: 1분 / 1분 / 1분

## 14. 이 문서가 아직 고정하지 않는 것

이 노트는 아래 local implementation topic까지 완전히 닫지는 않는다.

- retention window 값
- delete vs anonymize 구현 detail
- 정확한 sensitive-field inventory
- 고정 MVP rule을 넘는 retry backoff sophistication
- attachment storage vendor choice
- video policy
- message max length
- exact concurrency resolution mechanics

이 항목들은 multiple document contradiction으로 커지지 않는 한, 각 downstream logic spec 안에서 정리한다.

## 15. 사용 규칙

downstream logic-level spec이 아래 두 상황을 동시에 볼 때:

1. 오래된 active 문서 section 안의 stale unresolved marker
2. 이 노트에서 이미 고정된 decision

active source section이 명시적으로 업데이트되기 전까지는, 이 노트의 frozen rule을 temporary canonical baseline으로 사용한다.
