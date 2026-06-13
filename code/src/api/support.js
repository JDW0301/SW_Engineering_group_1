import { authFetch, parseApiResponse } from "./auth";

async function request(path, options = {}) {
  const response = await authFetch(path, options);
  return parseApiResponse(response, "상담 요청 처리에 실패했습니다.");
}

export async function listSupportSessions() {
  return request("/support-sessions");
}

export async function createSupportSession(payload) {
  const data = await request("/support-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.supportSession;
}

export async function createSupportMessage(sessionId, content) {
  const data = await request(`/support-sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return data.message;
}

export async function listSupportMessages(sessionId) {
  const data = await request(`/support-sessions/${sessionId}/messages`);
  return data.messages ?? [];
}

export async function updateSupportStatus(sessionId, status) {
  const data = await request(`/support-sessions/${sessionId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data.supportSession;
}

export async function reportProfanityWarning(sessionId) {
  return request(`/support-sessions/${sessionId}/profanity-warning`, { method: "POST" });
}
