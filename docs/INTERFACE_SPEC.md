# 인터페이스 명세 통합본

> FE ↔ BE ↔ AI 연동에 필요한 필드명·엔드포인트·타입을 한 곳에 정리한 문서.  
> 기존 `ai/API_SPEC.md` + `specs/00-overview/05-shared-naming-registry.md`를 통합.  
> **중간발표 시연 기준 (2026-04-16)**

---

## 1. 서버 접속 정보

| 서버 | 담당 | 로컬 | 교내망 |
|------|------|------|--------|
| BE (FastAPI) | 조동욱 | `http://localhost:4000` | 조동욱 PC IP:4000 |
| AI (FastAPI) | 조규상 | `http://localhost:8000` | `http://203.234.62.47:8000` |
| FE (React+Vite) | 윤건호 | `http://localhost:5173` | — |

> AI 외부 접속 (선택): Cloudflare Tunnel `cloudflared tunnel --url http://localhost:8000 --protocol http2`  
> 터널 URL은 재시작 시 변경됨.

---

## 2. 공통 규칙

- **인증 헤더**: `Authorization: Bearer {accessToken}` (BE 전용, AI 원 서버는 인증 없음)
- **AI 호출 경로**: FE는 가능하면 BE의 `/api/ai/*` 프록시를 호출한다. BE가 `AI_BASE_URL`의 AI 서버로 요청을 전달한다.
- **요청/응답 형식**: `application/json` (스트리밍 제외)
- **오류 응답**:

```json
// BE
{ "message": "오류 메시지", "details": {} }

// AI
{ "error": "오류 메시지", "detail": "상세 내용" }
```

- **AI 응답** 전체에 `latency_ms` 포함 (ms 단위 처리 시간)

---

## 3. BE API (port 4000)

### 3-1. 인증

#### `POST /api/auth/signup/customer` — 이용자 회원가입

**Request**
```json
{
  "loginId":  "string",   // 아이디 (필수)
  "email":    "string",   // 이메일 형식 (필수)
  "password": "string",   // 비밀번호 (필수)
  "name":     "string",   // 이름 (필수)
  "phone":    "string"    // 전화번호 (필수)
}
```

**Response** `201`
```json
{ "message": "이용자 회원가입이 완료되었습니다.", "user": { ...user 객체 } }
```

---

#### `POST /api/auth/signup/operator` — 관리자 회원가입

**Request**
```json
{
  "loginId":       "string",   // 아이디 (필수)
  "email":         "string",   // 이메일 (필수)
  "password":      "string",   // 비밀번호 (필수)
  "name":          "string",   // 대표자명 (필수)
  "phone":         "string",   // 전화번호 (필수)
  "storeName":     "string",   // 스토어명 (필수)
  "category":      "string",   // 스토어 카테고리 (필수)
  "description":   "string",   // 스토어 소개 (선택)
  "storePhone":    "string",   // 스토어 전화번호 (선택)
  "address":       "string",   // 주소 (선택)
  "businessHours": "string"    // 영업시간 (선택, DB: business_hours)
}
```

**Response** `201`
```json
{ "message": "관리자 회원가입이 완료되었습니다.", "user": { ...user 객체 } }
```

---

#### `POST /api/auth/login` — 로그인

**Request**
```json
{
  "loginId":  "string",
  "password": "string"
}
```

**Response** `200`
```json
{
  "accessToken":  "string",
  "refreshToken": "string",
  "user": {
    "id":      1,
    "loginId": "string",    // DB: login_id
    "email":   "string",
    "name":    "string",
    "phone":   "string",
    "role":    "CUSTOMER | OPERATOR",
    "status":  "ACTIVE | INACTIVE"
  }
}
```

> **FE 저장 위치**: `accessToken` → 메모리 or sessionStorage, `refreshToken` → httpOnly Cookie 권장 (현재 body로 전달)

---

#### `POST /api/auth/refresh` — 토큰 갱신

**Request**
```json
{ "refreshToken": "string" }
```

**Response** `200` — 로그인 응답과 동일한 구조 (`accessToken`, `refreshToken`, `user`)

---

#### `POST /api/auth/logout` — 로그아웃

**Request**
```json
{ "refreshToken": "string" }
```

**Response** `200`
```json
{ "message": "로그아웃되었습니다." }
```

---

#### `GET /api/auth/me` — 내 정보 조회

**Header**: `Authorization: Bearer {accessToken}`

**Response** `200`
```json
{
  "id":      1,
  "loginId": "string",
  "email":   "string",
  "name":    "string",
  "phone":   "string",
  "role":    "CUSTOMER | OPERATOR",
  "status":  "ACTIVE | INACTIVE",
  "store":   { ... }   // role == OPERATOR 일 때만 포함
}
```

---

#### `GET /api/health`

```json
{ "message": "ok" }
```

---

### 3-2. BE → AI 프록시 API

> FE가 AI 서버를 직접 호출하지 않고 BE 인증을 거쳐 AI 기능을 사용할 때 쓰는 경로다.  
> BE는 `.env`의 `AI_BASE_URL` 값을 기준으로 AI 서버에 요청을 전달한다. 기본값은 `http://203.234.62.47:8000`이다.

공통 규칙:

- `GET /api/ai/health`를 제외한 프록시 API는 `Authorization: Bearer {accessToken}` 필요
- 요청 body와 응답 body는 AI 원 서버 명세와 동일하게 유지
- AI 서버 연결 실패 시 BE는 `502`와 `{ "message": "AI 서버에 연결할 수 없습니다.", "details": "..." }` 형태로 응답

| 메서드 | BE 경로 | AI 원 서버 경로 | 기능 |
|--------|---------|----------------|------|
| GET | `/api/ai/health` | `GET /health` | AI 서버 상태 확인 |
| POST | `/api/ai/detect` | `POST /detect` | 욕설 감지 |
| POST | `/api/ai/neutralize` | `POST /neutralize` | 욕설 중립화 |
| POST | `/api/ai/classify` | `POST /classify` | 문의 분류 |
| POST | `/api/ai/chatbot` | `POST /chatbot` | 챗봇 일반 응답 |
| POST | `/api/ai/chatbot/stream` | `POST /chatbot/stream` | 챗봇 SSE 스트리밍 |
| POST | `/api/ai/summarize` | `POST /summarize` | 대화 요약 |

예시 — BE 프록시로 욕설 감지:

```http
POST /api/ai/detect
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{ "text": "배송 언제 오나요?" }
```

응답은 AI 원 서버의 `/detect` 응답과 동일하다.

---

## 4. AI API (port 8000)

### 4-1. 욕설 감지 `POST /detect`

> 채팅 메시지 전송 시마다 호출. 실시간 처리 (60~110ms).

**Request**
```json
{ "text": "string"  }   // 1~500자
```

**Response**
```json
{
  "is_profanity": true,
  "confidence":   0.999,
  "method":       "lexicon+koelectra",
  "detections": [
    { "word": "시발", "level": 5, "offense_type": "욕설", "target": "일반" }
  ],
  "max_level":   5,
  "latency_ms":  65.3
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `is_profanity` | bool | 악성 표현 포함 여부 → FE: 전송 차단 또는 경고 표시 |
| `confidence` | float 0~1 | KoELECTRA 신뢰도 |
| `detections[].level` | int 3~5 | 심각도 (5: 최고) |

---

### 4-2. 욕설 중립화 `POST /neutralize`

> `/detect`에서 `is_profanity: true` 확인 후 호출. DB 저장 시 두 필드 분리 저장.

**Request**
```json
{ "text": "string" }
```

**Response**
```json
{
  "original":    "병신같은 서비스 환불해줘",
  "cleaned":     "[모욕]같은 서비스 환불해줘",
  "is_filtered": true,
  "detections":  [ ... ],
  "latency_ms":  61.3
}
```

| API 필드 | DB 컬럼 | 설명 |
|----------|---------|------|
| `original` | `content_raw` | 원문 (원문보기 버튼용) |
| `cleaned` | `content_display` | 표시용 텍스트 (기본값) |
| `is_filtered` | `is_filtered` | 필터링 여부 |

---

### 4-3. 문의 분류 `POST /classify`

> 문의 접수 시 1회 호출. 평균 ~1.6초.

**Request**
```json
{ "text": "string" }
```

**Response**
```json
{
  "category":   "배송문의",
  "confidence": "high",
  "latency_ms": 1624.1
}
```

| `category` 값 | 설명 |
|--------------|------|
| `배송문의` | 배송 관련 |
| `환불문의` | 환불 요청 |
| `교환문의` | 교환 요청 |
| `상품문의` | 상품 정보 |
| `기타` | 분류 불가 |

| `confidence` 값 | 설명 |
|----------------|------|
| `high` | 명확 매칭 |
| `medium` | 부분 매칭 |
| `low` | 기타 분류 |

> ⚠️ **미결**: `category` 필드명을 `classification`으로 변경할지 팀 최종 확인 필요.

---

### 4-4. 챗봇 `POST /chatbot/stream` (권장) · `POST /chatbot`

> 스토어 정보 기반 고객 자동 응답. **스트리밍 버전 권장**.

**Request (공통)**
```json
{
  "message":       "배송은 얼마나 걸려요?",
  "history": [
    { "role": "customer", "content": "안녕하세요" },
    { "role": "bot",      "content": "무엇을 도와드릴까요?" }
  ],
  "store_context": "스토어명: 하루마켓\n배송정책: 2~3 영업일\n..."
}
```

| 필드 | 타입 | 필수 | 제한 |
|------|------|------|------|
| `message` | string | Y | 비어있으면 안 됨 |
| `history` | array | N | 최대 20개 |
| `history[].role` | string | — | `"customer"` \| `"bot"` |
| `store_context` | string | Y | 사업자 설정 정보 |

---

#### `POST /chatbot` — 일반 응답

```json
{
  "reply":       "주문 후 2~3 영업일 이내에 출고됩니다.",
  "can_answer":  true,
  "latency_ms":  5200.0
}
```

---

#### `POST /chatbot/stream` — SSE 스트리밍

`Content-Type: text/event-stream` 형식으로 순서대로 수신.

**정상 흐름**
```
data: {"thinking": true}                          → "생각중..." 표시
data: {"thinking_end": true}                      → "생각중..." 숨김
data: {"token": "배송", "can_answer": true}
data: {"token": "은 약", "can_answer": true}
...
data: {"token": "", "done": true, "can_answer": true}   → 응답 완료
```

**HANDOFF 흐름** (`can_answer: false` — 상담사 연결 필요)
```
data: {"thinking": true}
data: {"thinking_end": true}
data: {"token": "", "can_answer": false, "final": "죄송합니다, 상담사와 연결해 드릴게요."}
```

| 이벤트 필드 | 설명 |
|------------|------|
| `thinking: true` | 생각중 시작 — 로딩 표시 |
| `thinking_end: true` | 생각중 종료 — 로딩 숨김 |
| `token: "..."` | 실시간 텍스트 누적 |
| `done: true` | 스트림 종료 |
| `can_answer: false` + `final: "..."` | HANDOFF — 상담사 연결 버튼 활성화 |
| `error: "..."` | 오류 |

**FE 연동 예시 (React)**
```javascript
const res = await fetch('/api/ai/chatbot/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ message, history, store_context })
});
const reader = res.body.getReader();
const decoder = new TextDecoder();
let botReply = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  for (const line of decoder.decode(value).split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const data = JSON.parse(line.slice(6));
    if (data.thinking)     setStatus('생각중입니다...');
    if (data.thinking_end) setStatus('');
    if (data.token)      { botReply += data.token; setMessage(botReply); }
    if (data.final)      { setMessage(data.final); setShowHandoff(true); }
  }
}
```

---

### 4-5. 대화 요약 `POST /summarize`

> 상담사가 요약 버튼 클릭 시 호출. 평균 7~15초.

**Request**
```json
{
  "messages": [
    { "sender": "고객",   "content": "배송이 언제 오나요?" },
    { "sender": "상담사", "content": "내일 도착 예정입니다." }
  ],
  "store_info": "string"   // 선택, 요약 컨텍스트용
}
```

**Response**
```json
{
  "summary":       "고객은 배송 상태를 문의하였고 상담사는 내일 도착 예정임을 안내하였습니다.",
  "message_count": 3,
  "latency_ms":    7126.5
}
```

> `messages[].sender` 값: `"고객"` \| `"상담사"` (chatbot history의 `role`과 다름 — 변환 필요)

---

### 4-6. 서버 상태 `GET /health`

```json
{ "status": "ok", "words_loaded": 270, "model": "beomi/beep-koelectra-base-v3-discriminator-hate" }
```

---

### AI 응답 지연 참고

| 엔드포인트 | 평균 지연 | 비고 |
|-----------|---------|------|
| `/detect` | 60~110ms | 실시간 |
| `/neutralize` | 60~110ms | 실시간 |
| `/classify` | ~1.6초 | 문의 접수 시 1회 |
| `/chatbot` | 5~10초 | 비스트리밍 |
| `/chatbot/stream` | 첫 토큰 ~4.5초, 이후 실시간 | **권장** |
| `/summarize` | 7~15초 | 버튼 클릭 시 1회 |

---

## 5. 공유 필드명 레지스트리

> 기존 `specs/00-overview/05-shared-naming-registry.md` 통합.  
> **두 곳 이상에서 쓰이는 이름은 반드시 여기에 기록.**

### 5-1. 인증·사용자

| 필드명 (API) | DB 컬럼 | 타입 | 사용처 | 비고 |
|-------------|---------|------|--------|------|
| `loginId` | `login_id` | string | FE/BE/Auth | 로그인 식별자 |
| `email` | `email` | string | FE/BE/DB | 이메일 형식 필수 |
| `password` | `password_hash` (저장) | string | FE/BE | 응답에 절대 노출 금지 |
| `name` | `name` | string | FE/BE/DB | 이용자: 이름, 운영자: 대표자명 |
| `phone` | `phone` | string | FE/BE/DB | |
| `refreshToken` | — | string | FE/BE | 갱신·로그아웃에 사용 |
| `accessToken` | — | string | FE/BE | Bearer 헤더 |
| `role` | `role` | string | FE/BE/DB | `CUSTOMER` \| `OPERATOR` |
| `status` | `status` | string | FE/BE/DB | `ACTIVE` \| `INACTIVE` |

### 5-2. 스토어 (운영자 전용)

| 필드명 (API) | DB 컬럼 | 타입 | 사용처 | 비고 |
|-------------|---------|------|--------|------|
| `storeName` | `store_name` | string | FE/BE/DB | 운영자 회원가입 필수 |
| `category` | `category` | string | FE/BE/DB | 스토어 카테고리 |
| `description` | `description` | string | FE/BE/DB | 선택 |
| `storePhone` | `store_phone` | string | FE/BE/DB | 선택 |
| `address` | `address` | string | FE/BE/DB | 선택 |
| `businessHours` | `business_hours` | string | FE/BE/DB | 선택 |

### 5-3. AI 연동

| 필드명 (API) | DB 컬럼 | 타입 | 사용처 | 비고 |
|-------------|---------|------|--------|------|
| `is_profanity` | — | bool | AI/FE/BE | 욕설 감지 여부 |
| `original` | `content_raw` | string | AI/BE/DB | 원문 (원문보기용) |
| `cleaned` | `content_display` | string | AI/BE/DB | 표시용 텍스트 |
| `is_filtered` | `is_filtered` | bool | AI/BE/DB | 필터링 여부 |
| `summary` | — | string | AI/BE | 대화 요약 결과 |
| `can_answer` | — | bool | AI/FE | false → 상담사 연결 버튼 |
| `reply` | — | string | AI/FE | 챗봇 응답 텍스트 |
| `store_context` | — | string | FE→BE→AI | 스토어 정보 (챗봇 컨텍스트) |

### 5-4. 문의·상담 (시연 최소 항목, 미확정)

| 필드명 후보 | 타입 | 의미 | 상태 |
|------------|------|------|------|
| `OPEN` | enum | 새 문의 대기 | 제안 |
| `ANSWERED` | enum | 운영자 답변 완료 | 제안 |
| `CLOSED` | enum | 문의 종료 | 제안 |
| `IN_PROGRESS` | enum | 상담 진행 중 | 제안 |
| `RESOLVED` | enum | 상담 완료 | 제안 |

---

## 6. ⚠️ 미결 사항 (발표 전 팀 확인 필요)

| 항목 | 현황 | 담당 |
|------|------|------|
| `/classify` 응답 필드명: `category` vs `classification` | AI는 `category` 사용 중 | 조규상↔조동욱↔윤건호 |
| `chatbot history[].role` (`"customer"`/`"bot"`) ↔ summarize `messages[].sender` (`"고객"`/`"상담사"`) 변환 | FE에서 변환하거나 AI에서 통일 | 조규상↔윤건호 |
| `store_context` 포맷 — 어디서 생성해 AI로 전달하는지 | 현재 BE는 프록시 전달만 수행. FE가 문자열을 보내거나 추후 BE가 스토어 정보로 조립하도록 결정 필요 | 조동욱↔윤건호↔조규상 |
| BE `/api/orders`, `/api/stores/*` 엔드포인트 — git push 미완 | 로컬 구현됨, 브랜치 push 필요 | 조동욱 |

---

## 7. 시연 체크리스트

```
[ ] BE 서버 실행 확인 (port 4000) — GET /api/health
[ ] AI 서버 실행 확인 (port 8000) — GET /health
[ ] FE에서 BE 로그인 → accessToken 수령 확인
[ ] FE에서 BE /api/ai/detect 호출 → is_profanity 반환 확인
[ ] FE에서 BE /api/ai/chatbot/stream SSE 수신 확인
[ ] HANDOFF 시나리오: can_answer=false → 상담사 연결 버튼 노출 확인
[ ] 욕설 시나리오: is_profanity=true → cleaned 텍스트 표시 확인
[ ] /api/ai/classify 호출 → category 반환 확인
```
