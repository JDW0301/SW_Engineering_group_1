import json
import re
import time
import unicodedata
import ahocorasick
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from openai import OpenAI

# ── 전역 리소스 ─────────────────────────────────────────────
_resources: dict = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 1회 로드
    print("[startup] KoELECTRA 모델 로딩 중...")
    _resources["classifier"] = pipeline(
        "text-classification",
        model="beomi/beep-koelectra-base-v3-discriminator-hate",
        device=-1,  # CPU (GPU 있으면 0)
    )
    print("[startup] KoELECTRA 로딩 완료")

    print("[startup] 어휘사전 로딩 중...")
    with open("lexicon/base_words.json", encoding="utf-8") as f:
        lexicon: list[dict] = json.load(f)["words"]
    _resources["lexicon"] = lexicon
    _resources["automaton"] = _build_automaton(lexicon)
    print(f"[startup] 어휘사전 로딩 완료 ({len(lexicon)}개 단어)")

    _resources["exaone"] = OpenAI(
        base_url="http://127.0.0.1:1234/v1",
        api_key="lm-studio",
    )
    print("[startup] Exaone 클라이언트 준비 완료")
    yield
    _resources.clear()

app = FastAPI(title="CS 플랫폼 AI API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc):
    return JSONResponse(status_code=422, content={"error": "입력값이 올바르지 않습니다.", "detail": str(exc)})

@app.exception_handler(Exception)
async def general_error_handler(request, exc):
    return JSONResponse(status_code=500, content={"error": "서버 내부 오류가 발생했습니다.", "detail": str(exc)})


# ── 유틸 ────────────────────────────────────────────────────
def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).lower()
    return re.sub(r"[\s\.\-\_\*\#\!\@\$\+\=\~]", "", text)

def _build_automaton(lexicon: list[dict]):
    automaton = ahocorasick.Automaton()
    for entry in lexicon:
        for variant in [entry["word"]] + entry.get("variants", []):
            key = normalize(variant)
            if key:
                automaton.add_word(key, entry)
    automaton.make_automaton()
    return automaton


# ── 감지 / 중립화 ────────────────────────────────────────────
def _koelectra_classify(text: str) -> tuple[bool, float, str]:
    """KoELECTRA로 악성 표현 여부 분류. (is_flagged, score, label) 반환"""
    result = _resources["classifier"](text, truncation=True, max_length=128)[0]
    label = result["label"]
    score = round(result["score"], 4)
    # offensive >= 0.999 / hate >= 0.99 일 때만 악성으로 판정
    is_flagged = (label == "offensive" and score >= 0.999) or \
                 (label == "hate"      and score >= 0.990)
    return is_flagged, score, label

def _lexicon_detect(text: str) -> list[dict]:
    """Aho-Corasick으로 감지된 단어 목록 반환"""
    norm = normalize(text)
    found, seen = [], set()
    for _, entry in _resources["automaton"].iter(norm):
        if entry["word"] not in seen:
            seen.add(entry["word"])
            found.append(entry)
    return found

def _lexicon_replace(text: str) -> str:
    """어휘사전 기반 텍스트 대치 (긴 패턴 우선)"""
    result = text
    for entry in _resources["lexicon"]:
        candidates = sorted(
            [entry["word"]] + entry.get("variants", []),
            key=len, reverse=True,
        )
        replacement = f"[{entry['offense_type']}]"
        for c in candidates:
            if c in result:
                result = result.replace(c, replacement)
    return result


# ── 요청/응답 스키마 ─────────────────────────────────────────
class TextInput(BaseModel):
    text: str

    def validate_text(self):
        if not self.text or not self.text.strip():
            raise HTTPException(status_code=400, detail="text가 비어있습니다.")
        if len(self.text) > 500:
            raise HTTPException(status_code=400, detail="text는 500자 이하여야 합니다.")

class MessagesInput(BaseModel):
    messages: list[dict]   # [{"sender": "고객", "content": "..."}, ...]
    store_info: str = ""   # 요약 시 컨텍스트용 (선택)

class Detection(BaseModel):
    word: str
    level: int
    offense_type: str
    target: str

class DetectResponse(BaseModel):
    is_profanity: bool
    confidence: float          # KoELECTRA 확신도
    method: str                # "koelectra+lexicon"
    detections: list[Detection]
    max_level: int
    latency_ms: float

class NeutralizeResponse(BaseModel):
    original: str
    cleaned: str               # content_display 용도
    is_filtered: bool
    detections: list[Detection]
    latency_ms: float

class SummarizeResponse(BaseModel):
    summary: str
    message_count: int
    latency_ms: float

# ── 챗봇 스키마 ──────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str     # "customer" | "bot"
    content: str

class ChatbotInput(BaseModel):
    message: str                        # 현재 고객 메시지
    history: list[ChatMessage] = []     # 이전 대화 내역
    store_context: str                  # 사업자가 설정한 정보 (상품/정책/FAQ)

class ChatbotResponse(BaseModel):
    reply: str
    can_answer: bool     # False면 상담사 연결 트리거
    latency_ms: float

# ── 문의 분류 스키마 ─────────────────────────────────────────
class ClassifyInput(BaseModel):
    text: str

class ClassifyResponse(BaseModel):
    category: str        # 배송문의 | 환불문의 | 교환문의 | 상품문의 | 기타
    confidence: str      # high | medium | low
    latency_ms: float


# ── 엔드포인트 ───────────────────────────────────────────────
def _analyze(text: str) -> tuple[bool, float, list[dict], str]:
    """
    1차: 어휘사전 (명시적 욕설, 확정적)
    2차: KoELECTRA (lexicon 미감지 우회 표현 — offensive>=0.999 / hate>=0.99)
    반환: (is_profanity, confidence, detections, method)
    """
    detections = _lexicon_detect(text)

    if detections:
        _, confidence, _ = _koelectra_classify(text)
        return True, confidence, detections, "lexicon+koelectra"

    # lexicon 미감지 → KoELECTRA 보조 탐지
    is_flagged, confidence, label = _koelectra_classify(text)
    if is_flagged:
        pseudo = [{
            "word": text[:20],
            "level": 3,
            "offense_type": "우회표현",
            "target": "일반",
        }]
        return True, confidence, pseudo, f"koelectra({label})"

    return False, confidence, [], "koelectra"


@app.post("/detect", response_model=DetectResponse)
def detect(body: TextInput):
    body.validate_text()
    start = time.time()
    is_profanity, confidence, detections, method = _analyze(body.text)

    return DetectResponse(
        is_profanity=is_profanity,
        confidence=confidence,
        method=method,
        detections=[
            Detection(**{k: d[k] for k in Detection.model_fields})
            for d in detections
        ],
        max_level=max((d["level"] for d in detections), default=0),
        latency_ms=round((time.time() - start) * 1000, 2),
    )


@app.post("/neutralize", response_model=NeutralizeResponse)
def neutralize(body: TextInput):
    body.validate_text()
    start = time.time()
    is_profanity, _, detections, method = _analyze(body.text)

    if not is_profanity:
        return NeutralizeResponse(
            original=body.text,
            cleaned=body.text,
            is_filtered=False,
            detections=[],
            latency_ms=round((time.time() - start) * 1000, 2),
        )

    # 어휘사전 감지된 경우: 단어 대치
    # KoELECTRA만 감지된 경우(사전 미탐): 전체 메시지 처리
    cleaned = _lexicon_replace(body.text)
    if cleaned == body.text:
        cleaned = "[부적절한 표현이 포함된 메시지입니다]"

    return NeutralizeResponse(
        original=body.text,
        cleaned=cleaned,
        is_filtered=True,
        detections=[
            Detection(**{k: d[k] for k in Detection.model_fields})
            for d in detections
        ],
        latency_ms=round((time.time() - start) * 1000, 2),
    )


@app.post("/summarize", response_model=SummarizeResponse)
def summarize(body: MessagesInput):
    start = time.time()

    if not body.messages:
        raise HTTPException(status_code=400, detail="messages가 비어있습니다.")

    # 대화 포맷 구성
    chat_log = "\n".join(
        f"[{m.get('sender', '?')}]: {m.get('content', '')}"
        for m in body.messages
    )

    system_prompt = "당신은 고객센터 상담 내용을 요약하는 전문가입니다. 핵심 내용만 간결하게 한국어로 요약하세요."

    user_prompt = f"""다음 상담 대화를 3~5줄로 요약해주세요.
요약에는 고객의 주요 문의 내용, 처리 결과, 미해결 사항을 포함하세요.

--- 대화 내용 ---
{chat_log}
--- 끝 ---

요약:"""

    try:
        response = _resources["exaone"].chat.completions.create(
            model="exaone-3.5-7.8b-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=300,
            temperature=0.3,
            timeout=30,
        )
    except Exception:
        raise HTTPException(status_code=503, detail="AI 모델 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.")

    summary = response.choices[0].message.content.strip()

    return SummarizeResponse(
        summary=summary,
        message_count=len(body.messages),
        latency_ms=round((time.time() - start) * 1000, 2),
    )


@app.post("/chatbot", response_model=ChatbotResponse)
def chatbot(body: ChatbotInput):
    start = time.time()

    if not body.message or not body.message.strip():
        raise HTTPException(status_code=400, detail="message가 비어있습니다.")
    if not body.store_context.strip():
        raise HTTPException(status_code=400, detail="store_context가 비어있습니다.")
    if len(body.history) > 20:
        raise HTTPException(status_code=400, detail="history는 최대 20개까지 허용됩니다.")

    # 대화 히스토리 구성
    history_text = ""
    if body.history:
        history_text = "\n".join(
            f"{'고객' if m.role == 'customer' else '챗봇'}: {m.content}"
            for m in body.history[-6:]  # 최근 6턴만 포함
        )
        history_text = f"\n--- 이전 대화 ---\n{history_text}\n---\n"

    system_prompt = f"""당신은 소규모 쇼핑몰의 고객센터 AI 챗봇입니다.
아래 [스토어 정보]만을 기반으로 고객 질문에 답변하세요.

[스토어 정보]
{body.store_context}

[HANDOFF 필수 조건 - 아래 해당 시 반드시 "HANDOFF"만 출력]
- 특정 주문의 현재 배송 상태, 위치 조회
- 고객 개인 주문내역, 결제 정보 확인
- 환불/교환 접수 처리 (방법 안내는 가능, 실제 접수는 HANDOFF)
- 재고 실시간 확인
- 스토어 정보에 없는 내용

[일반 규칙]
1. HANDOFF 조건이 아닌 경우에만 스토어 정보 기반으로 답변하세요.
2. 답변은 친절하고 간결하게 한국어로 작성하세요.
3. "HANDOFF" 출력 시 다른 말은 절대 붙이지 마세요."""

    user_prompt = f"{history_text}고객: {body.message}\n챗봇:"

    try:
        response = _resources["exaone"].chat.completions.create(
            model="exaone-3.5-7.8b-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=150,   # 300 → 150 (챗봇 응답은 간결하게)
            temperature=0.3,
            stop=["고객:"],
            timeout=15,
        )
    except Exception:
        raise HTTPException(status_code=503, detail="AI 모델 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.")

    reply = response.choices[0].message.content.strip()
    can_answer = "HANDOFF" not in reply.upper()

    if not can_answer:
        reply = "죄송합니다. 해당 문의는 상담사가 직접 도움드릴 수 있습니다. 상담사 연결 버튼을 눌러주세요."

    return ChatbotResponse(
        reply=reply,
        can_answer=can_answer,
        latency_ms=round((time.time() - start) * 1000, 2),
    )


def _build_chatbot_messages(body: ChatbotInput) -> tuple[str, str]:
    """챗봇 system/user 메시지 구성 (chatbot, chatbot/stream 공용)"""
    history_text = ""
    if body.history:
        history_text = "\n--- 이전 대화 ---\n" + "\n".join(
            f"{'고객' if m.role == 'customer' else '챗봇'}: {m.content}"
            for m in body.history[-6:]
        ) + "\n---\n"

    system_prompt = f"""고객센터 AI 챗봇. 아래 스토어 정보만으로 답변하라.

{body.store_context}

주문조회/결제/개인정보/재고확인/환불교환접수/정보없는질문 → "HANDOFF"만 출력.
그 외 → 한국어로 간결하게 답변."""

    user_prompt = f"{history_text}고객: {body.message}\n챗봇:"
    return system_prompt, user_prompt


@app.post("/chatbot/stream")
async def chatbot_stream(body: ChatbotInput):
    """
    스트리밍 챗봇 엔드포인트.
    토큰이 생성되는 즉시 클라이언트로 전달합니다 (SSE 형식).
    프론트엔드에서 EventSource 또는 fetch + ReadableStream으로 수신합니다.
    """
    if not body.message or not body.message.strip():
        raise HTTPException(status_code=400, detail="message가 비어있습니다.")
    if not body.store_context.strip():
        raise HTTPException(status_code=400, detail="store_context가 비어있습니다.")
    if len(body.history) > 20:
        raise HTTPException(status_code=400, detail="history는 최대 20개까지 허용됩니다.")

    system_prompt, user_prompt = _build_chatbot_messages(body)

    def generate():
        # 첫 토큰 전 즉시 전송 — 프론트에서 "생각중입니다..." 표시용
        yield f"data: {json.dumps({'thinking': True}, ensure_ascii=False)}\n\n"

        accumulated = ""
        first_token = True
        try:
            stream = _resources["exaone"].chat.completions.create(
                model="exaone-3.5-7.8b-instruct",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=150,
                temperature=0.3,
                stop=["고객:"],
                stream=True,
                timeout=15,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    accumulated += delta
                    if "HANDOFF" in accumulated.upper():
                        handoff_msg = "죄송합니다. 해당 문의는 상담사가 직접 도움드릴 수 있습니다. 상담사 연결 버튼을 눌러주세요."
                        if first_token:
                            yield f"data: {json.dumps({'thinking_end': True}, ensure_ascii=False)}\n\n"
                        yield f"data: {json.dumps({'token': '', 'can_answer': False, 'final': handoff_msg}, ensure_ascii=False)}\n\n"
                        return
                    # 첫 토큰 도착 시 thinking 종료 신호 전송
                    if first_token:
                        yield f"data: {json.dumps({'thinking_end': True}, ensure_ascii=False)}\n\n"
                        first_token = False
                    yield f"data: {json.dumps({'token': delta, 'can_answer': True}, ensure_ascii=False)}\n\n"

            yield f"data: {json.dumps({'token': '', 'done': True, 'can_answer': True}, ensure_ascii=False)}\n\n"

        except Exception:
            yield f"data: {json.dumps({'thinking_end': True}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'error': 'AI 모델 오류가 발생했습니다.'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


_CATEGORIES = ["배송문의", "환불문의", "교환문의", "상품문의", "기타"]

@app.post("/classify", response_model=ClassifyResponse)
def classify(body: ClassifyInput):
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="text가 비어있습니다.")
    if len(body.text) > 500:
        raise HTTPException(status_code=400, detail="text는 500자 이하여야 합니다.")
    start = time.time()

    prompt = f"""다음 고객 문의를 아래 카테고리 중 하나로 분류하세요.

카테고리: 배송문의, 환불문의, 교환문의, 상품문의, 기타

규칙:
- 반드시 위 카테고리 중 정확히 하나만 출력하세요.
- 다른 말은 절대 하지 마세요.

고객 문의: {body.text}
카테고리:"""

    response = _resources["exaone"].chat.completions.create(
        model="exaone-3.5-7.8b-instruct",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=20,
        temperature=0.0,
    )

    raw = response.choices[0].message.content.strip()

    # 응답에서 카테고리 추출
    category = "기타"
    for c in _CATEGORIES:
        if c in raw:
            category = c
            break

    # 신뢰도: 카테고리가 정확히 매칭되면 high
    confidence = "high" if raw in _CATEGORIES else ("medium" if category != "기타" else "low")

    return ClassifyResponse(
        category=category,
        confidence=confidence,
        latency_ms=round((time.time() - start) * 1000, 2),
    )


@app.get("/")
def demo():
    return FileResponse("demo.html")

@app.get("/health")
def health():
    return {
        "status": "ok",
        "words_loaded": len(_resources.get("lexicon", [])),
        "model": "beomi/beep-koelectra-base-v3-discriminator-hate",
    }
