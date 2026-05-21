import { authFetch, parseApiResponse } from "./auth";

export async function listStoreFaqs(storeId) {
  const response = await authFetch(`/stores/${storeId}/faqs`);
  const data = await parseApiResponse(response, "자주 묻는 질문을 불러오지 못했습니다.");

  return data.faqs ?? [];
}
