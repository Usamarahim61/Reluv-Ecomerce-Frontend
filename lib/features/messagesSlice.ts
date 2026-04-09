import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ConversationItem,
  MessageItem,
  fetchMessagesByConversation,
  fetchMyConversations,
} from "@/services/messages-service";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type MessagesState = {
  conversations: ConversationItem[];
  conversationsStatus: RequestStatus;
  conversationsError: string | null;
  messagesByConversation: Record<string, MessageItem[]>;
  messagesStatusByConversation: Record<string, RequestStatus>;
  messagesErrorByConversation: Record<string, string | null>;
  selectedConversationId: number | null;
};

const initialState: MessagesState = {
  conversations: [],
  conversationsStatus: "idle",
  conversationsError: null,
  messagesByConversation: {},
  messagesStatusByConversation: {},
  messagesErrorByConversation: {},
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
    updateConversationPreview: (
      state,
      action: PayloadAction<{
        conversationId: number;
        lastMessagePreview: string;
        lastMessageAt?: string | null;
      }>
    ) => {
      const { conversationId, lastMessagePreview, lastMessageAt } = action.payload;
      state.conversations = state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessagePreview,
              lastMessageAt: lastMessageAt ?? new Date().toISOString(),
            }
          : c
      );
    },
    setMessagesForConversation: (
      state,
      action: PayloadAction<{ conversationId: number; messages: MessageItem[] }>
    ) => {
      const { conversationId, messages } = action.payload;
      state.messagesByConversation[String(conversationId)] = messages;
    },
    addOptimisticMessage: (
      state,
      action: PayloadAction<{ conversationId: number; message: MessageItem }>
    ) => {
      const { conversationId, message } = action.payload;
      const key = String(conversationId);
      const existing = state.messagesByConversation[key] ?? [];
      state.messagesByConversation[key] = [...existing, message];
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
          copy[optimisticIndex] = message;
          state.messagesByConversation[key] = copy;
          return;
        }
      }

      const alreadyExists = existing.some((m) => String(m.id) === String(message.id));
      if (alreadyExists) return;

      state.messagesByConversation[key] = [...existing, message];
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
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = "failed";
        state.conversationsError = action.payload as string;
      })
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg;
        state.messagesStatusByConversation[String(conversationId)] = "loading";
        state.messagesErrorByConversation[String(conversationId)] = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messagesStatusByConversation[String(conversationId)] = "succeeded";
        state.messagesByConversation[String(conversationId)] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action: any) => {
        const conversationId = action.payload?.conversationId ?? action.meta.arg;
        state.messagesStatusByConversation[String(conversationId)] = "failed";
        state.messagesErrorByConversation[String(conversationId)] =
          action.payload?.message || "Failed to load messages";
      });
  },
});

export const {
  setSelectedConversationId,
  setConversations,
  updateConversationPreview,
  setMessagesForConversation,
  addOptimisticMessage,
  upsertMessage,
} = messagesSlice.actions;

export default messagesSlice.reducer;
