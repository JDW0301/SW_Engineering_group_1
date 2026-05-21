import { authFetch, parseApiResponse } from "./auth";

export async function updateOperatorStore(payload) {
  const response = await authFetch("/operator/store", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "스토어 정보를 저장하지 못했습니다.");
}
