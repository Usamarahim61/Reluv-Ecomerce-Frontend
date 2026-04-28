"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Info, CheckCircle2, Send, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { ConversationItem, MessageItem } from "@/services/messages-service";
import { getChatSocket, disconnectChatSocket } from "@/lib/chat-socket";
import { getFirstImageUrl } from "@/services/products-service";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAndroidNative } from "@/app/components/useAndroidNative";
import {
  addOptimisticMessage,
  fetchConversations,
  fetchMessages,
  setSelectedConversationId,
  updateConversationPreview,
  upsertMessage,
} from "@/lib/features/messagesSlice";

const formatTime = (value?: string | null) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export default function MessagesClient() {
  const { user } = useAuth();
  const { isAndroid } = useAndroidNative();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const conversations = useAppSelector((state) => state.messages.conversations);
  const selectedId = useAppSelector((state) => state.messages.selectedConversationId);
  const loadingConversations = useAppSelector((state) => state.messages.conversationsStatus === "loading");
  const conversationsError = useAppSelector((state) => state.messages.conversationsError);
  const messagesByConversation = useAppSelector((state) => state.messages.messagesByConversation);
  const messagesStatusByConversation = useAppSelector(
    (state) => state.messages.messagesStatusByConversation
  );
  const messagesErrorByConversation = useAppSelector(
    (state) => state.messages.messagesErrorByConversation
  );
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [viewMessage, setViewMessage] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const peerUser = useMemo(() => {
    if (!activeConversation || !user?.id) return null;
    const buyer = activeConversation.buyer;
    const seller = activeConversation.seller;
    if (buyer?.id === user.id) return seller;
    if (seller?.id === user.id) return buyer;
    return buyer || seller;
  }, [activeConversation, user]);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchConversations());
  }, [dispatch, user?.id]);

  useEffect(() => {
    const paramId = Number(searchParams.get("conversationId"));
    if (Number.isInteger(paramId) && paramId > 0) {
      dispatch(setSelectedConversationId(paramId));
    } else if (conversations.length > 0 && !selectedId) {
      dispatch(setSelectedConversationId(conversations[0].id));
    }
  }, [conversations, dispatch, searchParams, selectedId]);

  useEffect(() => {
    if (!selectedId || !user?.id) return;
    dispatch(fetchMessages(selectedId));
  }, [dispatch, selectedId, user?.id]);

  useEffect(() => {
    if (!selectedId || !user?.id) return;
    const socket = getChatSocket();
    socket.emit("conversation:join", { conversationId: selectedId });

    const handleNewMessage = (message: MessageItem & { conversationId?: number; clientMessageId?: string }) => {
      if (message.conversationId && message.conversationId !== selectedId) return;
      dispatch(
        upsertMessage({
          conversationId: message.conversationId ?? selectedId,
          message,
        })
      );
      dispatch(
        updateConversationPreview({
          conversationId: message.conversationId ?? selectedId,
          lastMessagePreview: message.content,
          lastMessageAt: message.createdAt || new Date().toISOString(),
        })
      );
    };

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [selectedId, user?.id]);

  const activeMessages = selectedId ? messagesByConversation[String(selectedId)] ?? [] : [];
  const loadingMessages =
    selectedId ? messagesStatusByConversation[String(selectedId)] === "loading" : false;
  const messagesError = selectedId ? messagesErrorByConversation[String(selectedId)] : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  useEffect(() => {
    return () => {
      disconnectChatSocket();
    };
  }, []);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || !selectedId) return;
    const socket = getChatSocket();
    const clientMessageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimisticMessage: MessageItem = {
      id: `temp-${clientMessageId}`,
      content: text,
      createdAt: new Date().toISOString(),
      sender: user ? { id: user.id, username: user.username } : null,
    };
    dispatch(addOptimisticMessage({ conversationId: selectedId, message: optimisticMessage }));
    dispatch(
      updateConversationPreview({
        conversationId: selectedId,
        lastMessagePreview: text,
        lastMessageAt: optimisticMessage.createdAt,
      })
    );
    socket.emit("message:send", { conversationId: selectedId, content: text, clientMessageId });
    setInputValue("");
  };

  if (!user) {
    return (
      <>
        
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in to view messages</h2>
          <p className="text-sm text-gray-500">You need an account to chat with buyers and sellers.</p>
        </div>
      </>
    );
  }

  return (
    <>
      
      <div
        className={`md:mt-5 flex flex-col max-w-7xl mx-auto bg-white font-sans text-[#111111] md:border md:border-gray-300 overflow-hidden ${
          isAndroid
            ? "h-[calc(100dvh-190px)] pb-[1px]"
            : "h-[calc(100vh-70px)] md:h-[85vh]"
        }`}
      >
        <div className="flex border-b border-gray-200 text-sm font-medium">
          <div className={`w-full md:w-80 p-4 border-r border-gray-200 ${viewMessage ? "hidden md:block" : "block"}`}>
            Inbox
          </div>
          <div className={`flex-1 p-4 flex justify-between items-center bg-white ${!viewMessage ? "hidden md:flex" : "flex"}`}>
            <button onClick={() => setViewMessage(false)} className="md:hidden text-[#007782] font-medium">
            Back
            </button>
            <div className="flex items-center gap-1 mx-auto md:mx-0">
              <span className="font-semibold text-lg">{peerUser?.username || "Conversation"}</span>
              {peerUser?.id && (
                <CheckCircle2 size={16} className="text-[#007782] fill-current text-white" />
              )}
            </div>
            <Info size={20} className="text-gray-400 cursor-pointer" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className={`w-full md:w-80 border-r border-gray-200 flex flex-col bg-white ${viewMessage ? "hidden md:flex" : "flex"}`}>
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="p-4 text-sm text-gray-500">Loading conversations...</div>
              ) : null}
              {conversationsError ? (
                <div className="p-4 text-sm text-red-500">{conversationsError}</div>
              ) : null}
              {!loadingConversations && conversations.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
              ) : null}
              {conversations.map((c) => {
                const otherUser =
                  c.buyer?.id === user.id ? c.seller : c.seller?.id === user.id ? c.buyer : c.buyer || c.seller;
                const productTitle = c.product?.title || "Product";
                const lastText = c.lastMessagePreview || "Start the conversation";
                const lastTime = c.lastMessageAt || c.updatedAt;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      dispatch(setSelectedConversationId(c.id));
                      setViewMessage(true);
                    }}
                    className={`flex items-start gap-3 p-4 cursor-pointer border-b border-gray-50 transition-colors ${
                      selectedId === c.id ? "bg-[#f2f2f2] border-l-4 border-[#007782]" : "hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="relative w-12 h-12 bg-[#007782] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {otherUser?.username?.[0]?.toUpperCase() || "U"}
                      {otherUser?.id && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                          <CheckCircle2 size={14} className="text-[#007782]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className={`text-[15px] ${selectedId === c.id ? "font-bold" : "font-medium"}`}>
                          {otherUser?.username || "User"}
                        </span>
                        <span className="text-gray-500 text-xs">{formatTime(lastTime)}</span>
                      </div>
                      <p className="text-gray-500 text-[12px] truncate">{productTitle}</p>
                      <p className="text-gray-600 text-[14px] truncate">{lastText}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <main className={`flex-1 flex-col bg-[#f5f5f5] md:bg-white overflow-hidden ${!viewMessage ? "hidden md:flex" : "flex"}`}>
            {!activeConversation ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                Select a conversation to start chatting.
              </div>
            ) : (
              <>
                <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {activeConversation.product?.images && getFirstImageUrl(activeConversation.product.images) ? (
                      <img
                        src={getFirstImageUrl(activeConversation.product.images) || ""}
                        alt={activeConversation.product?.title || "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-gray-400" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{activeConversation.product?.title || "Product"}</p>
                    <p className="text-xs text-gray-500">Conversation about this item</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                  {loadingMessages ? (
                    <div className="text-sm text-gray-500">Loading messages...</div>
                  ) : null}
                  {messagesError ? (
                    <div className="text-sm text-red-500">{messagesError}</div>
                  ) : null}
                  {!loadingMessages && activeMessages.length === 0 ? (
                    <div className="text-sm text-gray-500">No messages yet. Say hello!</div>
                  ) : null}
                  {activeMessages.map((msg) => {
                    const isMine = msg.sender?.id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isMine ? "bg-[#007782] text-white" : "bg-white border border-gray-200 text-gray-800"
                        }`}>
                          <p>{msg.content}</p>
                          <div className={`mt-1 text-[10px] ${isMine ? "text-white/70" : "text-gray-400"}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-gray-100 px-4 py-3 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message"
                      className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#007782]"
                    />
                    <button
                      onClick={handleSend}
                      className="w-10 h-10 rounded-full bg-[#007782] text-white flex items-center justify-center hover:bg-[#00656f]"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
