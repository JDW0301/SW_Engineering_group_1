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
  if (!response.ok) {
    throw new Error(data.message ?? "문의 요청 처리에 실패했습니다.");
  }
  return data;
}

export async function listStoreInquiries(storeId) {
  const data = await request(`/inquiries?storeId=${storeId}`);
  return data.inquiries ?? [];
}

export async function listMyInquiries() {
  const data = await request("/inquiries");
  return data.inquiries ?? [];
}

export async function listOperatorInquiries() {
  const data = await request("/operator/inquiries");
  return data.inquiries ?? [];
}

export async function createInquiry(payload) {
  const data = await request("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.inquiry;
}
