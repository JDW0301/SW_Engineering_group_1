import { getAccessToken } from "./auth";

export async function updateOperatorStore(payload) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch("/api/operator/store", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "스토어 정보를 저장하지 못했습니다.");
  }

  return data;
}
