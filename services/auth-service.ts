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
// export function updateUserProfile(id: number, data: FormData) {
// return apiRequest(`/users/${id}`, {
//     method: "PUT",
//     body: data, 
//     headers: {
//       // This overrides the "application/json" inside apiRequest
//       // Letting the browser automatically handle the multipart/form-data boundary
//       "Content-Type": undefined as any, 
//     },
//   });
// }
export async function updateUserProfile(id: number, userData: any) {
  let avatarId = null;

  // 1. If there is a new file, upload it to /api/upload first
  if (userData.files?.avatar) {
    const fileData = new FormData();
    fileData.append("files", userData.files.avatar);

    const uploadRes = await apiRequest("/upload", {
      method: "POST",
      body: fileData,
      headers: { "Content-Type": undefined as any }, // Let browser set boundary
    });

    // uploadRes is an array of file objects; get the ID of the first one
    avatarId = uploadRes[0]?.id;
  }

  // 2. Now update the User Profile with the text data + the new Avatar ID
  const updatePayload = {
    username: userData.username,
    country: userData.country,
    city: userData.city,
    description: userData.description,
    isShowCity: userData.isShowCity,
    // Connect the uploaded file ID to the user's avatar field
    ...(avatarId ? { avatar: avatarId } : {}),
  };

  return apiRequest(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatePayload),
    headers: { "Content-Type": "application/json" },
  });
}

export function logout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
}

