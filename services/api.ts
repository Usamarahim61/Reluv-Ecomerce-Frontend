import { API_BASE_URL } from "@/app/constants/api";

const BASE_URL = `${API_BASE_URL}/api`;

const AUTH_ERROR_STATUSES = new Set([401, 403]);

function handleAuthError(status: number) {
  if (typeof window === "undefined" || !AUTH_ERROR_STATUSES.has(status)) return;

  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("reluv:auth-invalid"));
}

export async function apiRequest(
  endpoint: string,
  options?: RequestInit
) {
  const jwt =
    typeof window !== "undefined"
      ? localStorage.getItem("jwt")
      : null;

  // 1. Check if the body is FormData
  const isFormData = options?.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  // 2. Only add JSON header if it's NOT FormData and not already set
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // 3. If it IS FormData, we MUST ensure Content-Type is removed 
  // so the browser can set the correct multipart/form-data boundary
  if (isFormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: headers,
  });

  let data;

  try {
    data = await res.json();   // ✅ SAFE parsing
  } catch {
    // If the server returns an empty success or non-JSON error
    if (res.ok) return { success: true };
    handleAuthError(res.status);
    throw new Error(`Invalid JSON response (${res.status})`);
  }

  if (!res.ok) {
    handleAuthError(res.status);
    throw new Error(data?.error?.message || `API Error ${res.status}`);
  }

  return data;
}
