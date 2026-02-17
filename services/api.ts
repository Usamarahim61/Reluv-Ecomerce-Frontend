const BASE_URL = "http://localhost:1337/api";

export async function apiRequest(
  endpoint: string,
  options?: RequestInit
) {
  const jwt =
    typeof window !== "undefined"
      ? localStorage.getItem("jwt")
      : null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...(options?.headers || {}),
    },
  });

  let data;

  try {
    data = await res.json();   // ✅ SAFE parsing
  } catch (err) {
    throw new Error(`Invalid JSON response (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data?.error?.message || `API Error ${res.status}`);
  }

  return data;
}
