# CS 플랫폼 AI API 명세

**Base URL**: `http://localhost:8000`  
**담당**: 조규상 (AI 전담)  
**연동 대상**: 백엔드(조동욱), 프론트엔드(윤건호)

---

## 접속 정보 (데모용)

| 환경 | 주소 |
|------|------|
| 로컬 | `http://localhost:8000` |
| 교내망 (같은 네트워크) | `http://203.234.62.47:8000` |
| 외부 접속 (Cloudflare Tunnel) | `https://concrete-day-wyoming-easier.trycloudflare.com` |

> **주의**: Cloudflare Tunnel URL은 서버 세션 종료 시 변경됩니다.  
> 터널 재시작 명령: `cloudflared tunnel --url http://localhost:8000 --protocol http2`

---

## 공통

- 요청/응답 형식: `application/json`
- 모든 응답에 `latency_ms` 포함 (처리 시간, ms 단위)
- 오류 응답 형식:
```json
{ "error": "오류 메시지", "detail": "상세 내용" }
```

---

## 1. 욕설 감지 `/detect`

**POST** `/detect`

채팅 메시지의 악성 표현 포함 여부를 판단합니다.  
메시지 전송 시마다 호출합니다.

### Request
```json
{ "text": "감지할 메시지" }
```
| 필드 | 타입 | 필수 | 제한 |
|------|------|------|------|
| text | string | Y | 1~500자 |

### Response
```json
{
  "is_profanity": true,
  "confidence": 0.999,
  "method": "lexicon+koelectra",
  "detections": [
    {
      "word": "시발",
      "level": 5,
      "offense_type": "욕설",
      "target": "일반"
    }
  ],
  "max_level": 5,
  "latency_ms": 65.3
}
```
| 필드 | 설명 |
|------|------|
| is_profanity | 악성 표현 포함 여부 |
| confidence | KoELECTRA 신뢰도 (0~1) |
| detections | 감지된 단어 목록 |
| max_level | 최고 심각도 (3~5) |

---

## 2. 중립화 처리 `/neutralize`

**POST** `/neutralize`

악성 표현을 대치 문자로 치환한 메시지를 반환합니다.  
DB 저장 시 `content_raw`(original)와 `content_display`(cleaned)를 분리 저장합니다.

### Request
```json
{ "text": "원본 메시지" }
```

### Response
```json
{
  "original": "병신같은 서비스 환불해줘",
  "cleaned": "[모욕]같은 서비스 환불해줘",
  "is_filtered": true,
  "detections": [...],
  "latency_ms": 61.3
}
```
| 필드 | DB 컬럼 | 설명 |
|------|---------|------|
| original | content_raw | 원본 (원문보기 버튼용) |
| cleaned | content_display | 기본 표시 텍스트 |
| is_filtered | is_filtered | 필터링 여부 |

---

## 3. 문의 분류 `/classify`

**POST** `/classify`

고객 문의를 유형별로 자동 분류합니다.  
문의 접수 시 1회 호출합니다.

### Request
```json
{ "text": "주문한 상품이 아직 안 왔어요" }
```

### Response
```json
{
  "category": "배송문의",
  "confidence": "high",
  "latency_ms": 1624.1
}
```
| category 값 | 설명 |
|-------------|------|
| 배송문의 | 배송 관련 |
| 환불문의 | 환불 요청 |
| 교환문의 | 교환 요청 |
| 상품문의 | 상품 정보 |
| 기타 | 분류 불가 |

| confidence 값 | 설명 |
|--------------|------|
| high | 카테고리 정확 매칭 |
| medium | 부분 매칭 |
| low | 기타로 분류 |

---

## 4. AI 챗봇 `/chatbot` `/chatbot/stream`

사업자가 설정한 스토어 정보 기반으로 고객 질문에 자동 응답합니다.  
`can_answer: false`이면 프론트엔드에서 상담사 연결 버튼을 활성화합니다.

> **권장**: `/chatbot/stream` 사용. 응답이 실시간으로 표시되어 UX가 개선됩니다.

### Request (공통)
```json
{
  "message": "배송은 얼마나 걸려요?",
  "history": [
    { "role": "customer", "content": "안녕하세요" },
    { "role": "bot", "content": "안녕하세요! 무엇을 도와드릴까요?" }
  ],
  "store_context": "스토어명: 하루마켓\n배송정책: 2~3 영업일\n..."
}
```
| 필드 | 타입 | 필수 | 제한 |
|------|------|------|------|
| message | string | Y | 비어있으면 안 됨 |
| history | array | N | 최대 20개 |
| store_context | string | Y | 사업자 설정 정보 |

---

### **POST** `/chatbot` — 일반 응답

```json
{
  "reply": "주문 후 2~3 영업일 이내에 출고됩니다.",
  "can_answer": true,
  "latency_ms": 5200.0
}
```
| 필드 | 설명 |
|------|------|
| reply | 챗봇 응답 메시지 |
| can_answer | false면 상담사 연결 버튼 활성화 |

---

### **POST** `/chatbot/stream` — 스트리밍 응답 (권장)

`Content-Type: text/event-stream` 형식으로 이벤트를 순서대로 수신합니다.

#### 이벤트 흐름

```
[즉시]       data: {"thinking": true}
             → "생각중입니다..." 메시지 표시

[~4~5초 후]  data: {"thinking_end": true}
             → "생각중입니다..." 숨김

[이후 즉시]  data: {"token": "배송", "can_answer": true}
             data: {"token": "은", "can_answer": true}
             data: {"token": " 약", "can_answer": true}
             ...
             → 토큰 단위 실시간 출력

[완료]       data: {"token": "", "done": true, "can_answer": true}
```

#### HANDOFF 발생 시 흐름
```
[즉시]       data: {"thinking": true}
[~4~5초 후]  data: {"thinking_end": true}
[이후]       data: {"token": "", "can_answer": false, "final": "죄송합니다..."}
             → 상담사 연결 버튼 활성화
```

#### 이벤트 필드 요약
| 이벤트 | 필드 | 설명 |
|--------|------|------|
| 생각중 시작 | `thinking: true` | "생각중입니다..." 표시 |
| 생각중 종료 | `thinking_end: true` | "생각중입니다..." 숨김 |
| 토큰 수신 | `token: "..."` | 실시간 텍스트 출력 |
| 스트림 종료 | `done: true` | 응답 완료 |
| HANDOFF | `final: "..."`, `can_answer: false` | 상담사 연결 버튼 활성화 |
| 오류 | `error: "..."` | 오류 메시지 표시 |

#### 프론트엔드 연동 예시 (React)
```javascript
const response = await fetch('http://localhost:8000/chatbot/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, history, store_context })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let botReply = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  for (const line of decoder.decode(value).split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const data = JSON.parse(line.slice(6));

    if (data.thinking)     setMessage('생각중입니다...');
    if (data.thinking_end) setMessage('');
    if (data.token)      { botReply += data.token; setMessage(botReply); }
    if (data.final)      { setMessage(data.final); setShowHandoffButton(true); }
  }
}
```

---

## 5. 대화 요약 `/summarize`

**POST** `/summarize`

상담 대화 내용을 AI로 요약합니다.  
상담사가 요약 버튼을 클릭할 때 호출합니다.

### Request
```json
{
  "messages": [
    { "sender": "고객", "content": "배송이 언제 오나요?" },
    { "sender": "상담사", "content": "내일 도착 예정입니다." },
    { "sender": "고객", "content": "감사합니다." }
  ]
}
```

### Response
```json
{
  "summary": "고객은 배송 상태를 문의하였고 상담사는 내일 도착 예정임을 안내하였습니다.",
  "message_count": 3,
  "latency_ms": 7126.5
}
```

---

## 6. 서버 상태 `/health`

**GET** `/health`

### Response
```json
{
  "status": "ok",
  "words_loaded": 270,
  "model": "beomi/beep-koelectra-base-v3-discriminator-hate"
}
```

---

## 오류 코드

| 코드 | 상황 |
|------|------|
| 400 | 입력값 오류 (빈 값, 길이 초과) |
| 422 | 요청 형식 오류 |
| 503 | AI 모델 응답 시간 초과 |
| 500 | 서버 내부 오류 |

---

## 지연시간 참고

| 엔드포인트 | 평균 지연 | 비고 |
|-----------|---------|------|
| /detect | 60~110ms | 실시간 |
| /neutralize | 60~110ms | 실시간 |
| /classify | ~1.6초 | 문의 접수 시 1회 |
| /chatbot | 5~10초 | Exaone 추론 (비스트리밍) |
| /chatbot/stream | 첫토큰 ~4.5초, 이후 실시간 | 스트리밍 권장 |
| /summarize | 7~15초 | Exaone 추론, 버튼 클릭 시 1회 |
