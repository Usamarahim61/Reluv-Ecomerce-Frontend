"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Info,
  CheckCircle2,
  Send,
  Image as ImageIcon,
  Clock,
  MapPin,
  Heart,
  MessageCircle,
  Search,
  X,
  Phone,
  Globe,
  Plus,
  Paperclip,
  Tag,
  CheckCircle,
  XCircle,
  DollarSign,
  Loader2,
  Coins,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ConversationItem,
  MessageItem,
  uploadFiles,
} from "@/services/messages-service";
import { respondToOffer } from "@/services/offers-service";
import { getChatSocket, disconnectChatSocket } from "@/lib/chat-socket";
import { getFirstImageUrl } from "@/services/products-service";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAndroidNative } from "@/app/components/useAndroidNative";
import { API_BASE_URL } from "@/app/constants/api";
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
      minute: "2-digit",
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
  const router = useRouter();
  const conversations = useAppSelector((state) => state.messages.conversations);
  const selectedId = useAppSelector(
    (state) => state.messages.selectedConversationId,
  );
  const [deleteConfirmPending, setDeleteConfirmPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blockConfirmPending, setBlockConfirmPending] = useState(false);
  const loadingConversations = useAppSelector(
    (state) => state.messages.conversationsStatus === "loading",
  );
  const conversationsError = useAppSelector(
    (state) => state.messages.conversationsError,
  );
  const messagesByConversation = useAppSelector(
    (state) => state.messages.messagesByConversation,
  );
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const messagesStatusByConversation = useAppSelector(
    (state) => state.messages.messagesStatusByConversation,
  );
  const messagesErrorByConversation = useAppSelector(
    (state) => state.messages.messagesErrorByConversation,
  );
  const [blockStatus, setBlockStatus] = useState({
    iBlockedThem: false,
    theyBlockedMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [viewMessage, setViewMessage] = useState(false);
  const [searchConversation, setSearchConversation] = useState("");
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerError, setOfferError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [respondingToOfferId, setRespondingToOfferId] = useState<number | null>(
    null,
  );
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageModal, setImageModal] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [pdfModal, setPdfModal] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const plusMenuRef = useRef<HTMLDivElement | null>(null);
  const lastParamIdRef = useRef<number | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId],
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
    const paramIdStr = searchParams.get("conversationId");
    const paramId = paramIdStr ? Number(paramIdStr) : null;

    // Only sync URL to State if the URL parameter has actually changed.
    // This prevents the effect from re-opening a chat we just manually closed.
    if (paramId !== lastParamIdRef.current) {
      lastParamIdRef.current = paramId;

      if (paramId && Number.isInteger(paramId) && paramId > 0) {
        if (selectedId !== paramId) {
          dispatch(setSelectedConversationId(paramId));
          setViewMessage(true);
        }
      } else if (selectedId !== null) {
        // Parameter was removed from URL (e.g. back button or manual navigation)
        dispatch(setSelectedConversationId(null));
        setViewMessage(false);
      }
    }
  }, [dispatch, searchParams, selectedId]);

  useEffect(() => {
    if (!selectedId || !user?.id) return;
    fetch(`${API_BASE_URL}/api/blocks/status/${peerUser?.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    })
      .then((res) => res.json())
      .then((data) => setBlockStatus(data))
      .catch(() => {});
    dispatch(fetchMessages(selectedId)).then((result: any) => {
      if (result.payload?.messages) {
        console.log(
          "Fetched messages for conversation",
          selectedId,
          ":",
          result.payload.messages,
        );
        result.payload.messages.forEach((msg: any, i: number) => {
          console.log(`Message ${i}:`, {
            id: msg.id,
            content: msg.content,
            hasAttachments: !!msg.attachments,
            attachmentsCount: msg.attachments?.length || 0,
            attachments: msg.attachments,
          });
        });
      }
    });

    // Re-fetch conversations when messages are loaded to update unread count
    return () => {
      dispatch(fetchConversations());
    };
  }, [dispatch, selectedId, user?.id]);

  const isBlocked = blockStatus.iBlockedThem || blockStatus.theyBlockedMe;

  const [isBlocking, setIsBlocking] = useState(false);

  const handleBlockUser = async () => {
    if (!peerUser?.id) return;

    const loadingToastId = toast.loading(`Blocking ${peerUser.username}...`);

    try {
      setIsBlocking(true);
      const res = await fetch(
        `${API_BASE_URL}/api/blocks/block/${peerUser.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        },
      );
      if (!res.ok) throw new Error("Failed to block user");

      setBlockStatus((prev) => ({ ...prev, iBlockedThem: true }));
      setBlockConfirmPending(false);
      setShowDetailsPanel(false);
      toast.update(loadingToastId, {
        render: `${peerUser.username} has been blocked.`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err: any) {
      setBlockConfirmPending(false);
      toast.update(loadingToastId, {
        render: err.message || "Failed to block user",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!peerUser?.id) return;

    const loadingToastId = toast.loading(`Unblocking ${peerUser.username}...`);

    try {
      setIsBlocking(true);
      const res = await fetch(
        `${API_BASE_URL}/api/blocks/unblock/${peerUser.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        },
      );
      if (!res.ok) throw new Error("Failed to unblock user");

      setBlockStatus((prev) => ({ ...prev, iBlockedThem: false }));
      setShowDetailsPanel(false);
      toast.update(loadingToastId, {
        render: `${peerUser.username} has been unblocked.`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err: any) {
      toast.update(loadingToastId, {
        render: err.message || "Failed to unblock user",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsBlocking(false);
    }
  };
  useEffect(() => {
    if (!selectedId || !user?.id) return;
    const socket = getChatSocket();
    socket.emit("conversation:join", { conversationId: selectedId });

    const handleNewMessage = (
      message: MessageItem & {
        conversationId?: number;
        clientMessageId?: string;
      },
    ) => {
      if (message.conversationId && message.conversationId !== selectedId)
        return;
      console.log("Socket message:new received:", message);
      dispatch(
        upsertMessage({
          conversationId: message.conversationId ?? selectedId,
          message,
        }),
      );
      dispatch(
        updateConversationPreview({
          conversationId: message.conversationId ?? selectedId,
          lastMessagePreview: message.content,
          lastMessageAt: message.createdAt || new Date().toISOString(),
        }),
      );
    };

    const handleMessagesRead = () => {
      // Re-fetch conversations when messages are marked as read
      dispatch(fetchConversations());
    };

    socket.on("message:new", handleNewMessage);
    socket.on("messages:read", handleMessagesRead);
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("messages:read", handleMessagesRead);
    };
  }, [selectedId, user?.id, dispatch]);

  const activeMessages = selectedId
    ? (messagesByConversation[String(selectedId)] ?? [])
    : [];
  const loadingMessages = selectedId
    ? messagesStatusByConversation[String(selectedId)] === "loading"
    : false;
  const messagesError = selectedId
    ? messagesErrorByConversation[String(selectedId)]
    : null;

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) => {
        const otherUser =
          c.buyer?.id === user?.id
            ? c.seller
            : c.seller?.id === user?.id
              ? c.buyer
              : c.buyer || c.seller;
        const productTitle = c.product?.title || "";
        const search = searchConversation.toLowerCase();
        return (
          otherUser?.username?.toLowerCase().includes(search) ||
          productTitle.toLowerCase().includes(search)
        );
      }),
    [conversations, searchConversation, user?.id],
  );

  useEffect(() => {
    if (!selectedId) return; // Prevent scrolling jump when closing the chat
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, selectedId]);

  useEffect(() => {
    return () => {
      disconnectChatSocket();
    };
  }, []);

  // Close plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        plusMenuRef.current &&
        !plusMenuRef.current.contains(event.target as Node)
      ) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async () => {
    const text = inputValue.trim();
    if ((!text && selectedFiles.length === 0) || !selectedId) return;

    try {
      setIsUploading(true);
      setError(null);
      let attachmentIds: number[] = [];

      if (selectedFiles.length > 0) {
        attachmentIds = await uploadFiles(selectedFiles);
      }

      const socket = getChatSocket();
      const clientMessageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const optimisticMessage: MessageItem = {
        id: `temp-${clientMessageId}`,
        content: text || (selectedFiles.length > 0 ? "📎 Sending file..." : ""),
        createdAt: new Date().toISOString(),
        sender: user ? { id: user.id, username: user.username } : null,
      };

      dispatch(
        addOptimisticMessage({
          conversationId: selectedId,
          message: optimisticMessage,
        }),
      );
      dispatch(
        updateConversationPreview({
          conversationId: selectedId,
          lastMessagePreview: text || "📎 Attachment",
          lastMessageAt: optimisticMessage.createdAt,
        }),
      );

      socket.emit("message:send", {
        conversationId: selectedId,
        content: text || "",
        attachments: attachmentIds,
        clientMessageId,
      });

      console.log("Emitted message:send with:", {
        conversationId: selectedId,
        contentLength: text?.length || 0,
        attachmentIds,
        clientMessageId,
        socketConnected: socket.connected,
      });

      setInputValue("");
      setSelectedFiles([]);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      if (error.message === "Authentication required") {
        setError("Please log in again to upload files.");
      } else {
        setError(error.message || "Failed to upload files. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter((f) => f.size > maxSize);

    if (oversizedFiles.length > 0) {
      setError(`Some files are too large. Maximum size is 10MB.`);
      return;
    }

    setSelectedFiles(files);
    setShowPlusMenu(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOfferResponse = async (
    offerId: number,
    action: "accepted" | "declined",
  ) => {
    if (!user?.id || !selectedId) return;

    try {
      setRespondingToOfferId(offerId);
      const response = await respondToOffer(offerId, {
        action,
        sellerId: user.id,
        conversationId: selectedId,
      });

      // Refresh messages to show the response message created by backend
      dispatch(fetchMessages(selectedId));
      toast.success(`Offer ${action}!`);
    } catch (err: any) {
      console.error("Failed to respond to offer:", err);
      setError(err.message || "Failed to respond to offer");
      toast.error(err.message || "Failed to respond to offer");
    } finally {
      setRespondingToOfferId(null);
    }
  };

  const handleBuyWithOffer = (offer: any) => {
    if (!offer || !activeConversation) return;

    const product = activeConversation.product;
    const seller = activeConversation.seller;
    const imageUrl =
      offer.productImage ||
      (product?.images ? getFirstImageUrl(product.images) || "" : "");

    router.push(
      `/CheckOut?${new URLSearchParams({
        productId: String(product?.id || ""),
        documentId: String(product?.documentId || ""),
        title: offer.productTitle || product?.title || "Product",
        brand: product?.brand || "Reluv",
        size: product?.size || "One Size",
        price: String(offer.offerPrice),
        currency: "TBH",
        imageUrl: imageUrl,
        buyerProtectionFee: "100",
        shippingFee: "100",
        sellerId: String(seller?.id || ""),
        offerId: String(offer.id),
      }).toString()}`,
    );
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith("image/")) return "🖼️";
    if (mime === "application/pdf") return "📄";
    return "📎";
  };

  const productPrice = activeConversation?.product?.price
    ? parseFloat(String(activeConversation.product.price))
    : 0;
  const minOffer = productPrice * 0.5;
  const maxOffer = productPrice * 1.5;

  const handleMakeOffer = () => {
    setShowPlusMenu(false);
    setShowOfferModal(true);
    setOfferAmount("");
    setOfferMessage("");
    setOfferError(null);
  };

  const handleQuickOffer = (percentage: number) => {
    const amount = (productPrice * percentage).toFixed(2);
    setOfferAmount(amount);
  };

  const handleSendOffer = async () => {
    const amount = parseFloat(offerAmount);
    setOfferError(null);

    if (!amount || amount <= 0 || !selectedId || !activeConversation) {
      const msg = "Please enter a valid offer amount";
      setOfferError(msg);
      toast.error(msg);
      return;
    }

    if (amount < minOffer) {
      const msg = `Offer is too low. Minimum offer is TBH${minOffer.toFixed(2)}.`;
      setOfferError(msg);
      toast.error(msg);
      return;
    }
    if (amount > maxOffer) {
      const msg = `Offer is too high. Maximum offer is TBH${maxOffer.toFixed(2)}.`;
      setOfferError(msg);
      toast.error(msg);
      return;
    }

    setIsSendingOffer(true);
    try {
      const product = activeConversation.product;
      if (!product) {
        setOfferError("Product not found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/offers/make`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          productId: product.id,
          buyerId: user?.id,
          sellerId: peerUser?.id,
          offerPrice: amount,
          message: offerMessage || undefined,
          conversationId: selectedId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to make offer");
      }

      const { data: offer } = await response.json();

      // Refresh messages to show the offer message created by backend
      dispatch(fetchMessages(selectedId));

      setShowOfferModal(false);
      setOfferAmount("");
      setOfferMessage("");
      setOfferError(null);
      setError(null);
      toast.success("Offer sent successfully!");
    } catch (err: any) {
      console.error("Failed to make offer:", err);
      const msg = err.message || "Failed to send offer";
      setOfferError(msg);
      toast.error(msg);
    } finally {
      setIsSendingOffer(false);
    }
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
          <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-3">
            Connect with Buyers & Sellers
          </h2>
          <p className="text-[#666] text-sm mb-8">
            Sign in to your account to chat with people about items you&apos;re
            interested in or selling.
          </p>
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-[#e0ddd8]">
            <p className="text-sm text-[#888]">
              You need to be logged in to access your messages.
            </p>
          </div>
        </div>
      </div>
    );
  }
  const handleDeleteConversation = async () => {
    if (!selectedId) return;

    const loadingToastId = toast.loading("Deleting conversation...");

    try {
      setIsDeleting(true);
      const res = await fetch(
        `${API_BASE_URL}/api/conversations/${selectedId}/delete`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        },
      );

      if (!res.ok) throw new Error("Failed to delete conversation");

      setDeleteConfirmPending(false);
      setShowDetailsPanel(false);
      dispatch(setSelectedConversationId(null));
      setViewMessage(false);
      dispatch(fetchConversations());

      toast.update(loadingToastId, {
        render: "Conversation deleted.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err: any) {
      setDeleteConfirmPending(false);
      toast.update(loadingToastId, {
        render: err.message || "Failed to delete conversation",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen md:h-[calc(100vh-70px)] bg-linear-to-br from-[#faf9f7] via-white to-[#f0ede8] ${
        isAndroid ? "android-messages-shell" : ""
      }`}
    >
      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden md:max-w-7xl md:mx-auto md:mt-4 w-full md:rounded-2xl md:shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:border md:border-[#e0ddd8]">
        {/* Left Sidebar - Conversations List */}
        <aside
          className={`w-full md:w-96 bg-white flex flex-col border-r border-[#e0ddd8] overflow-hidden transition-all duration-300 ${
            viewMessage ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#f0ede8]">
            <h1 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-4">
              Messages
            </h1>

            {/* Search Box */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]"
              />
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
                <p className="text-sm font-medium">
                  {searchConversation
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
                <p className="text-xs mt-1">
                  {searchConversation
                    ? "Try a different search"
                    : "Start chatting with buyers and sellers"}
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const otherUser =
                  c.buyer?.id === user.id
                    ? c.seller
                    : c.seller?.id === user.id
                      ? c.buyer
                      : c.buyer || c.seller;
                const productTitle = c.product?.title || "Product";
                const lastText =
                  c.lastMessagePreview || "Start the conversation";
                const lastTime = c.lastMessageAt || c.updatedAt;
                const isSelected = selectedId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      dispatch(setSelectedConversationId(c.id));
                      setViewMessage(true);
                      // Sync URL with the selection to prevent the parameter listener from reverting the change
                      router.replace(`/Messages?conversationId=${c.id}`, { scroll: false });
                    }}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 border-l-4 ${
                      isSelected
                        ? "bg-linear-to-r from-[#faf8f5] to-transparent border-l-[#cb6f4d]"
                        : "border-l-transparent hover:bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-white text-lg transition-all ${
                          isSelected
                            ? "bg-[#cb6f4d] shadow-md"
                            : "bg-linear-to-br from-[#cb6f4d] to-[#a55840]"
                        }`}
                      >
                        {otherUser?.username?.[0]?.toUpperCase() || "U"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-semibold text-sm truncate ${isSelected ? "text-[#1a1a1a]" : "text-[#333]"}`}
                          >
                            {otherUser?.username || "User"}
                          </span>
                          <span
                            className={`text-xs whitespace-nowrap ml-2 ${isSelected ? "text-[#cb6f4d]" : "text-[#aaa]"}`}
                          >
                            {formatTime(lastTime)}
                          </span>
                        </div>
                        <p className="text-xs text-[#888] truncate mb-1">
                          {productTitle}
                        </p>
                        <p
                          className={`text-sm truncate ${isSelected ? "text-[#555] font-medium" : "text-[#999]"}`}
                        >
                          {lastText}
                        </p>
                      </div>

                      {/* Verification Badge */}
                      {otherUser?.id && (
                        <CheckCircle2
                          size={16}
                          className="text-[#cb6f4d] shrink-0 mt-0.5"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main Area - Chat */}
        <main
          className={`relative flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 ${
            !viewMessage ? "hidden md:flex" : "flex"
          }`}
        >
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <MessageCircle size={56} className="text-[#e0ddd8] mb-4" />
              <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">
                Select a Conversation
              </h2>
              <p className="text-[#888] text-sm max-w-xs">
                Choose a conversation from the list to start chatting or view
                previous messages
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="border-b border-[#f0ede8] px-6 py-4 bg-linear-to-r from-[#faf9f7] to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Back Button */}
                    <button
                      onClick={() => setViewMessage(false)}
                      className="md:hidden p-2 hover:bg-[#f0ede8] rounded-lg transition-colors text-[#888]"
                    >
                      ←
                    </button>

                    {/* Product Image - Clickable */}
                    <Link
                      href={`/products/${activeConversation.product?.id}`}
                      className="w-14 h-14 bg-[#f0ede8] rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-[#e0ddd8] hover:border-[#cb6f4d] transition-all cursor-pointer group"
                    >
                      {activeConversation.product?.images &&
                      getFirstImageUrl(activeConversation.product.images) ? (
                        <img
                          src={
                            getFirstImageUrl(
                              activeConversation.product.images,
                            ) || ""
                          }
                          alt={activeConversation.product?.title || "Product"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ImageIcon
                          className="text-[#ccc] group-hover:text-[#cb6f4d] transition-colors"
                          size={24}
                        />
                      )}
                    </Link>

                    {/* Header Info - Clickable */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1a1a1a] text-sm">
                          {peerUser?.username || "User"}
                        </span>
                        <CheckCircle2
                          size={14}
                          className="text-[#cb6f4d] shrink-0"
                        />
                      </div>
                      <Link
                        href={`/products/${activeConversation.product?.id}`}
                        className="text-xs text-[#888] hover:text-[#cb6f4d] truncate block transition-colors cursor-pointer"
                      >
                        {activeConversation.product?.title || "Product"}
                      </Link>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        setShowDetailsPanel((prev) => !prev);
                        setBlockConfirmPending(false);
                        setDeleteConfirmPending(false);
                      }}
                      className={`p-2 hover:bg-[#f0ede8] rounded-lg transition-colors ${
                        showDetailsPanel ? "text-[#cb6f4d]" : "text-[#888]"
                      }`}
                      title="Details"
                    >
                      <Info size={20} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Details Panel */}
              {showDetailsPanel && activeConversation && (
                <div className="absolute inset-0 z-30">
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/20"
                    onClick={() => setShowDetailsPanel(false)}
                  />
                  {/* Panel */}
                  <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-[#e0ddd8] flex flex-col shadow-2xl z-10 animate-slideInRight">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0ede8] shrink-0">
                      <h2 className="text-lg font-semibold text-[#1a1a1a]">
                        Details
                      </h2>
                      <button
                        onClick={() => setShowDetailsPanel(false)}
                        className="w-8 h-8 rounded-full hover:bg-[#f0ede8] flex items-center justify-center transition-colors"
                      >
                        <X size={20} className="text-[#888]" />
                      </button>
                    </div>

                    {/* Options List */}
                    <div className="flex flex-col">
                      {/* User Profile Link */}
                      <Link
                        href={`/member/${peerUser?.id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-[#faf9f7] transition-colors group border-b border-[#f0ede8]"
                        onClick={() => setShowDetailsPanel(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#cb6f4d] to-[#a55840] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {peerUser?.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="text-sm font-medium text-[#1a1a1a]">
                            {peerUser?.username || "User"}
                          </span>
                        </div>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-[#aaa] group-hover:text-[#cb6f4d] transition-colors"
                        >
                          <path
                            d="M6 3l5 5-5 5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>

                      {/* Close Chat */}
                      <button
                      onClick={() => {
                        dispatch(setSelectedConversationId(null));
                        setViewMessage(false);
                        setShowDetailsPanel(false);
                        router.replace("/Messages", { scroll: false });
                      }}
                        className="flex items-center gap-3 px-6 py-4 hover:bg-[#faf9f7] transition-colors text-left group border-b border-[#f0ede8]"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#f0ede8] group-hover:bg-[#e0ddd8] flex items-center justify-center shrink-0 transition-colors">
                          <X size={18} className="text-[#888]" />
                        </div>
                        <span className="text-sm font-medium text-[#1a1a1a]">
                          Close chat
                        </span>
                      </button>

                      {/* Delete Conversation */}

                      {deleteConfirmPending ? (
                        <div className="px-6 py-4 border-b border-[#f0ede8]">
                          <p className="text-sm font-semibold text-[#1a1a1a] mb-1">
                            Delete this conversation?
                          </p>
                          <p className="text-xs text-[#888] mb-4">
                            All messages and files will be permanently deleted.
                            This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeleteConfirmPending(false)}
                              disabled={isDeleting}
                              className="flex-1 px-3 py-2 border border-[#e0ddd8] text-[#888] rounded-xl text-sm font-semibold hover:bg-[#f0ede8] transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDeleteConversation}
                              disabled={isDeleting}
                              className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {isDeleting ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : null}
                              {isDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmPending(true)}
                          disabled={isDeleting}
                          className="flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition-colors text-left group border-b border-[#f0ede8] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-9 h-9 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-red-500"
                            >
                              <path
                                d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 11v6M14 11v6"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-red-500">
                            Delete conversation
                          </span>
                        </button>
                      )}

                      {/* Block / Unblock */}
                      {/* Block / Unblock */}
                      {blockConfirmPending ? (
                        <div className="px-6 py-4 border-t border-[#f0ede8]">
                          <p className="text-sm font-semibold text-[#1a1a1a] mb-1">
                            Block {peerUser?.username}?
                          </p>
                          <p className="text-xs text-[#888] mb-4">
                            They won't be able to message you anywhere on Reluv.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setBlockConfirmPending(false)}
                              disabled={isBlocking}
                              className="flex-1 px-3 py-2 border border-[#e0ddd8] text-[#888] rounded-xl text-sm font-semibold hover:bg-[#f0ede8] transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleBlockUser}
                              disabled={isBlocking}
                              className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {isBlocking ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : null}
                              {isBlocking ? "Blocking..." : "Yes, Block"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={
                            blockStatus.iBlockedThem
                              ? handleUnblockUser
                              : () => setBlockConfirmPending(true)
                          }
                          disabled={isBlocking}
                          className="flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-9 h-9 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                            {isBlocking ? (
                              <Loader2
                                size={18}
                                className="text-red-500 animate-spin"
                              />
                            ) : (
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="text-red-500"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                />
                                <path
                                  d="M5.6 5.6l12.8 12.8"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-red-500">
                            {isBlocking
                              ? "Unblocking..."
                              : blockStatus.iBlockedThem
                                ? "Unblock user"
                                : "Block user"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#fafaf8]">
                {loadingMessages && activeMessages.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-12 w-48 bg-[#e0ddd8] rounded-2xl ${i % 2 === 0 ? "ml-auto" : ""}`}
                        />
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
                    <p className="font-serif text-lg font-bold text-[#1a1a1a] mb-1">
                      Start the conversation
                    </p>
                    <p className="text-sm text-[#888]">
                      Say hello! Break the ice with a friendly message.
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg, idx) => {
                    const isMine = Number(msg.sender?.id) === Number(user?.id);

                    // Unified offer data extraction
                    const isOffer =
                      msg.metadata?.type === "offer" ||
                      msg.metadata?.type === "offer_response" ||
                      !!msg.offer;
                    const offerId = msg.offer?.id || msg.metadata?.offerId;
                    const offerAmount =
                      msg.offer?.offerPrice ?? msg.metadata?.amount;
                    const offerStatus =
                      msg.offer?.status || msg.metadata?.status;
                    const originalPrice =
                      msg.offer?.originalPrice ||
                      (activeConversation?.product?.price
                        ? parseFloat(String(activeConversation.product.price))
                        : 0);

                    console.log(
                      "Rendering message:",
                      msg.id,
                      "Offer data:",
                      {
                        hasOffer: !!msg.offer,
                        offerId: msg.offer?.id,
                        offerSeller: msg.offer?.seller,
                        offerBuyer: msg.offer?.buyer,
                        offerStatus: msg.offer?.status,
                        isMine,
                        userId: user?.id,
                      },
                      "Has attachments:",
                      msg.attachments?.length || 0,
                      msg.attachments,
                    );
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex flex-col max-w-xs">
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm transition-all ${
                              isMine
                                ? "bg-[#cb6f4d] text-white rounded-br-none shadow-md"
                                : "bg-white border border-[#e0ddd8] text-[#333] rounded-bl-none shadow-sm"
                            }`}
                          >
                            {msg.content && (
                              <p className="wrap-break-word mb-1">
                                {msg.content}
                              </p>
                            )}

                            {/* Offer Card */}
                            {isOffer && offerId && (
                              <div
                                className={`mt-2 p-3 rounded-xl ${
                                  isMine ? "bg-white/10" : "bg-[#faf9f7]"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      isMine ? "bg-white/20" : "bg-[#cb6f4d]/10"
                                    }`}
                                  >
                                    <Coins
                                      size={20}
                                      className={
                                        isMine ? "text-white" : "text-[#cb6f4d]"
                                      }
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className={`text-xs font-bold ${
                                          isMine
                                            ? "text-white"
                                            : "text-[#1a1a1a]"
                                        }`}
                                      >
                                        Offer: TBH
                                        {typeof offerAmount === "number"
                                          ? offerAmount.toFixed(2)
                                          : offerAmount}
                                      </span>
                                      {offerStatus === "pending" && (
                                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                                          Pending
                                        </span>
                                      )}
                                      {offerStatus === "accepted" && (
                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                                          Accepted
                                        </span>
                                      )}
                                      {offerStatus === "declined" && (
                                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                                          Declined
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className={`text-xs ${isMine ? "text-white/70" : "text-[#888]"}`}
                                    >
                                      Original Price: TBH{originalPrice}
                                    </p>

                                    {/* Offer Actions - Show to the person who should respond */}
                                    {!isMine &&
                                      offerStatus === "pending" && (() => {
                                        // Check if current user is the offer seller
                                        // (who should respond to the offer)
                                        const offerSellerId = typeof msg.offer?.seller === 'number' ? msg.offer.seller : msg.offer?.seller?.id;
                                        const offerBuyerId = typeof msg.offer?.buyer === 'number' ? msg.offer.buyer : msg.offer?.buyer?.id;
                                        const isOfferSeller = offerSellerId && Number(offerSellerId) === Number(user?.id);
                                        const isOfferBuyer = offerBuyerId && Number(offerBuyerId) === Number(user?.id);
                                        
                                        // If offer has full data, use it directly
                                        if (offerSellerId) {
                                          return isOfferSeller;
                                        }
                                        
                                        // Fallback: The offer message is sent by the person making the offer
                                        // If I receive it (!isMine), then I should respond
                                        // This works for both initial offers and counter-offers
                                        const shouldShowButtons = !isMine;
                                        
                                        console.log('Offer button logic:', {
                                          offerId,
                                          offerSellerId,
                                          offerBuyerId,
                                          isOfferSeller,
                                          isOfferBuyer,
                                          isMine,
                                          shouldShowButtons,
                                          userId: user?.id,
                                          messageSenderId: msg.sender?.id
                                        });
                                        
                                        return shouldShowButtons;
                                      })() && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                          <button
                                            onClick={() =>
                                              handleOfferResponse(
                                                Number(offerId),
                                                "accepted",
                                              )
                                            }
                                            disabled={
                                              respondingToOfferId ===
                                              Number(offerId)
                                            }
                                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                          >
                                            {respondingToOfferId ===
                                            Number(offerId) ? (
                                              <Loader2
                                                size={14}
                                                className="animate-spin"
                                              />
                                            ) : (
                                              <>
                                                <CheckCircle size={14} /> Accept
                                              </>
                                            )}
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleOfferResponse(
                                                Number(offerId),
                                                "declined",
                                              )
                                            }
                                            disabled={
                                              respondingToOfferId ===
                                              Number(offerId)
                                            }
                                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                          >
                                            {respondingToOfferId ===
                                            Number(offerId) ? (
                                              <Loader2
                                                size={14}
                                                className="animate-spin"
                                              />
                                            ) : (
                                              <>
                                                <XCircle size={14} /> Decline
                                              </>
                                            )}
                                          </button>
                                          <button
                                            onClick={() => {
                                              setOfferAmount(
                                                String(offerAmount),
                                              );
                                              setShowOfferModal(true);
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-[#cb6f4d] text-[#cb6f4d] hover:bg-orange-50 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                          >
                                            <Tag size={14} />
                                            Counter Offer
                                          </button>
                                        </div>
                                      )}

                                    {/* Checkout button for accepted offers */}
                                    {offerStatus === "accepted" &&
                                      Number(activeConversation?.buyer?.id) ===
                                        Number(user?.id) && (
                                        <button
                                          onClick={() =>
                                            handleBuyWithOffer(msg.offer)
                                          }
                                          className="block w-full mt-3 px-3 py-2 bg-[#cb6f4d] hover:bg-[#b85f3d] text-white rounded-lg text-xs font-semibold transition-colors text-center cursor-pointer"
                                        >
                                          Proceed to Checkout
                                        </button>
                                      )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Display Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div
                                className={`space-y-2 ${msg.content ? "mt-2" : ""}`}
                              >
                                {msg.attachments.map((att) => {
                                  const fullUrl = `${API_BASE_URL}${att.url}`;

                                  return (
                                    <div key={att.id}>
                                      {att.mime.startsWith("image/") ? (
                                        <div
                                          onClick={() =>
                                            setImageModal({
                                              url: fullUrl,
                                              name: att.name,
                                            })
                                          }
                                          className="cursor-pointer group relative"
                                        >
                                          <img
                                            src={fullUrl}
                                            alt={att.name}
                                            className="rounded-xl max-w-full h-auto shadow-md"
                                            style={{
                                              maxHeight: "250px",
                                              maxWidth: "250px",
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all" />
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            setPdfModal({
                                              url: fullUrl,
                                              name: att.name,
                                            })
                                          }
                                          className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all shadow-sm w-full text-left ${
                                            isMine
                                              ? "bg-white/20 hover:bg-white/30"
                                              : "bg-white hover:bg-[#f9f8f7]"
                                          }`}
                                        >
                                          <div
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                              isMine
                                                ? "bg-white/30"
                                                : "bg-[#f0ede8]"
                                            }`}
                                          >
                                            <span className="text-xl">📄</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p
                                              className={`text-xs font-semibold truncate ${
                                                isMine
                                                  ? "text-white"
                                                  : "text-[#1a1a1a]"
                                              }`}
                                            >
                                              {att.name}
                                            </p>
                                            <p
                                              className={`text-xs ${
                                                isMine
                                                  ? "text-white/70"
                                                  : "text-[#888]"
                                              }`}
                                            >
                                              {(att.size / 1024).toFixed(1)} KB
                                            </p>
                                          </div>
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-xs mt-1 ${isMine ? "text-right" : "text-left"} text-[#aaa]`}
                          >
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
              {/* Block banner — place just above the input area */}
              {blockStatus.theyBlockedMe && (
                <div className="px-6 py-3 bg-red-50 border-t border-red-200 text-center">
                  <p className="text-sm text-red-600 font-medium">
                    You cannot send messages to this user.
                  </p>
                </div>
              )}
              {blockStatus.iBlockedThem && (
                <div className="px-6 py-3 bg-amber-50 border-t border-amber-200 text-center">
                  <p className="text-sm text-amber-700 font-medium">
                    You have blocked this user. Unblock to send messages.
                  </p>
                </div>
              )}
              <div
                className={`border-t border-[#f0ede8] px-6 py-4 bg-white shrink-0 ${
                  isAndroid ? "android-message-composer" : ""
                }`}
              >
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-[#f0ede8] rounded-lg px-3 py-2 border border-[#e0ddd8]"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <span className="text-2xl">
                            {file.type === "application/pdf" ? "📄" : "📎"}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1a1a1a] truncate max-w-[150px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[#888]">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="w-6 h-6 rounded-full hover:bg-[#e0ddd8] flex items-center justify-center transition-colors"
                        >
                          <X size={14} className="text-[#888]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!isBlocked && (
                  <div className="flex items-center gap-3">
                    {/* Plus Icon with Dropdown */}
                    <div ref={plusMenuRef} className="relative">
                      <button
                        onClick={() => setShowPlusMenu(!showPlusMenu)}
                        className="w-10 h-10 rounded-full border border-[#e0ddd8] text-[#888] flex items-center justify-center hover:bg-[#f0ede8] hover:border-[#cb6f4d] hover:text-[#cb6f4d] transition-all"
                        title="More options"
                      >
                        <Plus size={20} />
                      </button>

                      {/* Dropdown Menu */}
                      {showPlusMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-[#e0ddd8] rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                          {/* Attach File Option */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#faf9f7] transition-colors text-left group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#f0ede8] flex items-center justify-center group-hover:bg-[#cb6f4d] transition-colors">
                              <Paperclip
                                size={18}
                                className="text-[#888] group-hover:text-white"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#1a1a1a]">
                                Attach File
                              </p>
                              <p className="text-xs text-[#888]">
                                Send images or PDFs
                              </p>
                            </div>
                          </button>

                          {/* Make an Offer Option */}
                          <button
                            onClick={handleMakeOffer}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#faf9f7] transition-colors text-left border-t border-[#f0ede8] group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#f0ede8] flex items-center justify-center group-hover:bg-[#cb6f4d] transition-colors">
                              <Tag
                                size={18}
                                className="text-[#888] group-hover:text-white"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#1a1a1a]">
                                Make an Offer
                              </p>
                              <p className="text-xs text-[#888]">
                                Propose your price
                              </p>
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>

                    {/* Message Input */}
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

                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={
                        (!inputValue.trim() && selectedFiles.length === 0) ||
                        isUploading ||
                        isBlocked
                      }
                      className="w-11 h-11 rounded-full bg-[#cb6f4d] text-white flex items-center justify-center hover:bg-[#b85f3d] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                )}
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

      {/* Image Lightbox Modal */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModal(null)}
        >
          <button
            onClick={() => setImageModal(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center gap-4">
            <img
              src={imageModal.url}
              alt={imageModal.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-3">
              <a
                href={imageModal.url}
                download={imageModal.name}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {pdfModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#e0ddd8]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                    {pdfModal.name}
                  </p>
                  <p className="text-xs text-[#888]">PDF Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfModal.url}
                  download={pdfModal.name}
                  className="px-4 py-2 bg-[#cb6f4d] hover:bg-[#b85f3d] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                  </svg>
                  Download
                </a>
                <button
                  onClick={() => setPdfModal(null)}
                  className="w-10 h-10 rounded-lg hover:bg-[#f0ede8] flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-[#888]" />
                </button>
              </div>
            </div>
            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={pdfModal.url}
                className="w-full h-full border-0"
                title={pdfModal.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* Make an Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#cb6f4d]/10 flex items-center justify-center">
                  <Tag size={24} className="text-[#cb6f4d]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a1a]">
                    Make an Offer
                  </h3>
                  <p className="text-xs text-[#888]">Propose your price</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setOfferAmount("");
                  setError(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-[#f0ede8] flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-[#888]" />
              </button>
            </div>

            {/* Product Info */}
            {activeConversation?.product && (
              <div className="mb-6 p-4 bg-[#faf9f7] rounded-xl border border-[#e0ddd8]">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-[#e0ddd8]">
                    {activeConversation.product.images &&
                    getFirstImageUrl(activeConversation.product.images) ? (
                      <img
                        src={
                          getFirstImageUrl(activeConversation.product.images) ||
                          ""
                        }
                        alt={activeConversation.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-[#ccc]" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                      {activeConversation.product.title}
                    </p>
                    {activeConversation.product.price && (
                      <p className="text-xs text-[#888] mt-1">
                        Listed price:{" "}
                        <span className="font-semibold text-[#cb6f4d]">
                          {activeConversation.product.price}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Offer Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                Your Offer Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888] font-semibold">
                  TBH
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-[#e0ddd8] rounded-xl pl-8 pr-4 py-3 text-lg font-semibold text-[#1a1a1a] focus:outline-none focus:border-[#cb6f4d] focus:ring-2 focus:ring-[#cb6f4d]/20 transition-all"
                  autoFocus
                />
              </div>
              {offerError && (
                <p className="text-xs text-red-500 mt-2 font-medium">
                  {offerError}
                </p>
              )}
              {activeConversation?.product?.price && (
                <p className="text-xs text-[#888] mt-2">
                  💡 Tip: Listed price is TBH{activeConversation.product.price}.
                  Range: TBH{minOffer.toFixed(2)} - TBH{maxOffer.toFixed(2)}.
                </p>
              )}
            </div>

            {/* Optional Message */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                Message (Optional)
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Add a note to your offer..."
                rows={3}
                className="w-full border border-[#e0ddd8] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#cb6f4d] focus:ring-2 focus:ring-[#cb6f4d]/20 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setOfferAmount("");
                  setError(null);
                }}
                className="flex-1 px-4 py-3 border border-[#e0ddd8] text-[#888] rounded-xl font-semibold hover:bg-[#f0ede8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOffer}
                disabled={!offerAmount || parseFloat(offerAmount) <= 0 || isSendingOffer}
                className="flex-1 px-4 py-3 bg-[#cb6f4d] text-white rounded-xl font-semibold hover:bg-[#b85f3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isSendingOffer && <Loader2 size={18} className="animate-spin" />}
                {isSendingOffer ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
