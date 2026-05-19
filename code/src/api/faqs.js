import { getAccessToken } from "./auth";

export async function listStoreFaqs(storeId) {
  const accessToken = getAccessToken();
  const response = await fetch(`/api/stores/${storeId}/faqs`, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "자주 묻는 질문을 불러오지 못했습니다.");
  }

  return data.faqs ?? [];
}
