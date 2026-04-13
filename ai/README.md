# AI 서버 (사장님 옆자리)

**담당**: 조규상 | **포트**: 8000 | **브랜치**: `ai`

---

## 실행 방법

```bash
# 1. LM Studio 실행 — Exaone 3.5-7.8b 로드 후 포트 1234 서버 시작

# 2. 의존성 설치 (최초 1회)
python -m venv venv
venv/Scripts/pip install -r requirements.txt

# 3. 서버 실행
venv/Scripts/python run_server.py
```

헬스 체크: `GET http://localhost:8000/health`

---

## 엔드포인트 요약

| 메서드 | 경로 | 기능 |
|--------|------|------|
| POST | /detect | 욕설 감지 |
| POST | /neutralize | 욕설 중립화 |
| POST | /classify | 문의 분류 |
| POST | /chatbot | 챗봇 응답 |
| POST | /chatbot/stream | 챗봇 SSE 스트리밍 |
| POST | /summarize | 대화 요약 |
| GET | /health | 서버 상태 |
| GET | / | 데모 페이지 |

자세한 명세: [API_SPEC.md](API_SPEC.md)

---

## 공유 필드명 (naming registry 기준)

> `specs/00-overview/05-shared-naming-registry.md` 와 동기화 필요

| 필드 | 엔드포인트 | 의미 | 상태 |
|------|-----------|------|------|
| `summary` | POST /summarize | AI 요약 결과 | ✓ 확정 |
| `category` | POST /classify | 문의 분류 결과 | ⚠ 미확정 (`classification` 후보와 팀 확인 필요) |
| `is_profanity` | POST /detect | 욕설 감지 여부 | ✓ 확정 |
| `original` | POST /neutralize | 원본 텍스트 (content_raw) | ✓ 확정 |
| `cleaned` | POST /neutralize | 필터링 텍스트 (content_display) | ✓ 확정 |
| `can_answer` | POST /chatbot/stream | HANDOFF 여부 | ✓ 확정 |

---

## 협업 규칙

### 브랜치 네이밍

```
feat/<topic>     예: feat/ai-message-summary
fix/<topic>      예: fix/detect-false-positive
docs/<topic>     예: docs/api-spec-update
```

- `main` 직접 push 금지 — 모든 작업은 PR로 merge
- 브랜치 범위: 하나의 기능 or 명확한 작업 단위

### 커밋 메시지

```
feat: 욕설 감지 KoELECTRA 2차 탐지 추가
fix: CS 화이트리스트 오탐 수정
docs: API_SPEC.md 스트리밍 엔드포인트 추가
```

### PR 규칙

PR에 포함해야 할 항목:
1. 변경 내용 요약
2. 변경 이유
3. 관련 문서 업데이트 여부
4. 테스트/검증 결과
5. UI 변경 시 스크린샷

**공유 API 필드 / DB 컬럼 / 네이밍 변경 시 → naming registry 업데이트 필수**

### AI 오너 주의사항

- FE/BE와 공유되는 필드명은 임의로 변경 금지
- 새 공유 필드 추가 시 `specs/00-overview/05-shared-naming-registry.md` 등록 후 PR
- 문서 우선순위: `specs/` > `think/project-handbook/` > 이 문서

---

## 탐지 구조

```
1차: lexicon (Aho-Corasick, 270개) — 명시적 욕설
2차: KoELECTRA — lexicon 미감지 시 우회 표현 탐지
    offensive >= 0.97  (CS 키워드 포함 문장 제외)
    hate      >= 0.95  (CS 키워드 무관)

CS 화이트리스트: 환불/배송/교환/주문/결제/상품/접수/처리/부탁/신청/문의/반품/수령/도착
```

---

## 연동 정보

| 환경 | 주소 |
|------|------|
| 로컬 | `http://localhost:8000` |
| 교내망 | `http://203.234.62.47:8000` |
| 외부 (Cloudflare Tunnel) | 세션마다 변경 — 실행 시 확인 |
