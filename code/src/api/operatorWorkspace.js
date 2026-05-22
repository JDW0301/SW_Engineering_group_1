import { authFetch, parseApiResponse } from "./auth";

async function request(path, options = {}) {
  const response = await authFetch(path, options);
  return parseApiResponse(response, "관리자 데이터를 처리하지 못했습니다.");
}

export async function getOperatorWorkspace() {
  return request("/operator/workspace");
}

export async function createInquiryReply(inquiryId, content) {
  const data = await request(`/operator/inquiries/${inquiryId}/replies`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return data.reply;
}

export async function createInternalNote(payload) {
  const data = await request("/operator/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.note;
}

function getAISummaryPath(kind, id) {
  if (kind === "support") return `/operator/support-sessions/${id}/summary`;
  if (kind === "inquiry") return `/operator/inquiries/${id}/summary`;
  throw new Error("지원하지 않는 AI 요약 대상입니다.");
}

export async function getAISummary(kind, id) {
  const data = await request(getAISummaryPath(kind, id));
  return data.summary ?? null;
}

export async function saveAISummary(kind, id, summaryText) {
  const data = await request(getAISummaryPath(kind, id), {
    method: "POST",
    body: JSON.stringify({ summaryText }),
  });
  return data.summary;
}

export async function getOperatorSettings() {
  return request("/operator/settings");
}

export async function saveOperatorPresets(presets) {
  const data = await request("/operator/settings/presets", {
    method: "PUT",
    body: JSON.stringify({ presets }),
  });
  return data.presets ?? [];
}

export async function saveOperatorFaqs(faqs) {
  const data = await request("/operator/settings/faqs", {
    method: "PUT",
    body: JSON.stringify({ faqs }),
  });
  return data.faqs ?? [];
}

export async function createKnowledgeFile(fileName, fileContent) {
  const data = await request("/operator/settings/files", {
    method: "POST",
    body: JSON.stringify({ fileName, fileContent }),
  });
  return data.file;
}

export async function deleteKnowledgeFile(fileId) {
  await request(`/operator/settings/files/${fileId}`, { method: "DELETE" });
}
