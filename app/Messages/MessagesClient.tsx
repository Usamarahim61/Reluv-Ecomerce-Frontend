import EditOfferModal from "@/app/components/EditOfferModal";
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
  MessageAttachment,
  MessageItem,
  blockUser,
  createOfferViaSocket,
  markOfferSeenViaSocket,
  deleteConversation,
  fetchBlockStatus,
  respondToOfferViaSocket,
  unblockUser,
  uploadFiles,
} from "@/services/messages-service";
import { getChatSocket, disconnectChatSocket } from "@/lib/chat-socket";
import { getChatContentRejection } from "@/lib/chat-content-validation";
import { getFirstImageUrl } from "@/services/products-service";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAndroidNative } from "@/app/components/useAndroidNative";
import { API_BASE_URL } from "@/app/constants/api";
import {
  addOptimisticMessage,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  removeConversation,
  removeMessage,
  setSelectedConversationId,
  updateConversationPreview,
  updateOfferStatus,
  updateOfferPrice,
  updateOfferSeen,
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

type ProductRef = {
  id: number;
  documentId?: string | null;
  title?: string | null;
  price?: number | string | null;
  image?: string | null;
  productStatus?: string | null;
};

const getProductRefFromMessage = (msg: MessageItem): ProductRef | null => {
  const ref = (msg.metadata as any)?.productRef;
  return ref && Number.isInteger(Number(ref.id))
    ? {
        id: Number(ref.id),
        documentId: ref.documentId ?? null,
        title: ref.title ?? null,
        price: ref.price ?? null,
        image: ref.image ?? null,
        productStatus: ref.productStatus ?? null,
      }
    : null;
};

/** All products referenced in a conversation's messages (primary product first). */
const collectConversationProducts = (
  conversation: ConversationItem | null,
  messages: MessageItem[],
): ProductRef[] => {
  const products: ProductRef[] = [];
  const seen = new Set<number>();
  const push = (p: ProductRef | null) => {
    if (!p || seen.has(p.id)) return;
    seen.add(p.id);
    products.push(p);
  };
  if (conversation?.product?.id) {
    push({
      id: Number(conversation.product.id),
      documentId: (conversation.product as any).documentId ?? null,
      title: conversation.product.title ?? null,
      price: conversation.product.price ?? null,
      image: getFirstImageUrl(conversation.product.images),
      productStatus: (conversation.product as any).productStatus ?? null,
    });
  }
  for (const msg of messages) {
    push(getProductRefFromMessage(msg));
  }
  return products;
};

/** Inline product reference card shown for product_ref messages. */
function ProductRefCard({ ref_ }: { ref_: ProductRef }) {
  return (
    <div className="flex flex-col max-w-xs">
      <Link
        href={`/products/${ref_.id}`}
        className="flex gap-3 p-3 rounded-2xl bg-white border border-[#e0ddd8] shadow-sm hover:border-[#cb6f4d] transition-all"
      >
        <div className="w-14 h-14 rounded-xl bg-[#f0ede8] overflow-hidden flex items-center justify-center shrink-0">
          {ref_.image ? (
            <img
              src={ref_.image.startsWith("http") ? ref_.image : `${API_BASE_URL}${ref_.image}`}
              alt={ref_.title || "Product"}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="text-[#ccc]" size={20} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-[#cb6f4d] font-semibold">
            Interested in
          </p>
          <p className="text-sm font-semibold text-[#1a1a1a] truncate">
            {ref_.title || "Product"}
          </p>
          {ref_.price != null && (
            <p className="text-xs text-[#888]">
              TBH{ref_.price}
              {ref_.productStatus && ref_.productStatus !== "active" && (
                <span className="ml-2 text-[#b45309] capitalize">
                  {ref_.productStatus}
                </span>
              )}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}


function OfferVisibilityTracker({
  offerId,
  conversationId,
  isRecipient,
  isPending,
  isSeen,
}: {
  offerId: number;
  conversationId: number;
  isRecipient: boolean;
  isPending: boolean;
  isSeen: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isRecipient || !isPending || isSeen || !offerId || !conversationId) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      markOfferSeenViaSocket({ offerId, conversationId });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            markOfferSeenViaSocket({ offerId, conversationId });
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [offerId, conversationId, isRecipient, isPending, isSeen]);

  return <div ref={ref} className="w-full h-0 pointer-events-none" />;
}

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
  const [editingOffer, setEditingOffer] = useState<any>(null);
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
  // Keep the original browser files until the socket confirms delivery so a
  // failed send can restore the draft just like the mobile client does.
  const pendingSendsRef = useRef<Record<string, { conversationId: number; text: string; files: File[]; objectUrls: string[] }>>({});

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

  // Legacy IDs resolve to a retained canonical conversation. Keep copied and
  // refreshed links on that canonical ID after the initial message fetch.
  useEffect(() => {
    const paramId = Number(searchParams.get("conversationId"));
    if (!selectedId || !paramId || selectedId === paramId || lastParamIdRef.current !== paramId) return;
    lastParamIdRef.current = selectedId;
    router.replace(`/Messages?conversationId=${selectedId}`, { scroll: false });
  }, [router, searchParams, selectedId]);

  useEffect(() => {
    if (!selectedId || !user?.id) return;
    dispatch(markConversationRead(selectedId));
    const peerId = peerUser?.id;
    if (peerId) {
      fetchBlockStatus(peerId)
        .then(setBlockStatus)
        .catch(() => {});
    } else {
      setBlockStatus({ iBlockedThem: false, theyBlockedMe: false });
    }

    dispatch(fetchMessages(selectedId));

    // Re-fetch conversations when messages are loaded to update unread count
    return () => {
      dispatch(fetchConversations());
    };
  }, [dispatch, selectedId, user?.id, peerUser?.id]);

  const isBlocked = blockStatus.iBlockedThem || blockStatus.theyBlockedMe;

  const [isBlocking, setIsBlocking] = useState(false);

  const handleBlockUser = async () => {
    if (!peerUser?.id) return;

    const loadingToastId = toast.loading(`Blocking ${peerUser.username}...`);

    try {
      setIsBlocking(true);
      await blockUser(peerUser.id);

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
      await unblockUser(peerUser.id);

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
    const joinSelectedConversation = () => {
      socket.emit("conversation:join", { conversationId: selectedId });
    };

    // Socket.IO rooms are connection-scoped, so rejoin after reconnecting.
    if (socket.connected) joinSelectedConversation();
    socket.on("connect", joinSelectedConversation);

    const handleNewMessage = (
      message: MessageItem & {
        conversationId?: number;
        clientMessageId?: string;
      },
    ) => {
      const msgConvId = message.conversationId ?? selectedId;
      if (message.clientMessageId) {
        const pending = pendingSendsRef.current[message.clientMessageId];
        if (pending) {
          pending.objectUrls.forEach((url) => URL.revokeObjectURL(url));
          delete pendingSendsRef.current[message.clientMessageId];
        }
      }
      // Always update the conversation preview regardless of which chat is open
      dispatch(
        updateConversationPreview({
          conversationId: msgConvId,
          lastMessagePreview: message.content,
          lastMessageAt: message.createdAt || new Date().toISOString(),
        }),
      );
      // The send echo can arrive after the user switches threads. Reconcile it
      // into its own cache entry so it never remains as an optimistic bubble.
      dispatch(upsertMessage({ conversationId: msgConvId, message }));
      if (msgConvId !== selectedId) {
        dispatch(fetchConversations());
        return;
      }
      if (Number(message.sender?.id) !== Number(user.id)) {
        socket.emit("messages:mark-read", { conversationId: msgConvId });
        dispatch(fetchConversations());
      }
    };

    const handleMessagesRead = () => {
      dispatch(markConversationRead(selectedId));
    };

    const handleBlockChanged = (event: {
      blockerId: number;
      blockedId: number;
      blocked: boolean;
    }) => {
      if (!peerUser?.id || !user?.id) return;

      const affectsActiveChat =
        (event.blockerId === user.id && event.blockedId === peerUser.id) ||
        (event.blockerId === peerUser.id && event.blockedId === user.id);
      if (!affectsActiveChat) return;

      if (event.blockerId === user.id && event.blockedId === peerUser.id) {
        setBlockStatus((prev) => ({
          ...prev,
          iBlockedThem: event.blocked,
        }));
      }

      if (event.blockerId === peerUser.id && event.blockedId === user.id) {
        setBlockStatus((prev) => ({
          ...prev,
          theyBlockedMe: event.blocked,
        }));
      }

      if (event.blocked) {
        setInputValue("");
        setSelectedFiles([]);
        setShowPlusMenu(false);
        setShowOfferModal(false);
        setOfferError(null);
      }
    };

    const handleMessageError = (event: {
      conversationId?: number;
      clientMessageId?: string;
      message?: string;
    }) => {
      const message = event.message || "Failed to send message.";
      toast.error(message);
      const failedConversationId = Number(event.conversationId || selectedId);
      const pending = event.clientMessageId
        ? pendingSendsRef.current[event.clientMessageId]
        : undefined;
      if (pending && event.clientMessageId) {
        pending.objectUrls.forEach((url) => URL.revokeObjectURL(url));
        delete pendingSendsRef.current[event.clientMessageId];
        dispatch(removeMessage({
          conversationId: pending.conversationId,
          messageId: `temp-${event.clientMessageId}`,
        }));
        if (pending.conversationId === selectedId) {
          setError(message);
          setInputValue((current) => current || pending.text);
          setSelectedFiles((current) => current.length ? current : pending.files);
        }
      } else if (failedConversationId === selectedId) {
        setError(message);
      }
      if (failedConversationId > 0) dispatch(fetchMessages(failedConversationId));
      dispatch(fetchConversations());
    };

    const handleOfferChanged = (
      event?: { conversationId?: number; offerId?: number; offer?: { id?: number; status?: string } },
    ) => {
      // Cheap in-place status update when the event carries the new status —
      // avoids the refetch flashing every bubble for a single status change.
      const eventOfferId = Number(event?.offerId ?? event?.offer?.id);
      const eventConversationId = Number(
        event?.conversationId ?? selectedId,
      );
      if (
        event?.offer?.status &&
        eventOfferId > 0 &&
        eventConversationId > 0 &&
        eventConversationId === selectedId
      ) {
        dispatch(
          updateOfferStatus({
            conversationId: eventConversationId,
            offerId: eventOfferId,
            status: event.offer.status as "pending" | "accepted" | "declined" | "expired" | "completed" | "unavailable",
          }),
        );
      }
      if (selectedId) dispatch(fetchMessages(selectedId));
      dispatch(fetchConversations());
    };

    // Product sold elsewhere: mark this offer unavailable without a refetch.
    const handleOfferInvalidated = (
      event: { conversationId?: number; offerId?: number },
    ) => {
      const conversationId = Number(event.conversationId ?? selectedId);
      const offerId = Number(event.offerId);
      if (conversationId > 0 && offerId > 0) {
        dispatch(
          updateOfferStatus({
            conversationId,
            offerId,
            status: "unavailable",
          }),
        );
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("messages:read", handleMessagesRead);
    socket.on("block:changed", handleBlockChanged);
    socket.on("message:error", handleMessageError);
    socket.on("offer:created", handleOfferChanged);
    socket.on("offer:responded", handleOfferChanged);
    const handleOfferUpdated = (event?: {
      conversationId?: number;
      offerId?: number;
      price?: number;
      offerPrice?: number;
      editedAt?: string | null;
      editCount?: number;
      offer?: any;
    }) => {
      const eventOfferId = Number(event?.offerId ?? event?.offer?.id);
      const eventConversationId = Number(event?.conversationId ?? selectedId);
      const newPrice = Number(event?.offerPrice ?? event?.price ?? event?.offer?.offerPrice);

      if (eventOfferId > 0 && eventConversationId > 0 && Number.isFinite(newPrice)) {
        dispatch(
          updateOfferPrice({
            conversationId: eventConversationId,
            offerId: eventOfferId,
            offerPrice: newPrice,
            editedAt: event?.editedAt ?? event?.offer?.editedAt ?? new Date().toISOString(),
            editCount: event?.editCount ?? event?.offer?.editCount,
          }),
        );
      }
      if (selectedId) dispatch(fetchMessages(selectedId));
      dispatch(fetchConversations());
    };

    const handleOfferSeen = (event?: {
      conversationId?: number;
      offerId?: number;
      seenAt?: string;
    }) => {
      const eventOfferId = Number(event?.offerId);
      const eventConversationId = Number(event?.conversationId ?? selectedId);
      if (eventOfferId > 0 && eventConversationId > 0) {
        dispatch(
          updateOfferSeen({
            conversationId: eventConversationId,
            offerId: eventOfferId,
            seenAt: event?.seenAt || new Date().toISOString(),
          }),
        );
      }
    };

    socket.on("offer:updated", handleOfferUpdated);
    socket.on("offer:seen", handleOfferSeen);
    socket.on("offer:invalidated", handleOfferInvalidated);
    return () => {
      socket.off("connect", joinSelectedConversation);
      socket.off("message:new", handleNewMessage);
      socket.off("messages:read", handleMessagesRead);
      socket.off("block:changed", handleBlockChanged);
      socket.off("message:error", handleMessageError);
      socket.off("offer:created", handleOfferChanged);
      socket.off("offer:responded", handleOfferChanged);
      socket.off("offer:invalidated", handleOfferInvalidated);
      socket.off("offer:updated", handleOfferUpdated);
      socket.off("offer:seen", handleOfferSeen);
    };
  }, [selectedId, user?.id, peerUser?.id, dispatch]);

  useEffect(() => {
    if (!user?.id) return;
    const socket = getChatSocket();

    // Rejoin all known conversation rooms after a reconnect so message:new
    // events keep arriving for every thread, not just the selected one.
    const rejoinAll = () => {
      conversations.forEach((c) => {
        if (c.id > 0) socket.emit("conversation:join", { conversationId: c.id });
      });
    };
    if (socket.connected) rejoinAll();
    socket.on("connect", rejoinAll);

    const handleConversationUpsert = (event: {
      conversation?: ConversationItem;
    }) => {
      if (!event.conversation?.id) return;
      // Join the room so message:new events are received for this conversation
      socket.emit("conversation:join", { conversationId: event.conversation.id });
      dispatch(fetchConversations());
    };

    const handleConversationDeleted = (event: { conversationId?: number }) => {
      const conversationId = Number(event.conversationId);
      if (!Number.isInteger(conversationId) || conversationId <= 0) return;
      dispatch(removeConversation(conversationId));
      if (selectedId === conversationId) {
        dispatch(setSelectedConversationId(null));
        setViewMessage(false);
        router.replace("/Messages", { scroll: false });
      }
    };

    const handleUnreadCountChanged = () => {
      dispatch(fetchConversations());
    };

    socket.on("conversation:upsert", handleConversationUpsert);
    socket.on("conversation:deleted", handleConversationDeleted);
    socket.on("conversations:unread-count", handleUnreadCountChanged);

    return () => {
      socket.off("connect", rejoinAll);
      socket.off("conversation:upsert", handleConversationUpsert);
      socket.off("conversation:deleted", handleConversationDeleted);
      socket.off("conversations:unread-count", handleUnreadCountChanged);
    };
  }, [dispatch, router, selectedId, user?.id, conversations]);

  const activeMessages = selectedId
    ? (messagesByConversation[String(selectedId)] ?? [])
    : [];
  const loadingMessages = selectedId
    ? messagesStatusByConversation[String(selectedId)] === "loading"
    : false;
  const messagesError = selectedId
    ? messagesErrorByConversation[String(selectedId)]
    : null;

  // Unified conversations: all products discussed in this conversation.
  const conversationProducts = useMemo(
    () => collectConversationProducts(activeConversation, activeMessages),
    [activeConversation, activeMessages],
  );
  const hasMultipleProducts = conversationProducts.length > 1;

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

  // Track whether the user is reading near the bottom. Only then do we
  // auto-scroll on new messages — like the mobile app, scrolling up to read
  // history must not get yanked back down (also preserves position when an
  // attachment image loads or an offer-status refetch lands).
  const isNearBottomRef = useRef(true);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedId) return; // Prevent scrolling jump when closing the chat
    if (!isNearBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, selectedId]);

  useEffect(() => {
    return () => {
      Object.values(pendingSendsRef.current).forEach((pending) => {
        pending.objectUrls.forEach((url) => URL.revokeObjectURL(url));
      });
      pendingSendsRef.current = {};
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

    // Security: prevent sharing direct contact details in chat.
    const contentRejection = text ? getChatContentRejection(text) : null;
    if (contentRejection) {
      setError(contentRejection);
      toast.error(contentRejection);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      let attachmentIds: number[] = [];


      if (selectedFiles.length > 0) {
        attachmentIds = await uploadFiles(selectedFiles);
      }

      const socket = getChatSocket();
      const clientMessageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      // Local object URLs so the optimistic bubble shows the actual image
      // instantly, instead of a "📎 Sending file..." placeholder that later
      // pops into an image.
      const localAttachments: MessageAttachment[] = selectedFiles.map((file, index) => ({
        id: `temp-${clientMessageId}-${index}`,
        url: `local:${file.name}`,
        localUrl: URL.createObjectURL(file),
        name: file.name,
        ext: `.${file.name.split(".").pop() || ""}`,
        mime: file.type || "application/octet-stream",
        size: file.size,
      }));
      pendingSendsRef.current[clientMessageId] = {
        conversationId: selectedId,
        text,
        files: [...selectedFiles],
        objectUrls: localAttachments.map((attachment) => attachment.localUrl!).filter(Boolean),
      };
      const optimisticMessage: MessageItem = {
        id: `temp-${clientMessageId}`,
        content: text || "",
        createdAt: new Date().toISOString(),
        sender: user ? { id: user.id, username: user.username } : null,
        attachments: selectedFiles.length > 0 ? localAttachments : undefined,
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
    offer?: any,
  ) => {
    if (!user?.id || !selectedId) return;

    try {
      setRespondingToOfferId(offerId);
      // Use the offer's actual seller id, not the current user: on counter-offer
      // threads the responding party can be the buyer of the original offer.
      const offerSellerId =
        typeof offer?.seller === "number"
          ? offer.seller
          : Number(offer?.seller?.id) || user.id;
      await respondToOfferViaSocket({
        offerId,
        action,
        sellerId: offerSellerId,
        conversationId: selectedId,
      });

      // Refresh messages to show the response message created by backend
      dispatch(fetchMessages(selectedId));
      toast.success(`Offer ${action}!`);
    } catch (err: any) {
      console.error("Failed to respond to offer:", err);
      const rawMessage = err.message || "Failed to respond to offer";
      // Match the mobile app: surface a sold-out conflict as the card's
      // "unavailable" state plus a friendly banner instead of a raw error.
      if (
        rawMessage.toLowerCase().includes("no longer available") ||
        rawMessage.toLowerCase().includes("already been purchased")
      ) {
        dispatch(
          updateOfferStatus({
            conversationId: selectedId,
            offerId,
            status: "unavailable",
          }),
        );
        toast.info("This product has already been purchased and is no longer available.");
      } else {
        setError(rawMessage);
        toast.error(rawMessage);
      }
    } finally {
      setRespondingToOfferId(null);
    }
  };

  const handleBuyWithOffer = (offer: any) => {
    if (!offer || !activeConversation) return;

    // Offers carry their own product — with unified conversations the offer's
    // product is authoritative, never conversation.product.
    const offerProductId = offer.product?.id
      ? Number(offer.product.id)
      : Number(offer.productId ?? 0);
    const referenced = conversationProducts.find(
      (p) => Number(p.id) === offerProductId,
    );
    const product = referenced
      ? {
          id: referenced.id,
          documentId: referenced.documentId,
          title: referenced.title,
          images: referenced.image ? [{ url: referenced.image }] : [],
        }
      : activeConversation.product;
    const seller = activeConversation.seller;
    const imageUrl =
      offer.productImage ||
      (referenced?.image ? referenced.image : "") ||
      (product?.images ? getFirstImageUrl(product.images) || "" : "");

    router.push(
      `/CheckOut?${new URLSearchParams({
        productId: String(offerProductId || product?.id || ""),
        documentId: String((offer.product as any)?.documentId || (product as any)?.documentId || ""),
        title: offer.productTitle || offer.product?.title || product?.title || "Product",
        brand: (offer.product as any)?.brand || "Reluv",
        size: (offer.product as any)?.size || "One Size",
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

  // Unified conversations: pick which product the offer applies to when the
  // conversation references several products.
  const [offerProductId, setOfferProductId] = useState<number | null>(null);
  // Counter-offer context: the parent offer being countered, plus its seller id
  // (roles reverse — the counterer becomes the "buyer" of the new offer).
  const [counterOfferParentId, setCounterOfferParentId] = useState<number | null>(null);
  const [counterOfferSellerId, setCounterOfferSellerId] = useState<number | null>(null);
  const [counterOfferParentSellerId, setCounterOfferParentSellerId] = useState<number | null>(null);
  const offeredProduct =
    conversationProducts.find((p) => p.id === offerProductId) ??
    conversationProducts[0] ??
    null;
  const productPrice = offeredProduct?.price
    ? parseFloat(String(offeredProduct.price))
    : 0;
  const minOffer = productPrice * 0.5;
  const maxOffer = productPrice * 1.5;

  const handleMakeOffer = () => {
    if (!activeConversation) return;
    setShowPlusMenu(false);
    setCounterOfferParentId(null);
    setCounterOfferSellerId(null);
    setCounterOfferParentSellerId(null);
    setOfferProductId(conversationProducts[0]?.id ?? null);
    setShowOfferModal(true);
    setOfferAmount("");
    setOfferMessage("");
    setOfferError(null);
  };

  // Opened from the "Counter Offer" button on a pending offer card: prefill
  // the amount with the original offer and mark it as a counter.
  // Warn the user that the previous pending offer will be declined (matches mobile).
  const [showCounterOfferConfirm, setShowCounterOfferConfirm] = useState(false);
  const [pendingCounterOffer, setPendingCounterOffer] = useState<any>(null);

  const handleCounterOffer = (offer: any) => {
    setPendingCounterOffer(offer);
    setShowCounterOfferConfirm(true);
  };

  const confirmCounterOffer = () => {
    const offer = pendingCounterOffer;
    if (!offer) {
      setShowCounterOfferConfirm(false);
      return;
    }
    setShowCounterOfferConfirm(false);
    setShowPlusMenu(false);
    setCounterOfferParentId(Number(offer?.id) || null);
    // Determine the other participant (counter offer goes to the other party)
    const currentUserId = Number(user?.id);
    const offerBuyerId =
      typeof offer?.buyer === "number"
        ? offer.buyer
        : Number(offer?.buyer?.id);
    const offerSellerId =
      typeof offer?.seller === "number"
        ? offer.seller
        : Number(offer?.seller?.id);
    setCounterOfferParentSellerId(offerSellerId || null);
    // Counter offer: counterer becomes the buyer of the new offer
    // Seller of counter offer is the other party (original offer's buyer if counterer was seller, or original offer's seller if counterer was buyer)
    const counterOfferTargetSellerId =
      offerBuyerId === currentUserId ? offerSellerId : offerBuyerId;
    setCounterOfferSellerId(counterOfferTargetSellerId || null);
    const counterProductId = offer?.product?.id
      ? Number(offer.product.id)
      : Number(offer?.productId ?? 0) || null;
    if (counterProductId) setOfferProductId(counterProductId);
    setOfferAmount(String(offer?.offerPrice ?? ""));
    setShowOfferModal(true);
    setOfferMessage("");
    setOfferError(null);
    setPendingCounterOffer(null);
  };

  const cancelCounterOffer = () => {
    setShowCounterOfferConfirm(false);
    setPendingCounterOffer(null);
  };

  const handleQuickOffer = (percentage: number) => {
    const amount = (productPrice * percentage).toFixed(2);
    setOfferAmount(amount);
  };

  const handleSendOffer = async () => {
    const amount = parseFloat(offerAmount);
    setOfferError(null);

    // Security: apply the same contact-detail rules to offer notes.
    const rejection = offerMessage
      ? getChatContentRejection(offerMessage.trim())
      : null;
    if (rejection) {
      setOfferError(rejection);
      toast.error(rejection);
      return;
    }

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
    let counterOfferCreated = false;
    try {
      if (!offeredProduct) {
        setOfferError("Product not found");
        return;
      }

      // Resolve the product's actual seller from the backend so the offer
      // matches the product owner (important for unified conversations).
      let resolvedSellerId = counterOfferSellerId || Number(activeConversation?.seller?.id ?? peerUser?.id);
      if (!counterOfferSellerId) {
        try {
          const productPayload: any = await (await fetch(
            `${API_BASE_URL}/api/products/getProductById/${encodeURIComponent(String(offeredProduct.id))}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } },
          )).json();
          const rawProduct = productPayload?.product ?? productPayload;
          const owner =
            rawProduct?.users_permissions_user?.id ??
            rawProduct?.users_permissions_user ??
            rawProduct?.userId?.id ??
            rawProduct?.owner?.id;
          if (owner) resolvedSellerId = Number(owner);
        } catch {
          // Fall back to conversation seller
        }
      }

      if (counterOfferParentId && !counterOfferParentSellerId) {
        throw new Error("Could not identify the seller of the offer being countered.");
      }

      await createOfferViaSocket({
        productId: offeredProduct.id,
        buyerId: counterOfferParentId
          ? Number(user?.id)
          : Number(activeConversation.buyer?.id),
        sellerId: counterOfferParentId
          ? (counterOfferSellerId || Number(peerUser?.id) || resolvedSellerId)
          : Number(activeConversation.seller?.id ?? resolvedSellerId),
        initiatorId: Number(user?.id),
        offerPrice: amount,
        message: offerMessage || undefined,
        conversationId: selectedId,
        parentOfferId: counterOfferParentId || undefined,
      });
      counterOfferCreated = true;

      // Keep the existing pending offer if the new counter fails validation or
      // cannot be persisted. Only close it after the counter is confirmed.
      if (counterOfferParentId) {
        await respondToOfferViaSocket({
          offerId: counterOfferParentId,
          action: "declined",
          sellerId: counterOfferParentSellerId!,
          conversationId: selectedId!,
        });
      }

      // Refresh messages to show the offer message created by backend
      dispatch(fetchMessages(selectedId));

      setShowOfferModal(false);
      setOfferAmount("");
      setOfferMessage("");
      setOfferError(null);
      setError(null);
      setCounterOfferParentId(null);
      setCounterOfferSellerId(null);
      setCounterOfferParentSellerId(null);
      toast.success("Offer sent successfully!");
    } catch (err: any) {
      console.error("Failed to make offer:", err);
      const msg = err.message || "Failed to send offer";
      if (counterOfferCreated) {
        toast.warning("Counter offer sent, but the previous offer could not be closed. Refresh the conversation to check its status.");
        dispatch(fetchMessages(selectedId));
        dispatch(fetchConversations());
        setShowOfferModal(false);
        setOfferAmount("");
        setOfferMessage("");
        setCounterOfferParentId(null);
        setCounterOfferSellerId(null);
        setCounterOfferParentSellerId(null);
        return;
      }
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
      await deleteConversation(selectedId);

      const deletedConversationId = selectedId;
      setDeleteConfirmPending(false);
      setShowDetailsPanel(false);
      dispatch(removeConversation(deletedConversationId));
      setViewMessage(false);
      router.replace("/Messages", { scroll: false });
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
      className={`flex flex-col h-screen md:h-[calc(100vh-130px)] bg-linear-to-br from-[#faf9f7] via-white to-[#f0ede8] ${
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
                const isUnread = Boolean(c.hasUnread);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      dispatch(markConversationRead(c.id));
                      dispatch(setSelectedConversationId(c.id));
                      setViewMessage(true);
                      // Sync URL with the selection to prevent the parameter listener from reverting the change
                      router.replace(`/Messages?conversationId=${c.id}`, { scroll: false });
                    }}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 border-l-4 ${
                      isSelected
                        ? "bg-linear-to-r from-[#faf8f5] to-transparent border-l-[#cb6f4d]"
                        : isUnread
                          ? "bg-[#fff5f0] border-l-[#cb6f4d] hover:bg-[#ffede5]"
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
                            className={`text-sm truncate ${
                              isUnread
                                ? "font-bold text-[#1a1a1a]"
                                : "font-semibold text-[#333]"
                            }`}
                          >
                            {otherUser?.username || "User"}
                          </span>
                          <div className="flex items-center gap-2 ml-2 shrink-0">
                            <span
                              className={`text-xs whitespace-nowrap ${
                                isSelected || isUnread
                                  ? "text-[#cb6f4d] font-semibold"
                                  : "text-[#aaa]"
                              }`}
                            >
                              {formatTime(lastTime)}
                            </span>
                            {isUnread && (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-[#cb6f4d] shadow-sm"
                                aria-label="Unread conversation"
                              />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-[#888] truncate mb-1">
                          {productTitle}
                        </p>
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? "text-[#333] font-semibold"
                              : isSelected
                                ? "text-[#555] font-medium"
                                : "text-[#999]"
                          }`}
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

                    {/* Peer avatar - Clickable */}
                    <Link
                      href={`/member/${peerUser?.id}`}
                      className="w-14 h-14 bg-[#f0ede8] rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[#e0ddd8] hover:border-[#cb6f4d] transition-all cursor-pointer group"
                    >
                      <span className="font-bold text-white text-lg bg-linear-to-br from-[#cb6f4d] to-[#a55840] w-full h-full flex items-center justify-center">
                        {peerUser?.username?.[0]?.toUpperCase() || "U"}
                      </span>
                    </Link>

                    {/* Header Info */}
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
                      <span className="text-xs text-[#888] truncate block">
                        Buyer–seller conversation
                      </span>
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
                            This chat will be deleted only from your account.
                            It is permanently removed after the other person
                            deletes it too.
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
              <div
                className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#fafaf8]"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  isNearBottomRef.current =
                    el.scrollHeight - (el.scrollTop + el.clientHeight) < 200;
                }}
              >
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
                      (msg.offer?.product?.price
                        ? parseFloat(String(msg.offer.product.price))
                        : 0) ||
                      (activeConversation?.product?.price
                        ? parseFloat(String(activeConversation.product.price))
                        : 0);

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        {/* Offer response bubble — matches mobile's compact
                            accepted/declined card instead of a chat bubble. */}
                        {msg.metadata?.type === "offer_response" && offerId ? (
                          <div className="flex flex-col max-w-xs">
                            <div
                              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border ${
                                ((msg.metadata as any)?.action || msg.metadata?.status) === "accepted"
                                  ? "bg-green-50 border-green-200"
                                  : "bg-red-50 border-red-200"
                              }`}
                            >
                              {((msg.metadata as any)?.action || msg.metadata?.status) === "accepted" ? (
                                <CheckCircle size={18} className="text-green-600 shrink-0" />
                              ) : (
                                <XCircle size={18} className="text-red-600 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-bold ${
                                    ((msg.metadata as any)?.action || msg.metadata?.status) === "accepted"
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {((msg.metadata as any)?.action || msg.metadata?.status) === "accepted"
                                    ? "Offer accepted"
                                    : "Offer declined"}
                                </p>
                                <p className="text-[11px] text-[#888] truncate">
                                  {offerAmount != null && `TBH${offerAmount}`}
                                  {msg.offer?.productTitle && ` for ${msg.offer.productTitle}`}
                                  {((msg.metadata as any)?.action || msg.metadata?.status) === "accepted"
                                    ? ". Buyer can continue to checkout."
                                    : ". This offer is no longer active."}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs mt-1 ${isMine ? "text-right" : "text-left"} text-[#aaa]`}>
                              {formatFullDateTime(msg.createdAt)}
                            </span>
                          </div>
                        ) : getProductRefFromMessage(msg) ? (
                          <ProductRefCard ref_={getProductRefFromMessage(msg)!} />
                        ) : (
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
                                      {/* Identify the product this offer applies to */}
                                      {(msg.offer?.product?.title ||
                                        msg.offer?.productTitle) && (
                                        <span
                                          className={`text-xs truncate max-w-[120px] ${
                                            isMine
                                              ? "text-white/80"
                                              : "text-[#888]"
                                          }`}
                                        >
                                          for{" "}
                                          {msg.offer?.product?.title ||
                                            msg.offer?.productTitle}
                                        </span>
                                      )}
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
                                      {(offerStatus === "expired" ||
                                        offerStatus === "completed" ||
                                        offerStatus === "unavailable") && (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                            offerStatus === "completed"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-200 text-gray-700"
                                          }`}
                                        >
                                          {offerStatus}
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
                                        // Fallback: receiver of the message should respond
                                        return !isMine;
                                      })() && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                          <button
                                            onClick={() =>
                                              handleOfferResponse(
                                                Number(offerId),
                                                "accepted",
                                                msg.offer,
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
                                                msg.offer,
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
                                            onClick={() =>
                                              handleCounterOffer(msg.offer)
                                            }
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
                                  // Optimistic bubbles carry a browser object URL
                                  // (localUrl); server messages carry a real path.
                                  const displayUrl = att.localUrl || `${API_BASE_URL}${att.url}`;
                                  const fullUrl = att.localUrl
                                    ? displayUrl
                                    : `${API_BASE_URL}${att.url}`;

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
                                            src={displayUrl}
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
                        )}
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
      {editingOffer && (
        <EditOfferModal
          isOpen={!!editingOffer}
          onClose={() => setEditingOffer(null)}
          offerId={editingOffer.offerId}
          currentOfferPrice={editingOffer.currentOfferPrice}
          originalPrice={editingOffer.originalPrice}
          currency={editingOffer.currency}
          productTitle={editingOffer.productTitle}
          conversationId={editingOffer.conversationId}
          onSuccess={() => {
            if (selectedId) dispatch(fetchMessages(selectedId));
            dispatch(fetchConversations());
          }}
        />
      )}

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

            {/* Product Selector — unified conversations can hold many products */}
            {hasMultipleProducts ? (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                  Product
                </label>
                <select
                  value={offeredProduct?.id ?? ""}
                  onChange={(e) => setOfferProductId(Number(e.target.value))}
                  className="w-full border border-[#e0ddd8] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] bg-white focus:outline-none focus:border-[#cb6f4d]"
                >
                  {conversationProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title || `Product #${p.id}`}
                      {p.price != null ? ` — TBH${p.price}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : offeredProduct ? (
            <div className="mb-6 p-4 bg-[#faf9f7] rounded-xl border border-[#e0ddd8]">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-[#e0ddd8]">
                  {offeredProduct.image ? (
                    <img
                      src={
                        offeredProduct.image.startsWith("http")
                          ? offeredProduct.image
                          : `${API_BASE_URL}${offeredProduct.image}`
                      }
                      alt={offeredProduct.title || "Product"}
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
                    {offeredProduct.title || "Product"}
                  </p>
                  {offeredProduct.price != null && (
                    <p className="text-xs text-[#888] mt-1">
                      Listed price:{" "}
                      <span className="font-semibold text-[#cb6f4d]">
                        TBH{offeredProduct.price}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            ) : null}

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
                  className="w-full border border-[#e0ddd8] rounded-xl pl-15 pr-4 py-3 text-lg font-semibold text-[#1a1a1a] focus:outline-none focus:border-[#cb6f4d] focus:ring-2 focus:ring-[#cb6f4d]/20 transition-all"
                  autoFocus
                />
              </div>
              {offerError && (
                <p className="text-xs text-red-500 mt-2 font-medium">
                  {offerError}
                </p>
              )}
              {offeredProduct?.price != null && (
                <p className="text-xs text-[#888] mt-2">
                  💡 Tip: Listed price is TBH{offeredProduct.price}.
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
      {/* Counter Offer Confirmation Dialog */}
      {showCounterOfferConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={cancelCounterOffer}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5">
              <h3 className="text-lg font-serif font-bold text-[#1a1a1a] mb-2">
                Send a counter offer?
              </h3>
              <p className="text-sm text-[#666] leading-relaxed">
                The current offer will be declined after your counter offer is
                successfully sent. Continue?
              </p>
            </div>
            <div className="flex border-t border-[#ede8e3]">
              <button
                onClick={cancelCounterOffer}
                className="flex-1 px-4 py-3 text-sm font-semibold text-[#666] hover:bg-[#f7f4f0] transition-colors"
              >
                Cancel
              </button>
              <div className="w-px bg-[#ede8e3]" />
              <button
                onClick={confirmCounterOffer}
                className="flex-1 px-4 py-3 text-sm font-semibold text-[#cb6f4d] hover:bg-[#fdf5f0] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
