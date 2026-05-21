import { API_BASE_URL } from "@/app/constants/api";
import { apiRequest } from "./api";

// localStorage.getItem("jwt")
export function login(identifier: string, password: string) {
  return apiRequest("/auth/local", {
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
export function getUser(id: number) {
  return apiRequest(
    `/users/${id}?populate[products][populate]=*&populate[role]=*&populate[received_reviews][populate]=*&populate[following][populate]=*&populate[followers][populate]=*`,
     { method: "GET"
    }
  );
}
export function getUserAddress(id: number) {
  return apiRequest(
    `/users/${id}`,
    {
      method: "GET",
    }
  );
}
export function getUserAvatr(id: number) {
  return apiRequest(
    `/users/${id}?populate[avatar][populate]=*`,
     { method: "GET",
    }
  );
}
export function getUserFav_Products(id: number) {
  return apiRequest(
    `/users/${id}?populate[fav_products][populate]=*`,
     { method: "GET",
    }
  );
}
export function AccountUpdate(id: number, data: any) {
  return apiRequest(`/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", // Tells the server you're sending JSON
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
  return res.json();
}
export async function loginWithFacebook(accessToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/facebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Facebook login failed");
  }
  return res.json(); // expects { jwt, user }
}

