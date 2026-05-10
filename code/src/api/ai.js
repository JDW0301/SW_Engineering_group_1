import { getAccessToken } from "./auth";

export async function streamChatbotReply(payload, onEvent) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch("/api/ai/chatbot/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? "챗봇 응답을 불러오지 못했습니다.");
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
