import { authFetch, parseApiResponse } from "./auth";

async function request(path, options = {}) {
  const response = await authFetch(path, options);
  return parseApiResponse(response, "문의 요청 처리에 실패했습니다.");
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

export async function updateInquiry(inquiryId, payload) {
  const data = await request(`/inquiries/${inquiryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.inquiry;
}

export async function deleteInquiry(inquiryId) {
  await request(`/inquiries/${inquiryId}`, { method: "DELETE" });
}
