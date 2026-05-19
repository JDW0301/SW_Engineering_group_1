import { getAccessToken } from "./auth";

async function request(path, options = {}) {
  const accessToken = getAccessToken();
  const response = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? "관리자 데이터를 처리하지 못했습니다.");
  return data;
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
