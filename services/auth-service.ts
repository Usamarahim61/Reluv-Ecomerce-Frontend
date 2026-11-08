import { API_BASE_URL } from "@/app/constants/api";
import { apiRequest } from "./api";
import {
  NEXT_PUBLIC_LINE_CHANNEL_ID,
  NEXT_PUBLIC_LINE_CALLBACK_URL,
} from "@/constants";

// localStorage.getItem("jwt")
export function login(identifier: string, password: string) {
  return apiRequest("/local-auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function register(username: string, email: string, password: string) {
  return apiRequest("/auth/local/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function sendOtp(email: string, username: string, password: string) {
  return apiRequest("/email-otp/send", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

export function verifyOtp(email: string, otp: string) {
  return apiRequest("/email-otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export function forgotPasswordSendOtp(email: string) {
  return apiRequest("/password-reset/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function forgotPasswordVerifyOtp(email: string, otp: string) {
  return apiRequest("/password-reset/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export function forgotPasswordReset(email: string, otp: string, password: string) {
  return apiRequest("/password-reset/reset", {
    method: "POST",
    body: JSON.stringify({ email, otp, password }),
  });
}
export function getUser(id: any) {
  return apiRequest(
    `/users/${id}?populate[products][populate]=*&populate[role]=*&populate[received_reviews][populate]=*&populate[following][populate]=*&populate[followers][populate]=*`,
    { method: "GET" }
  );
}
export function getUserProfile(id: number | string) {
  return apiRequest(
    `/users/${encodeURIComponent(String(id))}?populate[avatar][fields][0]=url`,
    { method: "GET" }
  );
}
export function getUserAddress(id: any) {
  return apiRequest(
    `/users/${id}`,
    {
      method: "GET",
    }
  );
}
export function getUserAvatr(id: any) {
  return apiRequest(
    `/users/me?populate[avatar][populate]=*`,
     { method: "GET",
    }
  );
}
export function getUserFav_Products(id: any) {
  return apiRequest(
    `/users/${id}?populate[fav_products][populate]=*`,
     { method: "GET",
    }
  );
}
export function AccountUpdate(id: any, data: any) {
  return apiRequest(`/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", // Tells the server you're sending JSON
        // Authorization: `Bearer ${localStorage.get("jwt")}`,
    },
    body: JSON.stringify(data), // Converts your object to a JSON string
  });
}
export function updateUserProfile(id: number, data: FormData) {
return apiRequest(`/users/${id}`, {
    method: "PUT",
    body: data, 
    headers: {
      "Content-Type": "application/json", 
    },
  });
}
export function logout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
}
// services/auth-service.ts  — add these two functions

export async function loginWithGoogle(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: token }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let message = errorText || "Google login failed";
    try {
      const parsed = JSON.parse(errorText);
      message = parsed?.error?.message || parsed?.message || message;
    } catch {
      message = errorText || "Google login failed";
    }
    throw new Error(message);
  }
  const data = await res.json();
  console.log("✅ Google login response:", { 
    hasJwt: !!data.jwt, 
    hasUser: !!data.user,
    userId: data.user?.id,
    jwtPreview: data.jwt?.substring(0, 30) + "..."
  });
  return data;
}
// Send either an access_token (mobile SDK) or an auth code (web flow) to the backend
export async function loginWithLine(
  payload:
    | { access_token: string }
    | { code: string; code_verifier: string; redirect_uri: string },
) {
  const res = await fetch(`${API_BASE_URL}/api/auth/line`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || "LINE login failed");
  }
  return res.json() as Promise<{ jwt: string; user: Record<string, unknown> }>;
}

export async function createLinePkcePair() {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const codeVerifier = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  const binary = Array.from(new Uint8Array(digest), (byte) => String.fromCharCode(byte)).join("");
  const codeChallenge = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return { codeVerifier, codeChallenge };
}

export function createLineOAuthState() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Redirects the browser to LINE's login screen (web flow)
export async function redirectToLine(): Promise<void> {
  const state = createLineOAuthState();
  sessionStorage.setItem("line_oauth_state", state);
  const { codeVerifier, codeChallenge } = await createLinePkcePair();
  sessionStorage.setItem("line_oauth_verifier", codeVerifier);
  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", NEXT_PUBLIC_LINE_CHANNEL_ID);
  url.searchParams.set("redirect_uri", NEXT_PUBLIC_LINE_CALLBACK_URL);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "profile openid");
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  window.location.assign(url.toString());
}

// Opens LINE login in a popup and resolves with { jwt, user } on success
export function loginWithLinePopup(): Promise<{ jwt: string; user: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        const state = createLineOAuthState();
        const { codeVerifier, codeChallenge } = await createLinePkcePair();
        sessionStorage.setItem("line_oauth_state", state);
        sessionStorage.setItem("line_oauth_verifier", codeVerifier);

        const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", NEXT_PUBLIC_LINE_CHANNEL_ID);
        url.searchParams.set("redirect_uri", NEXT_PUBLIC_LINE_CALLBACK_URL);
        url.searchParams.set("state", state);
        url.searchParams.set("scope", "profile openid");
        url.searchParams.set("code_challenge", codeChallenge);
        url.searchParams.set("code_challenge_method", "S256");

        const popup = window.open(url.toString(), "line_login", "width=500,height=600");
        if (!popup) return reject(new Error("Popup blocked."));

        const handler = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data?.type !== "LINE_AUTH_SUCCESS" && event.data?.type !== "LINE_AUTH_ERROR") return;
          window.removeEventListener("message", handler);

          if (event.data.state !== state) return reject(new Error("State mismatch — possible CSRF."));
          if (event.data.type === "LINE_AUTH_ERROR") {
            return reject(new Error(event.data.error || "LINE login cancelled."));
          }

          try {
            const result = await loginWithLine({
              code: event.data.code,
              code_verifier: codeVerifier,
              redirect_uri: NEXT_PUBLIC_LINE_CALLBACK_URL,
            });
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };

        window.addEventListener("message", handler);
      } catch (err) {
        reject(err);
      }
    })();
  });
}

