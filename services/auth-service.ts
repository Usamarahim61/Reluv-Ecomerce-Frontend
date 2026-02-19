import { apiRequest } from "./api";

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
export function getUser(id: number) {
  // &populate[avatar]=*&populate[received_reviews][populate]=author
  return apiRequest(
    `/users/${id}?populate[products][populate]=*&populate[role]=*&populate[received_reviews][populate]=author&populate[following][populate]=*&populate[followers][populate]=*`, 
    {
      method: "GET",
    }
  );
}

export function logout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
}
