import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ConversationItem,
  MessageItem,
  fetchMessagesByConversation,
  fetchMyConversations,
} from "@/services/messages-service";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";
type RealtimeMessage = MessageItem & { clientMessageId?: string };

type MessagesState = {
  conversations: ConversationItem[];
  conversationsStatus: RequestStatus;
  conversationsError: string | null;
  messagesByConversation: Record<string, MessageItem[]>;
  messagesStatusByConversation: Record<string, RequestStatus>;
  messagesErrorByConversation: Record<string, string | null>;
  messagesDuringFetchByConversation: Record<string, RealtimeMessage[]>;
  selectedConversationId: number | null;
};

const initialState: MessagesState = {
  conversations: [],
  conversationsStatus: "idle",
  conversationsError: null,
  messagesByConversation: {},
  messagesStatusByConversation: {},
  messagesErrorByConversation: {},
  messagesDuringFetchByConversation: {},
  selectedConversationId: null,
};

export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchMyConversations();
      return items;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to load conversations");
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const list = await fetchMessagesByConversation(conversationId);
      return { conversationId, messages: list };
    } catch (error) {
      return rejectWithValue({
        conversationId,
        message: error instanceof Error ? error.message : "Failed to load messages",
      });
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setSelectedConversationId: (state, action: PayloadAction<number | null>) => {
      state.selectedConversationId = action.payload;
    },
    setConversations: (state, action: PayloadAction<ConversationItem[]>) => {
      state.conversations = action.payload;
    },
    removeConversation: (state, action: PayloadAction<number>) => {
      const conversationId = action.payload;
      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== conversationId,
      );
      delete state.messagesByConversation[String(conversationId)];
      delete state.messagesStatusByConversation[String(conversationId)];
      delete state.messagesErrorByConversation[String(conversationId)];
      delete state.messagesDuringFetchByConversation[String(conversationId)];
      if (state.selectedConversationId === conversationId) {
        state.selectedConversationId = null;
      }
    },
    markConversationRead: (state, action: PayloadAction<number>) => {
      const conversation = state.conversations.find(
        (item) => item.id === action.payload,
      );
      if (conversation) {
        conversation.hasUnread = false;
        conversation.unreadCount = 0;
      }
    },
    updateConversationPreview: (
      state,
      action: PayloadAction<{
        conversationId: number;
        lastMessagePreview: string;
        lastMessageAt?: string | null;
      }>
    ) => {
      const { conversationId, lastMessagePreview, lastMessageAt } = action.payload;
      const updated = state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessagePreview,
              lastMessageAt: lastMessageAt ?? new Date().toISOString(),
            }
          : c
      );
      state.conversations = updated.sort((a, b) => {
        const aTime = a.lastMessageAt ?? a.updatedAt ?? "";
        const bTime = b.lastMessageAt ?? b.updatedAt ?? "";
        return bTime.localeCompare(aTime);
      });
    },
    setMessagesForConversation: (
      state,
      action: PayloadAction<{ conversationId: number; messages: MessageItem[] }>
    ) => {
      const { conversationId, messages } = action.payload;
      state.messagesByConversation[String(conversationId)] = messages;
      delete state.messagesDuringFetchByConversation[String(conversationId)];
    },
    addOptimisticMessage: (
      state,
      action: PayloadAction<{ conversationId: number; message: MessageItem }>
    ) => {
      const { conversationId, message } = action.payload;
      const key = String(conversationId);
      const existing = state.messagesByConversation[key] ?? [];
      state.messagesByConversation[key] = [...existing, message];
      if (state.messagesStatusByConversation[key] === "loading") {
        const duringFetch = state.messagesDuringFetchByConversation[key] ?? [];
        if (!duringFetch.some((item) => String(item.id) === String(message.id))) {
          state.messagesDuringFetchByConversation[key] = [...duringFetch, message];
        }
      }
    },
    upsertMessage: (
      state,
      action: PayloadAction<{
        conversationId: number;
        message: MessageItem & { clientMessageId?: string };
      }>
    ) => {
      const { conversationId, message } = action.payload;
      const key = String(conversationId);
      const existing = state.messagesByConversation[key] ?? [];

      if (message.clientMessageId) {
        const optimisticId = `temp-${message.clientMessageId}`;
        const optimisticIndex = existing.findIndex((m) => m.id === optimisticId);
        if (optimisticIndex >= 0) {
          const copy = [...existing];
          const optimistic = existing[optimisticIndex];
          const updatedMessage = {
            ...message,
            attachments: message.attachments?.length ? message.attachments : optimistic.attachments,
          };
          copy[optimisticIndex] = updatedMessage;
          state.messagesByConversation[key] = copy;
          if (state.messagesStatusByConversation[key] === "loading") {
            const duringFetch = state.messagesDuringFetchByConversation[key] ?? [];
            const bufferedOptimisticIndex = duringFetch.findIndex((item) => item.id === optimisticId);
            const nextDuringFetch = [...duringFetch];
            if (bufferedOptimisticIndex >= 0) nextDuringFetch[bufferedOptimisticIndex] = updatedMessage;
            else if (!nextDuringFetch.some((item) => String(item.id) === String(message.id))) nextDuringFetch.push(updatedMessage);
            state.messagesDuringFetchByConversation[key] = nextDuringFetch;
          }
          return;
        }
      }

      const alreadyExists = existing.some((m) => String(m.id) === String(message.id));
      if (alreadyExists) return;

      state.messagesByConversation[key] = [...existing, message];
      if (state.messagesStatusByConversation[key] === "loading") {
        const duringFetch = state.messagesDuringFetchByConversation[key] ?? [];
        if (!duringFetch.some((item) => String(item.id) === String(message.id))) {
          state.messagesDuringFetchByConversation[key] = [...duringFetch, message];
        }
      }
    },
    updateOfferStatus: (
      state,
      action: PayloadAction<{
        conversationId: number;
        offerId: number;
        status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed' | 'unavailable';
      }>
    ) => {
      const { conversationId, offerId, status } = action.payload;
      const messages = state.messagesByConversation[String(conversationId)] ?? [];
      for (const message of messages) {
        if (Number(message.offer?.id ?? message.metadata?.offerId) !== Number(offerId)) continue;
        if (message.offer) message.offer.status = status;
        if (message.metadata) message.metadata.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = "loading";
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsStatus = "succeeded";
        state.conversations = [...action.payload].sort((a, b) => {
          const aTime = a.lastMessageAt ?? a.updatedAt ?? "";
          const bTime = b.lastMessageAt ?? b.updatedAt ?? "";
          return bTime.localeCompare(aTime);
        });
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = "failed";
        state.conversationsError = action.payload as string;
      })
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg;
        state.messagesStatusByConversation[String(conversationId)] = "loading";
        state.messagesErrorByConversation[String(conversationId)] = null;
        state.messagesDuringFetchByConversation[String(conversationId)] = [];
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        const key = String(conversationId);
        const duringFetch = state.messagesDuringFetchByConversation[key] ?? [];
        const cachedMessages = state.messagesByConversation[key] ?? [];
        const merged = messages.map((message) => {
          const cached = cachedMessages.find((item) => String(item.id) === String(message.id));
          return !message.attachments?.length && cached?.attachments?.length
            ? { ...message, attachments: cached.attachments }
            : message;
        });
        for (const message of duringFetch) {
          const optimisticIndex = message.clientMessageId
            ? merged.findIndex((item) => item.id === `temp-${message.clientMessageId}`)
            : -1;
          if (optimisticIndex >= 0) {
            merged[optimisticIndex] = message;
            continue;
          }
          const existingIndex = merged.findIndex((item) => String(item.id) === String(message.id));
          if (existingIndex < 0) {
            merged.push(message);
          } else if (!merged[existingIndex].attachments?.length && message.attachments?.length) {
            merged[existingIndex] = { ...merged[existingIndex], attachments: message.attachments };
          }
        }
        state.messagesByConversation[key] = merged.sort(
          (a, b) => Date.parse(a.createdAt ?? "") - Date.parse(b.createdAt ?? ""),
        );
        state.messagesStatusByConversation[key] = "succeeded";
        delete state.messagesDuringFetchByConversation[key];
      })
      .addCase(fetchMessages.rejected, (state, action: any) => {
        const conversationId = action.payload?.conversationId ?? action.meta.arg;
        state.messagesStatusByConversation[String(conversationId)] = "failed";
        state.messagesErrorByConversation[String(conversationId)] =
          action.payload?.message || "Failed to load messages";
        delete state.messagesDuringFetchByConversation[String(conversationId)];
      });
  },
});

export const {
  setSelectedConversationId,
  setConversations,
  removeConversation,
  markConversationRead,
  updateConversationPreview,
  setMessagesForConversation,
  addOptimisticMessage,
  upsertMessage,
  updateOfferStatus,
} = messagesSlice.actions;

export default messagesSlice.reducer;
