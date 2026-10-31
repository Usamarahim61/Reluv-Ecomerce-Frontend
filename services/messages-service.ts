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
  id: number | string;
  url: string;
  /**
   * Browser object URL captured from the optimistic bubble before the server
   * echo replaces it. Rendered until the remote copy is available so the
   * image never goes blank mid-send.
   */
  localUrl?: string;
  name: string;
  ext: string;
  mime: string;
  size: number;
};

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'completed' | 'unavailable';

export type MessageItem = {
  id: number | string;
  content: string;
  createdAt?: string;
  sender: ConversationUser | null;
  attachments?: MessageAttachment[];
  metadata?: {
    type?: string;
    offerId?: number;
    productId?: number;
    amount?: number;
    status?: string;
  };
  offer?: {
    id: number;
    offerPrice: number;
    originalPrice: number;
    status: OfferStatus;
    editedAt?: string;
    editCount?: number;
    seenAt?: string;
    sender?: ConversationUser | number;
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
      price?: number | string;
      productStatus?: string;
    } | null;
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

async function waitForChatSocket(socket: ReturnType<typeof getChatSocket>, timeoutMs = 10000) {
  if (socket.connected) return;
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      globalThis.clearTimeout(timeout);
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
    };
    const onConnect = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Could not connect to chat. Please try again."));
    };
    const timeout = globalThis.setTimeout(() => {
      cleanup();
      reject(new Error("Chat connection timed out. Please try again."));
    }, timeoutMs);
    socket.once("connect", onConnect);
    socket.once("connect_error", onError);
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

export type MessageList = MessageItem[] & { conversationId?: number };

export async function fetchMessagesByConversation(conversationId: number): Promise<MessageList> {
  try {
    const payload = await socketRequest<{ messages?: MessageItem[]; conversationId?: number }>("messages:list", {
      conversationId,
    });
    return Object.assign(Array.isArray(payload?.messages) ? payload.messages : [], {
      conversationId: Number(payload?.conversationId ?? conversationId),
    });
  } catch {
    // HTTP fallback keeps the web app compatible with older backend deployments.
  }

  const payload = await apiRequest(`/messages/by-conversation/${conversationId}`);
  console.log('Raw API response for messages:', payload);
  return Object.assign(Array.isArray(payload?.messages) ? payload.messages : [], {
    conversationId: Number(payload?.conversationId ?? conversationId),
  });
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

export async function createOfferViaSocket(params: {
  productId: number;
  buyerId: number;
  sellerId: number;
  initiatorId?: number;
  offerPrice: number;
  message?: string;
  conversationId: number;
  parentOfferId?: number;
}): Promise<unknown> {
  const socket = getChatSocket();
  const clientOfferId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    await waitForChatSocket(socket);
    return await new Promise((resolve, reject) => {
    const timeout = globalThis.setTimeout(() => {
      cleanup();
      reject(new Error("offer:create timed out."));
    }, 20000);

    const cleanup = () => {
      globalThis.clearTimeout(timeout);
      socket.off("offer:created", handleCreated);
      socket.off("offer:error", handleError);
    };

    const handleCreated = (event: { clientOfferId?: string; offer?: unknown }) => {
      if (event.clientOfferId !== clientOfferId) return;
      cleanup();
      resolve(event.offer);
    };

    const handleError = (event: { clientOfferId?: string; message?: string }) => {
      if (event.clientOfferId !== clientOfferId) return;
      cleanup();
      reject(new Error(event.message || "Failed to send offer."));
    };

    socket.on("offer:created", handleCreated);
    socket.on("offer:error", handleError);
    socket.emit("offer:create", { ...params, clientOfferId });
    });
  } catch {
    const payload = await apiRequest("/offers/make", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return payload?.data ?? payload;
  }
}

export async function respondToOfferViaSocket(params: {
  offerId: number;
  action: "accepted" | "declined";
  sellerId: number;
  conversationId: number;
}): Promise<unknown> {
  const socket = getChatSocket();
  try {
    await waitForChatSocket(socket);
    return await new Promise((resolve, reject) => {
    const timeout = globalThis.setTimeout(() => {
      cleanup();
      reject(new Error("offer:respond timed out."));
    }, 20000);

    const cleanup = () => {
      globalThis.clearTimeout(timeout);
      socket.off("offer:responded", handleResponded);
      socket.off("offer:error", handleError);
    };

    const handleResponded = (event: { offerId?: number; offer?: { status?: string }; conflict?: boolean; message?: string }) => {
      if (Number(event.offerId) !== Number(params.offerId)) return;
      cleanup();
      if (event.conflict) {
        reject(new Error(event.message || "This item is no longer available."));
        return;
      }
      if (event.offer?.status !== params.action) {
        reject(new Error(event.message || `Offer is already ${event.offer?.status || "not pending"}.`));
        return;
      }
      resolve(event.offer);
    };

    const handleError = (event: { offerId?: number; message?: string }) => {
      if (event.offerId != null && Number(event.offerId) !== Number(params.offerId)) return;
      cleanup();
      reject(new Error(event.message || "Failed to respond to offer."));
    };

    socket.on("offer:responded", handleResponded);
    socket.on("offer:error", handleError);
    socket.emit("offer:respond", params);
    });
  } catch {
    const payload = await apiRequest(`/offers/${params.offerId}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ action: params.action, sellerId: params.sellerId, conversationId: params.conversationId }),
    });
    if (payload?.conflict) throw new Error(payload?.message || "This item is no longer available.");
    const offer = payload?.data ?? payload;
    if (offer?.status !== params.action) throw new Error(`Offer is already ${offer?.status || "not pending"}.`);
    return offer;
  }
}


export async function editOfferViaSocket(params: {
  offerId: number;
  offerPrice: number;
  conversationId: number;
}): Promise<unknown> {
  const socket = getChatSocket();
  const clientOfferId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    await waitForChatSocket(socket);
    return await new Promise((resolve, reject) => {
      const timeout = globalThis.setTimeout(() => {
        cleanup();
        reject(new Error("offer:edit timed out."));
      }, 20000);

      const cleanup = () => {
        globalThis.clearTimeout(timeout);
        socket.off("offer:edited", handleEdited);
        socket.off("offer:error", handleError);
      };

      const handleEdited = (event: { clientOfferId?: string; offerId?: number; offer?: unknown }) => {
        if (event.clientOfferId !== clientOfferId && Number(event.offerId) !== Number(params.offerId)) return;
        cleanup();
        resolve(event.offer);
      };

      const handleError = (event: { clientOfferId?: string; offerId?: number; message?: string }) => {
        if (event.clientOfferId !== clientOfferId && event.offerId != null && Number(event.offerId) !== Number(params.offerId)) return;
        cleanup();
        reject(new Error(event.message || "Failed to edit offer."));
      };

      socket.on("offer:edited", handleEdited);
      socket.on("offer:error", handleError);
      socket.emit("offer:edit", { ...params, clientOfferId });
    });
  } catch (socketErr: any) {
    if (socketErr?.message && !socketErr.message.includes("timed out") && !socketErr.message.includes("Could not connect")) {
      throw socketErr;
    }
    const payload = await apiRequest(`/offers/${params.offerId}`, {
      method: "PATCH",
      body: JSON.stringify({ offerPrice: params.offerPrice, conversationId: params.conversationId }),
    });
    return payload?.data ?? payload;
  }
}

export async function markOfferSeenViaSocket(params: {
  offerId: number;
  conversationId: number;
}): Promise<void> {
  const socket = getChatSocket();
  try {
    socket.emit("offer:seen", params);
  } catch {
    apiRequest(`/offers/${params.offerId}/seen`, {
      method: "PATCH",
      body: JSON.stringify({ conversationId: params.conversationId }),
    }).catch(() => {});
  }
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
