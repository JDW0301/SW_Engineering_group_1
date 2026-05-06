import { getAccessToken } from "./auth";

export async function getCustomerHome() {
  const accessToken = getAccessToken();
  const response = await fetch("/api/customer/home", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "고객 홈 데이터를 불러오지 못했습니다.");
  }

  return data;
}
