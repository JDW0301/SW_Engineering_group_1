import { authFetch, parseApiResponse } from "./auth";

export async function detectProfanity(text) {
  const response = await authFetch("/ai/detect", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return parseApiResponse(response, "욕설 감지를 처리하지 못했습니다.");
}

export async function summarizeConversation(payload) {
  const response = await authFetch("/ai/summarize", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "AI 요약을 생성하지 못했습니다.");
}

export async function streamChatbotReply(payload, onEvent) {
  const response = await authFetch("/ai/chatbot/stream", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseApiResponse(response, "챗봇 응답을 불러오지 못했습니다.");
  }

  if (!response.body) {
    throw new Error("챗봇 스트리밍 응답을 읽을 수 없습니다.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      onEvent(JSON.parse(trimmed.slice(6)));
    }
  }

  if (buffer.trim().startsWith("data: ")) {
    onEvent(JSON.parse(buffer.trim().slice(6)));
  }
}
