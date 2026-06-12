import { apiRequest } from "./api";

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
    buyer?: number;
    seller?: number;
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
  console.log('Raw API response for messages:', payload);
  return Array.isArray(payload?.messages) ? payload.messages : [];
}

export async function sendMessage(params: {
  conversationId: number;
  content: string;
  attachments?: number[];
}): Promise<MessageItem | null> {
  const payload = await apiRequest("/messages/send", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return payload?.message ?? null;
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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1337'}/api/upload`, {
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
