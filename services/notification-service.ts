import { apiRequest } from "./api";

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export function getMyNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  return apiRequest("/notifications/my", { method: "GET" });
}

export function markNotificationRead(id: number) {
  return apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return apiRequest("/notifications/read-all", { method: "PATCH" });
}
