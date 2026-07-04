import { API_BASE_URL } from "@/app/constants/api";
import { apiRequest } from "./api";
import { getChatSocket } from "@/lib/chat-socket";

export type ConversationUser = {
  id: number;
  username: string;
  avatar?: { url?: string } | null;
};

export type ConversationProduct = {
  id: number;
  documentId?: string;
  size: string;
  brand: string;
  title: string;
  price?: string;
  images?: { url?: string }[];
  hasUnread: boolean
};

export type ConversationItem = {
  id: number;
  product: ConversationProduct | null;
  buyer: ConversationUser | null;
  seller: ConversationUser | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  updatedAt?: string | null;
  unreadCount?: number;
  hasUnread: boolean
};

export type MessageAttachment = {
  id: number;
  url: string;
  name: string;
  ext: string;
  mime: string;
  size: number;
};

export type MessageItem = {
  id: number | string;
  content: string;
  createdAt?: string;
  sender: ConversationUser | null;
  attachments?: MessageAttachment[];
  metadata?: {
    type?: string;
    offerId?: number;
    amount?: number;
    status?: string;
  };
  offer?: {
    id: number;
    offerPrice: number;
    originalPrice: number;
    status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';
    message?: string;
    expiresAt?: string;
    buyer?: ConversationUser | number;
    seller?: ConversationUser | number;
    // Added for consistent checkout URL generation
    productTitle?: string;
    productImage?: string; // Absolute URL or relative path
    product?: {
      id?: number | string;
      documentId?: string;
      title?: string;
      brand?: string;
      size?: string;
    };
    currency?: string; // e.g., "TBH"
    buyerProtectionFee?: number;
    shippingFee?: number;
  };
};

export type BlockStatus = {
  iBlockedThem: boolean;
  theyBlockedMe: boolean;
};

async function socketRequest<T>(
  event: string,
  payload: Record<string, unknown> = {},
  timeoutMs = 10000,
): Promise<T> {
  const socket = getChatSocket();

  return new Promise<T>((resolve, reject) => {
    const timeout = globalThis.setTimeout(() => {
      reject(new Error(`${event} timed out.`));
    }, timeoutMs);

    socket.emit(event, payload, (response: any) => {
      globalThis.clearTimeout(timeout);
      if (!response?.ok) {
        reject(new Error(response?.message || `${event} failed.`));
        return;
      }
      resolve(response as T);
    });
  });
}

export async function fetchMyConversations(): Promise<ConversationItem[]> {
  try {
    const payload = await socketRequest<{ conversations?: ConversationItem[] }>("conversations:list");
    return Array.isArray(payload?.conversations) ? payload.conversations : [];
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  const payload = await apiRequest("/conversations/my");
  return Array.isArray(payload?.conversations) ? payload.conversations : [];
}

export async function createConversationForProduct(params: {
  productId: number;
  otherUserId?: number;
}): Promise<ConversationItem | null> {
  try {
    const payload = await socketRequest<{ conversation?: ConversationItem }>(
      "conversation:createForProduct",
      params,
    );
    return payload?.conversation ?? null;
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  const payload = await apiRequest("/conversations/for-product", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return payload?.conversation ?? null;
}

export async function fetchMessagesByConversation(conversationId: number): Promise<MessageItem[]> {
  try {
    const payload = await socketRequest<{ messages?: MessageItem[] }>("messages:list", {
      conversationId,
    });
    return Array.isArray(payload?.messages) ? payload.messages : [];
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  const payload = await apiRequest(`/messages/by-conversation/${conversationId}`);
  console.log('Raw API response for messages:', payload);
  return Array.isArray(payload?.messages) ? payload.messages : [];
}

export async function sendMessage(params: {
  conversationId: number;
  content: string;
  attachments?: number[];
}): Promise<MessageItem | null> {
  const clientMessageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const socket = getChatSocket();

  try {
    return await new Promise<MessageItem>((resolve, reject) => {
      const timeout = globalThis.setTimeout(() => {
        cleanup();
        reject(new Error("message:send timed out."));
      }, 10000);

      const cleanup = () => {
        globalThis.clearTimeout(timeout);
        socket.off("message:new", handleNewMessage);
        socket.off("message:error", handleMessageError);
      };

      const handleNewMessage = (message: MessageItem & { clientMessageId?: string }) => {
        if (message.clientMessageId !== clientMessageId) return;
        cleanup();
        resolve(message);
      };

      const handleMessageError = (event: { clientMessageId?: string; message?: string }) => {
        if (event.clientMessageId !== clientMessageId) return;
        cleanup();
        reject(new Error(event.message || "Failed to send message."));
      };

      socket.on("message:new", handleNewMessage);
      socket.on("message:error", handleMessageError);
      socket.emit("message:send", { ...params, clientMessageId });
    });
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  const payload = await apiRequest("/messages/send", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return payload?.message ?? null;
}

export async function deleteConversation(conversationId: number): Promise<void> {
  try {
    await socketRequest("conversation:delete", { conversationId });
    return;
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  await apiRequest(`/conversations/${conversationId}/delete`, { method: "DELETE" });
}

export async function fetchBlockStatus(userId: number): Promise<BlockStatus> {
  try {
    const payload = await socketRequest<BlockStatus>("block:status", { userId });
    return {
      iBlockedThem: Boolean(payload?.iBlockedThem),
      theyBlockedMe: Boolean(payload?.theyBlockedMe),
    };
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  const payload = await apiRequest(`/blocks/status/${userId}`);
  return {
    iBlockedThem: Boolean(payload?.iBlockedThem),
    theyBlockedMe: Boolean(payload?.theyBlockedMe),
  };
}

export async function blockUser(userId: number): Promise<void> {
  try {
    await socketRequest("block:set", { userId, blocked: true });
    return;
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  await apiRequest(`/blocks/block/${userId}`, { method: "POST" });
}

export async function unblockUser(userId: number): Promise<void> {
  try {
    await socketRequest("block:set", { userId, blocked: false });
    return;
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  await apiRequest(`/blocks/unblock/${userId}`, { method: "POST" });
}

export async function uploadFiles(files: File[]): Promise<number[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  
  if (!jwt) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'File upload failed');
  }

  const uploadedFiles = await response.json();
  return uploadedFiles.map((file: any) => file.id);
}
