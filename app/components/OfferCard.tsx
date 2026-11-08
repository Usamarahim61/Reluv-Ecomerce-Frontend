"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Tag,
  Check,
  X,
  ArrowRight,
  Pencil,
  ShoppingBag,
  MessageSquare,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import { getChatSocket } from "@/lib/chat-socket";
import {
  respondToOfferViaSocket,
  markOfferSeenViaSocket,
} from "@/services/messages-service";

export interface OfferCardProps {
  offer: any;
  isRecipient: boolean;
  isOfferSender: boolean;
  conversationId: number;
  currency?: string;
  onOfferUpdate?: (updatedOffer: any) => void;
  onOfferResponded?: (action: "accepted" | "declined") => void;
  onCounterOffer?: (offer: any) => void;
  canCheckout?: boolean;
  onCheckout?: (offer: any) => void;
  onEditOffer?: (offer: any) => void;
  readAt?: string | null;
}

export default function OfferCard({
  offer,
  isRecipient,
  isOfferSender,
  conversationId,
  currency = "THB",
  onOfferUpdate,
  onOfferResponded,
  onCounterOffer,
  canCheckout = false,
  onCheckout,
  onEditOffer,
  readAt,
}: OfferCardProps) {
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [localStatus, setLocalStatus] = useState<string>(
    offer.status || "pending",
  );
  const [localOfferPrice, setLocalOfferPrice] = useState<number>(
    Number(offer.offerPrice ?? offer.amount ?? 0),
  );
  const [localSeenAt, setLocalSeenAt] = useState<string | undefined>(
    offer.seenAt,
  );
  const [localEditedAt, setLocalEditedAt] = useState<string | undefined>(
    offer.editedAt,
  );

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Synchronize local state with offer prop changes
  useEffect(() => {
    setLocalStatus(offer.status || "pending");
    setLocalOfferPrice(Number(offer.offerPrice ?? offer.amount ?? 0));
    setLocalSeenAt(offer.seenAt);
    setLocalEditedAt(offer.editedAt);
  }, [
    offer.status,
    offer.offerPrice,
    offer.amount,
    offer.seenAt,
    offer.editedAt,
  ]);

  // Real-time socket event listeners for this specific offer
  useEffect(() => {
    const socket = getChatSocket();

    const handleSeen = (data: { offerId: number; seenAt?: string }) => {
      if (Number(data.offerId) !== Number(offer.id)) return;
      setLocalSeenAt(data.seenAt || new Date().toISOString());
    };

    const handleUpdated = (data: {
      offerId: number;
      price?: number;
      offerPrice?: number;
      editedAt?: string;
    }) => {
      if (Number(data.offerId) !== Number(offer.id)) return;
      const newPrice = Number(data.offerPrice ?? data.price);
      if (Number.isFinite(newPrice)) setLocalOfferPrice(newPrice);
      if (data.editedAt) setLocalEditedAt(data.editedAt);
    };

    const handleResponded = (data: {
      offerId: number;
      offer?: any;
      status?: string;
    }) => {
      if (Number(data.offerId) !== Number(offer.id)) return;
      const nextStatus = data.offer?.status || data.status;
      if (nextStatus) {
        setLocalStatus(nextStatus);
        onOfferUpdate?.({ ...offer, status: nextStatus });
      }
    };

    const handleMessagesRead = (data?: { conversationId?: number }) => {
      if (
        !data?.conversationId ||
        Number(data.conversationId) === Number(conversationId)
      ) {
        setLocalSeenAt((prev) => prev || new Date().toISOString());
      }
    };

    socket.on("offer:seen", handleSeen);
    socket.on("offer:updated", handleUpdated);
    socket.on("offer:responded", handleResponded);
    socket.on("messages:read", handleMessagesRead);

    return () => {
      socket.off("offer:seen", handleSeen);
      socket.off("offer:updated", handleUpdated);
      socket.off("offer:responded", handleResponded);
      socket.off("messages:read", handleMessagesRead);
    };
  }, [conversationId, offer.id, offer, onOfferUpdate]);

  // Listen for real-time offer invalidation
  useEffect(() => {
    const socket = getChatSocket();
    const handleInvalidated = (data: { offerId: number }) => {
      if (Number(data.offerId) !== Number(offer.id)) return;
      setLocalStatus("unavailable");
      onOfferUpdate?.({ ...offer, status: "unavailable" });
    };

    socket.on("offer:invalidated", handleInvalidated);
    return () => {
      socket.off("offer:invalidated", handleInvalidated);
    };
  }, [offer.id, offer, onOfferUpdate]);

  // Visibility tracking: mark offer as seen when recipient views it
  useEffect(() => {
    if (
      !isRecipient ||
      localStatus !== "pending" ||
      localSeenAt ||
      readAt ||
      offer.seenAt ||
      !offer.id ||
      !conversationId
    ) {
      return;
    }

    const el = cardRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      markOfferSeenViaSocket({ offerId: Number(offer.id), conversationId });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            markOfferSeenViaSocket({
              offerId: Number(offer.id),
              conversationId,
            });
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    offer.id,
    conversationId,
    isRecipient,
    localStatus,
    localSeenAt,
    readAt,
    offer.seenAt,
  ]);

  const handleRespond = async (action: "accepted" | "declined") => {
    const sellerId =
      typeof offer.seller === "number"
        ? offer.seller
        : Number(offer.seller?.id);
    const setLoading =
      action === "accepted" ? setAcceptLoading : setDeclineLoading;
    setLoading(true);
    setError(null);

    try {
      await respondToOfferViaSocket({
        offerId: Number(offer.id),
        action,
        sellerId: sellerId || undefined,
        conversationId,
      });
      setLocalStatus(action);
      const updated = { ...offer, status: action };
      onOfferUpdate?.(updated);
      onOfferResponded?.(action);
      toast.success(`Offer ${action}!`);
    } catch (err: any) {
      const message = err?.message || "Failed to respond to offer";
      if (
        message.toLowerCase().includes("no longer available") ||
        message.toLowerCase().includes("already been purchased")
      ) {
        setLocalStatus("unavailable");
        onOfferUpdate?.({ ...offer, status: "unavailable" });
        toast.warning(
          "This product has already been purchased and is no longer available.",
        );
      } else {
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPending = localStatus === "pending";
  const isAccepted = localStatus === "accepted";
  const isDeclined = localStatus === "declined";
  const isExpired = localStatus === "expired";
  const isCompleted = localStatus === "completed";
  const isUnavailable = localStatus === "unavailable";
  const isLoading = acceptLoading || declineLoading;

  const statusLabel = isAccepted
    ? "Accepted"
    : isDeclined
      ? "Declined"
      : isExpired
        ? "Expired"
        : isCompleted
          ? "Completed"
          : isUnavailable
            ? "Unavailable"
            : "Pending";

  const statusPillClass =
    isAccepted || isCompleted
      ? "bg-[#e9f6ee] text-[#28764a]"
      : isDeclined || isExpired || isUnavailable
        ? "bg-[#fdefef] text-[#b43b3b]"
        : "bg-[#fff3dc] text-[#9a6810]";

  const title = isAccepted
    ? "Offer Accepted"
    : isDeclined
      ? "Offer Declined"
      : isExpired
        ? "Offer Expired"
        : isCompleted
          ? "Purchase Completed"
          : isUnavailable
            ? "Offer No Longer Available"
            : isRecipient
              ? "Offer Received"
              : isOfferSender
                ? "Offer Sent"
                : "Offer";

  const productTitle =
    offer.productTitle ||
    offer.product?.title ||
    offer.product?.name ||
    "Product offer";

  const formatMoney = (value: number) =>
    `${currency} ${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const originalPrice =
    offer.originalPrice ||
    (offer.product?.price ? parseFloat(String(offer.product.price)) : 0);

  return (
    <div
      ref={cardRef}
      className="w-full max-w-[340px] bg-white rounded-2xl p-4 border border-[#ebe7e1] shadow-sm text-left font-sans"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            isAccepted || isCompleted ? "bg-[#edf7f0]" : "bg-[#fdf0ea]"
          }`}
        >
          {isCompleted ? (
            <ShoppingBag size={18} className="text-[#28764a]" />
          ) : isAccepted ? (
            <Check size={18} className="text-[#28764a]" />
          ) : (
            <Tag size={18} className="text-[#c0613a]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-bold text-[#1a1a1a] leading-tight truncate">
            {title}
          </h4>
          <p className="text-[11px] text-[#888] line-clamp-1 mt-0.5">
            {productTitle}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 uppercase tracking-wide ${statusPillClass}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Price Panel */}
      <div className="flex items-center justify-between bg-[#faf8f5] rounded-xl px-3 py-2.5 mb-2.5 overflow-hidden">
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-bold tracking-wider text-[#999] uppercase mb-0.5">
            Listed price
          </span>
          <span className="text-[12px] font-bold text-[#777] line-through truncate">
            {formatMoney(originalPrice)}
          </span>
        </div>
        <div className="flex items-center justify-center mx-2 shrink-0">
          <div className="w-6 h-6 rounded-full bg-[#fdf0ea] flex items-center justify-center">
            <ArrowRight size={13} className="text-[#cb6f4d]" />
          </div>
        </div>
        <div className="flex flex-col items-end min-w-0">
          <span className="text-[9px] font-bold tracking-wider text-[#999] uppercase mb-0.5">
            Offer price
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-extrabold text-[#c0613a] truncate">
              {formatMoney(localOfferPrice)}
            </span>
            {Boolean(localEditedAt || (offer.editCount ?? 0) > 0) && (
              <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[9px] font-semibold">
                Edited
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Offer Note/Message - Always displayed for info whether pending, accepted, or declined */}
      {(offer.message || (offer as any).note) && (
        <div className="flex items-start gap-2 bg-[#fef8f5] border border-[#f5e3da] rounded-xl px-2.5 py-2 mb-2.5 text-[11px] text-[#5d4b43] leading-relaxed">
          <MessageSquare size={13} className="text-[#a65335] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-[#a65335] uppercase tracking-wide block">Offer Note:</span>
            <span className="break-words line-clamp-4">{offer.message || (offer as any).note}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 mb-2 text-center font-medium">
          {error}
        </p>
      )}

      {/* Sender Action: Edit offer when pending & unread */}
      {isOfferSender &&
        isPending &&
        Number(offer.id) > 0 &&
        !localSeenAt &&
        !readAt &&
        !offer.seenAt &&
        onEditOffer && (
          <div className="pt-2 border-t border-[#f3ece7] flex justify-end">
            <button
              type="button"
              onClick={() =>
                onEditOffer({ ...offer, offerPrice: localOfferPrice })
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fdf0ea] border border-[#f5d6c8] text-[#c0613a] hover:bg-[#fae6dc] text-[11px] font-bold transition-colors cursor-pointer"
            >
              <Pencil size={11} />
              <span>Edit Offer</span>
            </button>
          </div>
        )}

      {/* Recipient Actions: Accept / Decline / Counter when pending */}
      {isRecipient && isPending && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRespond("accepted")}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[36px] px-3 py-2 rounded-xl bg-[#2e7d4f] hover:bg-[#256640] text-white text-[12px] font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {acceptLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Check size={14} />
                  <span>Accept</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRespond("declined")}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[36px] px-3 py-2 rounded-xl bg-[#f3f4f6] hover:bg-[#e5e7eb] border border-[#d1d5db] text-[#4b5563] text-[12px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {declineLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <X size={14} />
                  <span>Decline</span>
                </>
              )}
            </button>
          </div>
          {onCounterOffer && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onCounterOffer(offer)}
              className="w-full flex items-center justify-center gap-1.5 min-h-[34px] px-3 py-1.5 rounded-xl border border-[#c0613a] text-[#c0613a] hover:bg-[#fdf0ea] text-[11px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Tag size={13} />
              <span>Counter Offer</span>
            </button>
          )}
        </div>
      )}

      {/* Settled Badges */}
      {(isAccepted || isCompleted) && (
        <div className="w-full min-h-[36px] flex items-center justify-center gap-1.5 bg-[#edf7f0] border border-[#c3e6cb] rounded-xl px-3 py-2 text-center text-[11px] font-bold text-[#2e7d4f]">
          <Check size={13} />
          <span>
            {isCompleted
              ? "Purchase Completed"
              : isRecipient
                ? "You accepted this offer"
                : "Your offer was accepted"}
          </span>
        </div>
      )}

      {isDeclined && (
        <div className="w-full min-h-[36px] flex items-center justify-center gap-1.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2 text-center text-[11px] font-bold text-[#dc2626]">
          <X size={13} />
          <span>
            {isRecipient ? "You declined this offer" : "Offer was declined"}
          </span>
        </div>
      )}

      {isUnavailable && (
        <div className="w-full min-h-[36px] flex items-center justify-center gap-1.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-3 py-2 text-center text-[11px] font-bold text-[#6b7280]">
          <Info size={13} />
          <span>This product is no longer available</span>
        </div>
      )}

      {/* Checkout Button for Accepted Offers */}
      {isAccepted && canCheckout && onCheckout && (
        <button
          type="button"
          onClick={() => onCheckout(offer)}
          className="w-full mt-2 min-h-[38px] px-4 py-2 rounded-xl bg-[#cb6f4d] hover:bg-[#b85f3d] text-white text-[12px] font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <ShoppingBag size={14} />
          <span>Proceed to Checkout</span>
        </button>
      )}
    </div>
  );
}

