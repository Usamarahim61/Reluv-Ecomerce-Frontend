"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Info, CheckCircle2, Send, Image as ImageIcon, Clock, MapPin, Heart, MessageCircle, Search, X, Phone, Globe } from "lucide-react";
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
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

const formatFullDateTime = (value?: string | null) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString([], { 
      month: "short", 
      day: "numeric",
      hour: "2-digit", 
      minute: "2-digit" 
    });
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
  const [searchConversation, setSearchConversation] = useState("");
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

  const filteredConversations = useMemo(
    () => conversations.filter(c => {
      const otherUser = c.buyer?.id === user?.id ? c.seller : c.seller?.id === user?.id ? c.buyer : c.buyer || c.seller;
      const productTitle = c.product?.title || "";
      const search = searchConversation.toLowerCase();
      return (
        otherUser?.username?.toLowerCase().includes(search) ||
        productTitle.toLowerCase().includes(search)
      );
    }),
    [conversations, searchConversation, user?.id]
  );

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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#f0ede8] to-[#faf9f7] px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-white p-4 shadow-lg">
              <MessageCircle size={40} className="text-[#cb6f4d]" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-3">Connect with Buyers & Sellers</h2>
          <p className="text-[#666] text-sm mb-8">Sign in to your account to chat with people about items you&apos;re interested in or selling.</p>
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-[#e0ddd8]">
            <p className="text-sm text-[#888]">You need to be logged in to access your messages.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen md:h-[calc(100vh-70px)] bg-linear-to-br from-[#faf9f7] via-white to-[#f0ede8] ${
      isAndroid ? "android-messages-shell" : ""
    }`}>
      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden md:max-w-7xl md:mx-auto md:mt-4 w-full md:rounded-2xl md:shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:border md:border-[#e0ddd8]">
        
        {/* Left Sidebar - Conversations List */}
        <aside className={`w-full md:w-96 bg-white flex flex-col border-r border-[#e0ddd8] overflow-hidden transition-all duration-300 ${
          viewMessage ? "hidden md:flex" : "flex"
        }`}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#f0ede8]">
            <h1 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-4">Messages</h1>
            
            {/* Search Box */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                type="text"
                value={searchConversation}
                onChange={(e) => setSearchConversation(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-[#f9f8f7] border border-[#e0ddd8] rounded-full pl-11 pr-4 py-2.5 text-sm text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations && conversations.length === 0 ? (
              <div className="p-6 text-center">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-[#f0ede8] rounded-xl" />
                  ))}
                </div>
              </div>
            ) : conversationsError ? (
              <div className="p-4 m-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{conversationsError}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-[#888]">
                <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">{searchConversation ? "No conversations found" : "No conversations yet"}</p>
                <p className="text-xs mt-1">{searchConversation ? "Try a different search" : "Start chatting with buyers and sellers"}</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const otherUser = c.buyer?.id === user.id ? c.seller : c.seller?.id === user.id ? c.buyer : c.buyer || c.seller;
                const productTitle = c.product?.title || "Product";
                const lastText = c.lastMessagePreview || "Start the conversation";
                const lastTime = c.lastMessageAt || c.updatedAt;
                const isSelected = selectedId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      dispatch(setSelectedConversationId(c.id));
                      setViewMessage(true);
                    }}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 border-l-4 ${
                      isSelected
                        ? "bg-linear-to-r from-[#faf8f5] to-transparent border-l-[#cb6f4d]"
                        : "border-l-transparent hover:bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-white text-lg transition-all ${
                        isSelected ? "bg-[#cb6f4d] shadow-md" : "bg-linear-to-br from-[#cb6f4d] to-[#a55840]"
                      }`}>
                        {otherUser?.username?.[0]?.toUpperCase() || "U"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-sm truncate ${isSelected ? "text-[#1a1a1a]" : "text-[#333]"}`}>
                            {otherUser?.username || "User"}
                          </span>
                          <span className={`text-xs whitespace-nowrap ml-2 ${isSelected ? "text-[#cb6f4d]" : "text-[#aaa]"}`}>
                            {formatTime(lastTime)}
                          </span>
                        </div>
                        <p className="text-xs text-[#888] truncate mb-1">{productTitle}</p>
                        <p className={`text-sm truncate ${isSelected ? "text-[#555] font-medium" : "text-[#999]"}`}>
                          {lastText}
                        </p>
                      </div>

                      {/* Verification Badge */}
                      {otherUser?.id && (
                        <CheckCircle2 size={16} className="text-[#cb6f4d] shrink-0 mt-0.5" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main Area - Chat */}
        <main className={`flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 ${
          !viewMessage ? "hidden md:flex" : "flex"
        }`}>
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <MessageCircle size={56} className="text-[#e0ddd8] mb-4" />
              <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">Select a Conversation</h2>
              <p className="text-[#888] text-sm max-w-xs">Choose a conversation from the list to start chatting or view previous messages</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="border-b border-[#f0ede8] px-6 py-4 bg-linear-to-r from-[#faf9f7] to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Back Button */}
                    <button
                      onClick={() => setViewMessage(false)}
                      className="md:hidden p-2 hover:bg-[#f0ede8] rounded-lg transition-colors text-[#888]"
                    >
                      ←
                    </button>

                    {/* Product Image */}
                    <div className="w-14 h-14 bg-[#f0ede8] rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-[#e0ddd8]">
                      {activeConversation.product?.images && getFirstImageUrl(activeConversation.product.images) ? (
                        <img
                          src={getFirstImageUrl(activeConversation.product.images) || ""}
                          alt={activeConversation.product?.title || "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-[#ccc]" size={24} />
                      )}
                    </div>

                    {/* Header Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1a1a1a] text-sm">{peerUser?.username || "User"}</span>
                        <CheckCircle2 size={14} className="text-[#cb6f4d] shrink-0" />
                      </div>
                      <p className="text-xs text-[#888] truncate">{activeConversation.product?.title || "Product"}</p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <button className="p-2 hover:bg-[#f0ede8] rounded-lg transition-colors text-[#888]">
                    <Info size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#fafaf8]">
                {loadingMessages && activeMessages.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`h-12 w-48 bg-[#e0ddd8] rounded-2xl ${i % 2 === 0 ? "ml-auto" : ""}`} />
                      ))}
                    </div>
                  </div>
                ) : messagesError ? (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
                    <p className="text-sm text-red-700">{messagesError}</p>
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Heart size={40} className="text-[#f0ede8] mb-3" />
                    <p className="font-serif text-lg font-bold text-[#1a1a1a] mb-1">Start the conversation</p>
                    <p className="text-sm text-[#888]">Say hello! Break the ice with a friendly message.</p>
                  </div>
                ) : (
                  activeMessages.map((msg, idx) => {
                    const isMine = msg.sender?.id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className="flex flex-col max-w-xs">
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm transition-all ${
                              isMine
                                ? "bg-[#cb6f4d] text-white rounded-br-none shadow-md"
                                : "bg-white border border-[#e0ddd8] text-[#333] rounded-bl-none shadow-sm"
                            }`}
                          >
                            <p className="wrap-break-word">{msg.content}</p>
                          </div>
                          <span className={`text-xs mt-1 ${isMine ? "text-right" : "text-left"} text-[#aaa]`}>
                            {formatFullDateTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className={`border-t border-[#f0ede8] px-6 py-4 bg-white shrink-0 ${
                isAndroid ? "android-message-composer" : ""
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Write a message..."
                    className="flex-1 border border-[#e0ddd8] rounded-full px-5 py-3 text-sm text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#cb6f4d] focus:ring-1 focus:ring-[#cb6f4d]/30 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="w-11 h-11 rounded-full bg-[#cb6f4d] text-white flex items-center justify-center hover:bg-[#b85f3d] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    <Send size={20} />
                  </button>
                </div>
                {error && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
