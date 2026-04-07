# Conversation / Attachments 로직 단위 상세 명세

## 1. 문서 목적

본 문서는 inquiry와 chatbot 흐름에서 공통으로 사용되는 메시지와 첨부 파일 로직을 정의한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- `inquiry_message`와 `chat_message`의 생성/검증 규칙
- `content_raw` / `content_display` 처리 기준
- attachment validation rule
- preview / fallback rule
- customer-visible / operator-visible 표현 경계
- message/attachment read projection 기준

이 문서는 아래를 직접 소유하지 않는다.

- inquiry lifecycle 자체
- chatbot answer generation 알고리즘 자체
- KPI 계산
- external snapshot sync

## 2. Scope and Ownership

## 2.1 직접 소유하는 것

- message content validation
- attachment validation
- `content_raw` / `content_display` 처리
- preview / fallback behavior
- message/attachment visibility boundary

## 2.2 직접 소유하지 않는 것

- inquiry 상태 전이
- chatbot 응답 생성 로직
- summary 생성 로직
- abuse detection 알고리즘 자체

## 3. Core Models

## 3.1 `inquiry_message`

- human-handled inquiry 내부 메시지
- customer / operator interaction의 사실 기록

### 핵심 속성 해석
- `inquiry_id`
- `sender_type`
- `content_raw`
- `content_display`
- `created_at`

## 3.2 `chat_message`

- `chatbot_session` 내부 customer / chatbot 메시지
- handoff 이전 self-service 맥락의 핵심 데이터

### 핵심 속성 해석
- `chatbot_session_id`
- `sender_type`
- `message_type`
- `content_raw`
- `content_display`
- `sent_at`

## 3.3 `attachment`

- 특정 message owner에 귀속된 파일 메타데이터

### 핵심 속성 해석
- `owner_type`
- `owner_id`
- `file_name`
- `mime_type`
- `file_size`
- `storage_key`
- `preview_status`
- `uploaded_by`

## 3.4 모델 해석 원칙

- `inquiry_message`와 `chat_message`는 저장 모델로 분리 유지한다.
- validation / rendering / preview / fallback rule은 이 문서에서 공통으로 정의한다.
- attachment는 독립 aggregate가 아니라 message에 귀속된 부속 자원으로 본다.
- `content_raw`와 `content_display`는 항상 함께 해석한다.

## 4. Commands / Actions

## 4.1 `AppendInquiryMessage`

### 의미
- inquiry 문맥에 메시지를 추가한다.

### 최소 입력
- `inquiry_id`
- `sender_type`
- `content_raw`
- attachment metadata (optional)

### 결과
- 새 `inquiry_message` 생성
- validation / display rendering 적용

## 4.2 `AppendChatMessage`

### 의미
- `chatbot_session` 문맥에 메시지를 추가한다.

### 최소 입력
- `chatbot_session_id`
- `sender_type`
- `message_type`
- `content_raw`
- attachment metadata (optional)

### 결과
- 새 `chat_message` 생성
- validation / display rendering 적용

## 4.3 `AttachFilesToMessage`

### 의미
- 특정 message에 attachment를 연결한다.

### 최소 입력
- `owner_type`
- `owner_id`
- file metadata set

### 결과
- attachment validation
- attachment metadata 저장

## 4.4 `RenderDisplayContent`

### 의미
- `content_raw`를 기본 출력용 `content_display`로 가공한다.

### 입력
- `content_raw`
- visibility scope
- abuse detection result (optional)

### 결과
- `content_display`

## 4.5 `RenderAttachmentPreview`

### 의미
- attachment를 썸네일 또는 확대 가능한 preview로 표시한다.

### 결과
- preview 가능 상태면 thumbnail 제공
- 실패 시 fallback 경로 제공

## 4.6 `DownloadAttachment`

### 의미
- preview 실패 또는 원본 확인 필요 시 attachment 원본 다운로드를 제공한다.

## 5. Content and Attachment Rules

## 5.1 Content input validation rule

- blank message 금지
- 저장 전 trim 적용
- trim 후 빈 문자열이면 거절
- customer/operator 메시지 최대 길이 2000자

internal note는 별도 소유 규칙을 가지며, 현재 기준선에서는 최대 길이 1000자를 따른다.

## 5.2 `content_raw` / `content_display` rule

- 저장 기준 원문은 `content_raw`
- 기본 출력은 `content_display`
- abuse detection / masking / 완화 결과는 `content_display`에 반영
- 원문 자체는 보존

## 5.3 Raw visibility boundary

- customer는 customer-visible scope 안에서 raw 확인 가능
- operator도 customer-visible 대화 범위의 raw 확인 가능
- 제외:
  - `internal_note`
  - internal operational judgment
  - internal processing intermediate data

## 5.4 Attachment validation rule

- customer attachment는 이미지 파일만 허용
- 허용 형식:
  - `jpg`
  - `jpeg`
  - `png`
- 이미지 1개당 최대 5MB
- 메시지당 최대 3장
- 영상/문서/기타 파일은 MVP 범위 제외

## 5.5 Owner binding rule

- attachment는 반드시 특정 message owner에 귀속되어야 한다.
- orphan attachment는 허용하지 않는다.

## 5.6 Preview rule

- 대화 안에서는 썸네일 표시
- 클릭 시 확대
- preview 실패 시 원본 다운로드 fallback만 제공

## 5.7 Rendering consistency rule

- customer-facing / operator-facing 기본 출력은 모두 `content_display`
- 필요 시 raw 확인 action 제공
- attachment도 visibility scope에 따라 노출 여부를 제한할 수 있다.

## 5.8 Shared rule between inquiry and chatbot

공통 규칙:

- blank 금지
- trim
- raw/display 분리
- image attachment 정책
- preview/fallback 정책

저장 모델은 분리되지만, 검증과 표현 규칙은 공유한다.

## 6. Preview / Fallback Flows

## 6.1 Attachment preview render flow

1. attachment owner(message) 확인
2. attachment metadata 조회
3. preview 지원 형식인지 확인
4. `preview_status` 확인
5. 가능하면 thumbnail 표시
6. user 클릭 시 확대 view 제공

## 6.2 Attachment expand flow

1. user가 thumbnail 클릭
2. 확대 가능한 resource 조회
3. 확대 view 표시
4. 닫기 후 timeline으로 복귀

## 6.3 Preview failure fallback flow

1. preview 시도
2. preview 생성 또는 로딩 실패
3. fallback 상태 표시
4. download action 제공
5. 원본 다운로드만 허용

## 6.4 Access scope in preview flow

- customer는 customer-visible message attachment만 preview 가능
- operator는 customer-visible attachment를 동일하게 preview 가능

## 7. Failure and Rejection Cases

## 7.1 Blank content rejection

- trim 후 빈 문자열이면 append 거절

## 7.2 Content length rejection

- customer/operator 메시지 2000자 초과 시 거절

## 7.3 Invalid attachment type rejection

- 이미지 외 형식 또는 `jpg/jpeg/png` 외 형식은 거절

## 7.4 Attachment size rejection

- 5MB 초과는 거절

## 7.5 Attachment count rejection

- 메시지당 3장 초과는 거절

## 7.6 Owner mismatch rejection

- 존재하지 않는 owner 또는 잘못된 owner binding은 거절

## 7.7 Preview failure

- preview 실패는 attachment 자체 실패가 아니라 preview 기능 실패다.
- 원본 다운로드는 계속 가능해야 한다.

## 7.8 Visibility mismatch

- customer-visible scope가 아닌 attachment를 customer projection에 포함하지 않는다.

## 7.9 Missing attachment resource

- metadata는 있지만 실제 저장 리소스를 찾을 수 없으면 preview 실패로 처리
- 다운로드도 불가하면 단순 오류 표시
- timeline 자체는 유지

## 8. Read Model / View Assembly

## 8.1 Inquiry message timeline projection

### 포함 요소
- `sender_type`
- `created_at`
- `content_display`
- raw 확인 action (필요 시)
- attachment thumbnail set
- attachment fallback 상태

## 8.2 Chatbot message timeline projection

### 포함 요소
- `sender_type`
- `message_type`
- `sent_at`
- `content_display`
- attachment thumbnail set
- raw 확인 action (필요 시)

## 8.3 Attachment projection

### 최소 포함 필드
- `file_name`
- `mime_type`
- `file_size`
- `preview_status`
- thumbnail availability
- download availability

## 8.4 Customer-visible projection rule

- customer-visible message만 포함
- 기본 출력은 `content_display`
- raw는 허용된 범위 안에서만 노출
- attachment는 썸네일 + 확대 + 다운로드 fallback

## 8.5 Operator-visible projection rule

- operator는 customer-visible message/attachment를 동일 규칙으로 볼 수 있다.
- 차이는 주변 context(case, summary, snapshot)가 더 붙는다는 점이다.

## 8.6 Failure-tolerant read assembly

- preview 실패는 timeline 전체 실패가 아니다.
- attachment 로딩 실패는 해당 attachment 수준의 degraded 처리로 본다.
- message 본문은 계속 보여야 한다.

## 8.7 Shared rendering consistency rule

- 같은 attachment / 같은 message는 customer view와 operator view에서 동일한 기본 preview 원칙을 따른다.

## 9. Local Detail Candidates

아래 항목은 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요한 경우 로컬 보강 가능하다.

- message max length를 더 세분화할지 여부
- preview thumbnail 크기 세부 기준
- attachment download 로그의 세부 범위
- internal-note attachment 정책을 별도로 둘지 여부
