# Safety Intelligence / Knowledge API 상세 명세

## 1. 문서 목적

본 문서는 `Safety Intelligence / Knowledge` 로직을 HTTP/API 계약으로 번역한 명세를 정의한다.

이 문서는 기존 endpoint의 전체 계약을 다시 소유하지 않는다. 이미 `Case Management API`, `Customer Portal / Handoff API`, `Conversation / Attachments API`가 소유하는 inquiry/chatbot/message endpoint 위에서 **summary / detection / knowledge asset API 공통 계약만 표준화**하며, conversation lifecycle과 handoff execution의 최종 authority는 각 소유 문서를 우선 기준으로 유지한다.

이 문서가 직접 다루는 범위는 아래와 같다.

- summary 생성 / 재생성 API
- abuse detection 결과 조회 API
- FAQ / policy / preset 조회 API
- chatbot knowledge file 업로드 / 목록 API
- handoff support signal API 표현 규칙
- degraded / failure-tolerant 응답 규칙
- operator-facing / customer-facing 노출 차이

이 문서는 아래를 직접 다루지 않는다.

- inquiry 상태 lifecycle 자체
- handoff 실행 API 자체
- chatbot answer generation 내부 구현
- DB 구현 상세
- UI 컴포넌트 구조

## 2. Scope and Ownership

## 2.1 직접 다루는 것

- endpoint 정의
- request / response shape
- knowledge asset retrieval contract
- summary / detection 응답 규칙
- knowledge file upload / list contract
- validation / rejection response
- degraded / partial failure response 규칙

## 2.2 직접 다루지 않는 것

- inquiry / chatbot session lifecycle 최종 authority
- conversation message endpoint 자체
- handoff execution 자체
- DB 테이블 구현
- attachment API 자체

## 3. API Domain Split

## 3.1 Summary / Detection API

### 역할
- inquiry 또는 chatbot session에 대한 요약/감지 보조 결과를 생성하거나 조회하는 API

### 포함 기능
- summary 생성
- summary 재생성
- summary 조회
- abuse detection 결과 조회

### 특징
- summary는 owner당 최신 1개만 유지
- regeneration은 overwrite
- detection 결과는 참고 신호이며 최종 authority가 아님

## 3.2 Knowledge Asset API

### 역할
- FAQ / policy / preset / knowledge file 자산을 조회하고 선택하는 API

### 포함 기능
- FAQ 목록 조회
- policy 목록 조회
- preset 목록 조회
- active knowledge file 목록 조회

### 특징
- knowledge asset은 store 범위에서 조회
- inactive asset은 기본 후보에서 제외 가능
- operator support / chatbot support 양쪽에 근거 자산을 제공

## 3.3 Knowledge File Management API

### 역할
- operator가 knowledge file을 업로드하고 현재 active set을 관리하는 API

### 포함 기능
- 다중 knowledge file 업로드
- active knowledge file 목록 조회
- 파일별 성공/실패 결과 반환

### 특징
- `.txt` only
- file당 최대 3MB
- 다중 활성 허용
- 충돌 시 최신 업로드 파일 우선

## 3.4 경계 규칙

- summary/detection API는 conversation raw 저장을 다시 소유하지 않는다.
- knowledge asset API는 최종 응답 authority를 가지지 않는다.
- handoff support signal은 제공할 수 있지만 handoff 실행 자체는 소유하지 않는다.

## 4. Resource Set

## 4.1 Summary / Detection resources

- `POST /operator/inquiries/{id}/summary`
- `POST /operator/chatbot-sessions/{id}/summary`
- `GET /operator/inquiries/{id}/summary`
- `GET /operator/chatbot-sessions/{id}/summary`
- `GET /operator/inquiries/{id}/abuse-detection`
- `GET /operator/chatbot-sessions/{id}/abuse-detection`

## 4.2 Knowledge asset resources

- `GET /operator/knowledge/faq-articles`
- `GET /operator/knowledge/policy-documents`
- `GET /operator/knowledge/response-presets`
- `GET /operator/chatbot-knowledge-files`

## 4.3 Knowledge file management resources

- `POST /operator/chatbot-knowledge-files`
- `GET /operator/chatbot-knowledge-files?active_only=true`

## 4.4 Handoff support expression

- handoff support signal은 기존 inquiry/chatbot detail response 안의 보조 field로 표현하는 것이 기본이다.
- 현재 MVP에서는 별도 handoff-management endpoint를 새로 정의하지 않고, 기존 handoff owning API에 연결되는 projection 성격만 가진다.

## 5. Common API Rules

## 5.1 인증 / 권한 규칙

### operator API
- 세션 기반 인증 필요
- operator role 필요

### customer-facing exposure
- customer는 최종 summary/detection 내부 결과를 직접 관리하지 않는다.
- customer-facing 흐름에는 display 결과 또는 handoff suggestion 수준만 제한적으로 반영된다.

## 5.2 응답 기본 구조

기본 응답 형태:

- `data`
- `meta`
- `error`

## 5.3 raw / display 반환 규칙

- 기본 출력은 `content_display` 기준이다.
- summary/detection API가 raw conversation 자체를 다시 반환하지는 않는다.
- raw visibility는 허용된 customer-visible conversation scope 안에서만 별도 action 또는 상위 endpoint를 통해 노출한다.

## 5.4 degraded / failure-tolerant 반환 규칙

- summary 실패는 summary 영역만 비어 있을 수 있다.
- detection 실패는 detection 영역만 degraded 될 수 있다.
- knowledge file 일부 업로드 실패는 해당 파일만 실패로 표시된다.
- 전체 inquiry/chatbot 흐름은 계속 유지된다.

## 5.5 knowledge file 입력 규칙

- `.txt`만 허용
- file당 최대 3MB
- 다중 파일 업로드 가능
- 기존 active set은 실패 파일 때문에 롤백되지 않는다.

## 5.6 validation / rejection HTTP 규칙

- `400` validation error
- `403` forbidden
- `404` not found
- `409` conflict (필요 시)

## 5.7 projection 반환 규칙

- operator-facing projection은 summary/detection/knowledge provenance를 더 풍부하게 받을 수 있다.
- customer-facing 흐름에는 직접적인 내부 판단 데이터 노출을 최소화한다.

## 6. Request / Response Shape

## 6.1 `POST /operator/inquiries/{id}/summary`

### request shape 예시
```json
{
  "mode": "GENERATE"
}
```

### response shape 예시
```json
{
  "data": {
    "summary": {
      "owner_type": "INQUIRY",
      "owner_id": "inq_123",
      "summary_text": "배송 지연 문의이며 고객은 오늘 중 안내를 요청하고 있습니다.",
      "generated_at": "2026-04-06T11:00:00+09:00"
    }
  },
  "meta": {
    "regenerated": false
  },
  "error": null
}
```

## 6.2 `POST /operator/chatbot-sessions/{id}/summary`

### request shape 예시
```json
{
  "mode": "REGENERATE"
}
```

### 핵심 원칙
- regeneration은 현재 전체 대화 기준 overwrite다.

### response shape 예시
```json
{
  "data": {
    "summary": {
      "owner_type": "CHATBOT_SESSION",
      "owner_id": "cbs_1",
      "summary_text": "고객이 배송 예정일과 환불 가능 여부를 반복 질문함.",
      "generated_at": "2026-04-06T11:05:00+09:00"
    }
  },
  "meta": {
    "regenerated": true
  },
  "error": null
}
```

## 6.3 `GET /operator/inquiries/{id}/summary`

### response shape 예시
```json
{
  "data": {
    "summary": {
      "owner_type": "INQUIRY",
      "owner_id": "inq_123",
      "summary_text": "고객은 상품 오배송 의심 상황을 설명했고 교환 가능 여부를 묻고 있습니다.",
      "generated_at": "2026-04-06T11:10:00+09:00",
      "source_scope_kind": null
    }
  },
  "meta": null,
  "error": null
}
```

## 6.4 `GET /operator/inquiries/{id}/abuse-detection`

### response shape 예시
```json
{
  "data": {
    "abuse_detection_result": {
      "owner_type": "INQUIRY",
      "owner_id": "inq_123",
      "detection_status": "DETECTED",
      "detected_category_set": ["INSULT"],
      "severity": "MEDIUM",
      "masked_segment_summary": "일부 표현이 완화되었습니다.",
      "analyzed_at": "2026-04-06T11:12:00+09:00"
    }
  },
  "meta": {
    "raw_available": true
  },
  "error": null
}
```

## 6.5 `GET /operator/knowledge/faq-articles`

### query 예시
- `store_id`
- `active_only`
- `q`

### response shape 예시
```json
{
  "data": [
    {
      "faq_article_id": "faq_1",
      "title": "배송 기간은 얼마나 걸리나요?",
      "is_active": true,
      "updated_at": "2026-04-06T09:00:00+09:00"
    }
  ],
  "meta": null,
  "error": null
}
```

## 6.6 `GET /operator/knowledge/policy-documents`

### response shape 예시
```json
{
  "data": [
    {
      "policy_document_id": "pol_1",
      "policy_type": "REFUND",
      "title": "환불 정책",
      "is_active": true,
      "updated_at": "2026-04-06T09:10:00+09:00"
    }
  ],
  "meta": null,
  "error": null
}
```

## 6.7 `GET /operator/knowledge/response-presets`

### response shape 예시
```json
{
  "data": [
    {
      "response_preset_id": "pre_1",
      "preset_title": "배송 지연 기본 응답",
      "is_active": true,
      "updated_at": "2026-04-06T09:20:00+09:00"
    }
  ],
  "meta": null,
  "error": null
}
```

## 6.8 `POST /operator/chatbot-knowledge-files`

### request shape 예시
```json
{
  "files": [
    {
      "file_name": "store-info.txt",
      "mime_type": "text/plain",
      "file_size": 1204
    },
    {
      "file_name": "product-guide.txt",
      "mime_type": "text/plain",
      "file_size": 2048
    }
  ]
}
```

### response shape 예시
```json
{
  "data": {
    "results": [
      {
        "file_name": "store-info.txt",
        "upload_status": "UPLOADED",
        "is_active": true
      },
      {
        "file_name": "product-guide.txt",
        "upload_status": "FAILED",
        "is_active": false
      }
    ]
  },
  "meta": {
    "active_file_count": 3
  },
  "error": null
}
```

### 핵심 원칙
- 일부 파일 실패가 전체 active set rollback을 의미하지 않는다.

## 6.9 `GET /operator/chatbot-knowledge-files`

### query 예시
- `store_id`
- `active_only`

### response shape 예시
```json
{
  "data": [
    {
      "chatbot_knowledge_file_id": "kf_1",
      "file_name": "store-info.txt",
      "file_size": 1204,
      "upload_status": "UPLOADED",
      "is_active": true,
      "uploaded_at": "2026-04-06T10:00:00+09:00"
    }
  ],
  "meta": null,
  "error": null
}
```

## 7. Validation / Rejection Case Detail

## 7.1 `400 Bad Request`

적용 예:

- summary 대상 owner type 불일치
- `.txt`가 아닌 knowledge file 업로드
- knowledge file 3MB 초과
- 지원하지 않는 policy type 검색값

## 7.2 `403 Forbidden`

적용 예:

- operator role 없는 knowledge asset 수정/조회 시도
- 허용되지 않은 raw/detection 내부 결과 접근 시도

## 7.3 `404 Not Found`

적용 예:

- 존재하지 않는 inquiry/session summary 조회
- 존재하지 않는 knowledge asset 조회

## 7.4 `409 Conflict`

적용 예:

- 필요 시 동일 owner에 대한 중복 summary 생성 경쟁
- 동시 업로드 처리 중 application-level 충돌

## 7.5 degraded / partial failure는 전체 오류가 아님

- summary 실패는 summary 영역만 비워질 수 있다.
- detection 실패는 `ANALYSIS_FAILED` 상태로 반환될 수 있다.
- 일부 knowledge file 실패는 per-file 결과로만 표현한다.

## 8. Projection Detail

## 8.1 Summary projection

### 최소 필드
- `owner_type`
- `owner_id`
- `summary_text`
- `generated_at`
- `source_scope_kind`

## 8.2 Abuse detection projection

### 최소 필드
- `detection_status`
- `detected_category_set`
- `severity`
- `masked_segment_summary`
- `analyzed_at`

## 8.3 Knowledge set projection

### 최소 필드
- active knowledge file 목록
- `file_name`
- `file_size`
- `upload_status`
- `uploaded_at`

## 8.4 FAQ / policy / preset reference projection

- 참조 가능한 FAQ 목록
- 관련 policy document 목록
- response preset 후보 목록

## 8.5 Handoff support projection

- self-service 한계 여부
- handoff 권고 가능 여부
- linked chatbot summary 존재 여부

## 8.6 Failure-tolerant projection rule

- summary 실패는 summary 영역만 degraded
- detection 실패는 detection 영역만 degraded
- knowledge upload 실패는 해당 파일만 실패
- 전체 inquiry/chatbot 흐름은 계속 유지

## 9. Local Detail Candidates

아래는 현재 baseline을 막는 핵심 rule은 아니며, 이후 필요 시 보강 가능한 local detail이다.

- `source_scope_kind` API 표현 세부
- detection category naming 세부
- knowledge asset search query 세부
- handoff support signal wording
- knowledge provenance field naming
