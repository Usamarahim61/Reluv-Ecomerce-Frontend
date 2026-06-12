import { API_BASE_URL } from "@/app/constants/api";

const BASE_URL = `${API_BASE_URL}/api`;

const AUTH_ERROR_STATUSES = new Set([401, 403]);

// Endpoints that are allowed to return 401/403 without clearing the session
// (e.g. public endpoints that simply require auth but the user is not logged in)
const SKIP_AUTH_CLEAR_PATTERNS = [
  /\/products\/\d+\/favorites/,
  /\/notifications/,
  /\/conversations/,
  /\/users\/\d+/, // User profile fetches - don't clear on 401
];

function shouldSkipAuthClear(endpoint: string): boolean {
  return SKIP_AUTH_CLEAR_PATTERNS.some((pattern) => pattern.test(endpoint));
}

function handleAuthError(
  status: number,
  wasAuthenticated: boolean,
  endpoint: string,
  requestJwt: string
) {
  if (typeof window === "undefined" || !AUTH_ERROR_STATUSES.has(status)) return;
  if (!wasAuthenticated) return;
  if (shouldSkipAuthClear(endpoint)) return;

  // Add 30-second grace period for new logins to allow backend permissions to propagate
  const loginTime = localStorage.getItem("jwt_login_time");
  if (loginTime) {
    const elapsed = Date.now() - parseInt(loginTime, 10);
    if (elapsed < 30000) {
      console.warn(`⏱️ Auth error within grace period (${elapsed}ms), not clearing JWT:`, { endpoint });
      return;
    }
  }

  // Only clear if the JWT in storage is still the same one that was rejected
  const currentJwt = localStorage.getItem("jwt");
  if (currentJwt !== requestJwt) return;

  console.warn("🚨 Auth error detected, clearing session:", {
    status,
    endpoint,
    jwtPreview: requestJwt.substring(0, 20) + "..."
  });

  // localStorage.removeItem("jwt");
  // localStorage.removeItem("user");
  // localStorage.removeItem("jwt_login_time");
  // window.dispatchEvent(new CustomEvent("reluv:auth-invalid"));
}

export async function apiRequest(
  endpoint: string,
  options?: RequestInit
) {
  const jwt =
    typeof window !== "undefined"
      ? localStorage.getItem("jwt")
      : null;

  const isFormData = options?.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (isFormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await res.json();
  } catch {
    if (res.ok) return { success: true };
    handleAuthError(res.status, !!jwt, endpoint, jwt ?? "");
    throw new Error(`Invalid JSON response (${res.status})`);
  }

  if (!res.ok) {
    console.error("❌ API Error:", {
      endpoint,
      status: res.status,
      hasJwt: !!jwt,
      jwtPreview: jwt ? jwt.substring(0, 30) + "..." : "none",
      error: data?.error?.message || data?.message || "Unknown error"
    });
    handleAuthError(res.status, !!jwt, endpoint, jwt ?? "");
    throw new Error(data?.error?.message || `API Error ${res.status}`);
  }

  return data;
}
