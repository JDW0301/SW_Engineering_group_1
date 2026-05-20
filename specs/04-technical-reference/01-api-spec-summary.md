# API 명세 요약

## 목적

이 문서는 프로젝트 구현에 필요한 주요 API 묶음을 정리한다.

의도적으로 happy-path 중심으로 작성한다.

## 문의 API

- 문의 생성
- 문의 목록 조회
- 문의 상세 조회
- 고객 메시지 추가
- 운영자 메시지 추가
- 메시지 첨부 추가
- 내부 메모 추가
- 문의 상태 변경

새 고객 메시지에 따라 문의가 다시 열리는 동작은 별도 핵심 API라기보다 문의 상태 규칙의 일부로 이해한다.

현재 구현된 문의/상담 관련 API는 아래 흐름을 기준으로 한다.

| Method | Path | 화면 목적 |
|---|---|---|
| `GET` | `/api/customer/inquiries` | 고객 내 문의 목록 조회 |
| `POST` | `/api/customer/inquiries` | 고객 새 문의 작성 |
| `GET` | `/api/operator/workspace` | 운영자 주문/상담/문의 workspace 조회 |
| `POST` | `/api/operator/inquiries/{inquiry_id}/replies` | 운영자 문의 답변 작성 |
| `GET` | `/api/operator/notes` | 운영자 내부 메모 조회 |
| `POST` | `/api/operator/notes` | 운영자 내부 메모 저장 |
| `GET` | `/api/support-sessions` | 고객/운영자 상담 세션 목록 조회 |
| `POST` | `/api/support-sessions` | 상담 세션 생성 |
| `GET` | `/api/support-sessions/{session_id}/messages` | 상담 메시지 조회 |
| `POST` | `/api/support-sessions/{session_id}/messages` | 상담 메시지 저장 |
| `PATCH` | `/api/support-sessions/{session_id}/status` | 상담 상태 변경 |

고객/운영자 상담 상세 화면은 같은 메시지 조회/저장 API를 사용한다. 화면에서는 상담 상세 진입 시 메시지를 조회하고, 진행 중 상담은 3초 간격 polling으로 새 메시지를 다시 불러온다.

## 고객 포털 API

- 고객 로그인
- 내 문의 목록 조회
- 내 문의 상세 조회
- 내 스토어 목록 조회
- 스토어 검색
- 주문 claim 후보 조회
- 주문 claim 요청
- claim 상태 조회
- 필요한 경우의 mock verification 요청
- mock verification 결과 확인

현재 고객 홈/스토어/주문 화면은 DB API를 우선 사용한다.

| Method | Path | 화면 목적 |
|---|---|---|
| `GET` | `/api/customer/home` | 고객 홈에 필요한 주문/스토어 요약 조회 |
| `GET` | `/api/customer/orders` | 고객 주문 목록 조회 |
| `GET` | `/api/customer/stores` | 고객이 이용한 스토어 목록 조회 |

## 챗봇 API

- 챗봇 세션 시작
- 챗봇 세션 조회
- 챗봇 메시지 추가
- 챗봇에서 handoff 요청

## 지식 자산 API

- FAQ 목록 조회
- 정책 문서 조회
- 응답 프리셋 조회
- 챗봇 지식 파일 업로드
- 활성 지식 파일 목록 조회

현재 구현된 지식/설정 API는 아래와 같다.

| Method | Path | 화면 목적 |
|---|---|---|
| `GET` | `/api/stores/{store_id}/faqs` | 스토어별 활성 FAQ 조회 |
| `GET` | `/api/operator/settings` | 운영자 스토어 설정/프리셋/FAQ/파일 조회 |
| `PATCH` | `/api/operator/settings` | 운영자 스토어 설정 저장 |
| `PUT` | `/api/operator/settings/presets` | 운영자 응답 프리셋 목록 저장 |
| `PUT` | `/api/operator/settings/faqs` | 운영자 FAQ 목록 저장 |
| `GET` | `/api/operator/settings/files` | 운영자 지식 파일 목록 조회 |
| `POST` | `/api/operator/settings/files` | 운영자 txt 지식 파일명과 원문 저장 |

FAQ 버튼 클릭은 AI API가 아니라 `/api/stores/{store_id}/faqs` 응답의 DB 답변을 바로 표시한다.

운영자 지식 파일은 `.txt` 업로드를 기준으로 하며, 요청에는 업로드한 원본 파일명과 txt 원문을 함께 보낸다. 화면에서는 저장된 원문으로 미리보기와 다운로드를 제공한다.

운영자 응답 프리셋과 FAQ 저장은 화면에 남아 있는 카드 목록을 한 번에 저장한다. FAQ는 고객 챗봇에 노출할 질문/답변 목록으로 사용한다.

## 안전 보조 및 요약 API

- 문의 요약 생성
- 챗봇 요약 생성
- 악성 표현 감지 실행 또는 최신 감지 결과 조회

## 검색 및 지표 API

- 문의 검색
- KPI 요약 조회

## 커머스 맥락 API

- 연결된 고객 snapshot 조회
- 연결된 주문 snapshot 조회
- 연결된 상품 snapshot 조회
- 수동 재동기화 요청
- 외부 customer snapshot과 로컬 계정 링크 조회

여기서 mock verification은 독립 핵심 기능이라기보다 claim 흐름 안의 보조 단계로 이해한다.

## API 설계 원칙

이 프로젝트의 API 문서는 아래를 우선해야 한다.

- 요청 목적이 분명할 것,
- 주요 입력 필드가 드러날 것,
- 주요 응답 형태가 보일 것,
- 화면에서 어떤 행동으로 이어지는지 이해될 것.

엔터프라이즈급 오류 카탈로그까지 완전히 작성할 필요는 없다.

추가로 인증 또는 검증 관련 API는 실제 통신사/본인확인 기관 연동이 아닌 학교 프로젝트용 mock provider를 기준으로 설명한다.
