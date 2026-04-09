import { apiRequest } from "./api";

export type ConversationUser = {
  id: number;
  username: string;
  avatar?: { url?: string } | null;
};

export type ConversationProduct = {
  id: number;
  title: string;
  price?: string;
  images?: { url?: string }[];
};

export type ConversationItem = {
  id: number;
  product: ConversationProduct | null;
  buyer: ConversationUser | null;
  seller: ConversationUser | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  updatedAt?: string | null;
};

export type MessageItem = {
  id: number | string;
  content: string;
  createdAt?: string;
  sender: ConversationUser | null;
};

export async function fetchMyConversations(): Promise<ConversationItem[]> {
  const payload = await apiRequest("/conversations/my");
  return Array.isArray(payload?.conversations) ? payload.conversations : [];
}

export async function createConversationForProduct(params: {
  productId: number;
  otherUserId?: number;
}): Promise<ConversationItem | null> {
  const payload = await apiRequest("/conversations/for-product", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return payload?.conversation ?? null;
}

export async function fetchMessagesByConversation(conversationId: number): Promise<MessageItem[]> {
  const payload = await apiRequest(`/messages/by-conversation/${conversationId}`);
  return Array.isArray(payload?.messages) ? payload.messages : [];
}

export async function sendMessage(params: {
  conversationId: number;
  content: string;
}): Promise<MessageItem | null> {
  const payload = await apiRequest("/messages/send", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return payload?.message ?? null;
}
