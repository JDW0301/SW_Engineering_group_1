import { authFetch, parseApiResponse } from "./auth";

export async function getCustomerHome() {
  const response = await authFetch("/customer/home");
  const data = await parseApiResponse(response, "고객 홈 데이터를 불러오지 못했습니다.");

  return data;
}
