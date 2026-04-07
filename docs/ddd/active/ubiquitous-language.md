# 용어집 초안 (Ubiquitous Language)

## 1. 목적

본 문서는 현재 프로젝트에서 의미 충돌이 쉬운 용어를 정리해, 문서/코드/UI/API에서 같은 단어를 같은 의미로 사용하기 위한 기준 초안이다.

## 2. 핵심 용어

| 용어 | 정의 | 비고 |
|---|---|---|
| Support Case | 사업자가 처리 대상으로 인식하는 문의 단위 | 기존 `inquiry`와 거의 동일하나 운영 의미를 강조 |
| Inquiry | 고객이 생성한 문의 레코드 | 고객 관점 표현 |
| Case Status | 문의의 처리 상태 | `OPEN`, `WAITING`, `IN_PROGRESS`, `ON_HOLD`, `RESOLVED` 후보 |
| Conversation | 고객-사업자 간 메시지 흐름 | inquiry message + chat message를 포괄하는 상위 개념 후보 |
| Internal Note | 고객 비노출 운영 메모 | Case Management 내부 개념 |
| Case Context | 문의 처리에 필요한 고객/주문/상품/이력/AI 정보 묶음 | 기존 `case_context_bundle`와 대응 |
| Knowledge Asset | FAQ, 정책 문서, 프리셋, 금지/예외 규칙 등 운영 지식 자산 | Knowledge Policy Context 용어 |
| Safety Signal | 악성 표현 감지 결과나 상담자 보호 관련 분석 신호 | Safety Intelligence Context 용어 |
| Handoff | AI/자동 응대에서 사람 상담으로 전환하는 사건 | 상태가 아니라 이벤트에 가깝다 |
| Commerce Snapshot | 외부 시스템에서 반영된 주문/상품/고객 데이터의 내부 표현 | 외부 원본과 구분 필요 |

## 3. 용어 충돌 정리

## 3.1 Inquiry vs Support Case

- 고객과 포털 문맥에서는 `inquiry`를 사용해도 된다.
- 사업자 운영 문맥에서는 `support case`가 더 정확하다.
- 내부 모델은 `Case Management` 기준으로 일관화하는 것을 권장한다.
- 현재 구현 명세와 DB/기존 문서에는 `inquiry`가 더 많이 남아 있으므로, 당분간은 `support case (inquiry)`처럼 병기하는 것이 안전하다.

## 3.2 Chat vs Conversation

- `chat`는 UI/전송 채널 중심 표현이다.
- `conversation`은 문의 안에서 오간 상호작용 전체를 의미한다.
- 채널이 바뀌어도 유지되는 개념은 `conversation`으로 보는 편이 좋다.

## 3.3 Policy vs Preset

- `policy_document`는 판단의 기준이다.
- `response_preset`은 빠른 입력을 위한 응답 템플릿이다.
- 둘을 같은 지식 자산으로 취급하되, 의미는 절대 섞지 않는다.

## 3.4 Abuse Detection vs Safety Assistance

- `abuse_detection`은 분석 기능 하나다.
- `safety_assistance`는 감지, 완화 표시, handoff 판단까지 포함하는 더 큰 개념이다.

## 4. 문서/코드 적용 원칙

- 도메인 문서에서는 `support case`, `case status`, `knowledge asset`, `handoff` 같은 상위 의미 용어를 우선 사용한다.
- DB/기존 명세와 연결할 때만 `inquiry`, `chat_message` 같은 기존 용어를 병기한다.
- 같은 단어를 사용자 관점과 운영자 관점에서 다르게 쓰지 않도록 주의한다.

## 5. 추가 정리 필요 용어

- `merchant_admin`와 `merchant_operator`의 실제 차이
- `customer portal`과 `inquiry board`의 구분
- `integration sync`와 `snapshot refresh`의 구분
