const ACCESS_TOKEN_KEY = "helpdesk_access_token";
const REFRESH_TOKEN_KEY = "helpdesk_refresh_token";
export const SESSION_EXPIRED_EVENT = "helpdesk:session-expired";

let refreshPromise = null;

export class AuthExpiredError extends Error {
  constructor(message = "로그인 시간이 만료되었습니다. 다시 로그인해 주세요.") {
    super(message);
    this.name = "AuthExpiredError";
    this.isAuthExpired = true;
  }
}

export function isAuthExpiredError(error) {
  return error?.isAuthExpired === true || error?.name === "AuthExpiredError";
}

function notifySessionExpired(message) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } }));
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

async function request(path, options = {}) {
  const { headers, ...requestOptions } = options;
  const response = await fetch(`/api${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.message ?? "요청 처리에 실패했습니다.");
  }

  return data;
}

async function refreshStoredTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new AuthExpiredError();
  }

  if (!refreshPromise) {
    refreshPromise = refresh({ refreshToken })
      .then(data => {
        saveAuthTokens(data.accessToken, data.refreshToken);
        return data;
      })
      .catch(() => {
        clearAuthTokens();
        throw new AuthExpiredError();
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function buildAuthHeaders(headers) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new AuthExpiredError("로그인이 필요합니다.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    ...(headers ?? {}),
  };
}

export async function authFetch(path, options = {}) {
  const { headers, ...requestOptions } = options;
  const url = path.startsWith("/api") ? path : `/api${path}`;

  try {
    let response = await fetch(url, {
      ...requestOptions,
      headers: buildAuthHeaders(headers),
    });

    if (response.status !== 401) {
      return response;
    }

    await refreshStoredTokens();
    response = await fetch(url, {
      ...requestOptions,
      headers: buildAuthHeaders(headers),
    });

    return response;
  } catch (error) {
    if (isAuthExpiredError(error)) {
      notifySessionExpired(error.message);
    }
    throw error;
  }
}

export async function parseApiResponse(response, fallbackMessage) {
  const data = await readJson(response);
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthTokens();
      const error = new AuthExpiredError();
      notifySessionExpired(error.message);
      throw error;
    }
    throw new Error(data.message ?? fallbackMessage);
  }
  return data;
}

export function saveAuthTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function signupCustomer(payload) {
  return request("/auth/signup/customer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signupOperator(payload) {
  return request("/auth/signup/operator", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refresh(payload) {
  return request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(refreshToken) {
  return request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getMe(accessToken) {
  return request("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateCustomerProfile(payload) {
  const response = await authFetch("/customer/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "프로필 정보를 저장하지 못했습니다.");
}
