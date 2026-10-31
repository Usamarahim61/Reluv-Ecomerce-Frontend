"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Package,
  ShoppingBag,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Phone,
  User,
  Shield,
  FileText,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  DollarSign,
  Info,
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "../constants/api";
import { toast } from "react-toastify";

// ── Types ──────────────────────────────────────────────────────────────────────
export type StandardOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type StandardPaymentStatus = "PAID" | "PENDING" | "FAILED";

export type StandardDisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "AWAITING_INFORMATION"
  | "RESOLVED_REFUND"
  | "RESOLVED_RELEASE"
  | "CLOSED";

export type StandardRefundStatus =
  | "AWAITING_REVIEW"
  | "REFUND_APPROVED"
  | "REFUND_PROCESSING"
  | "REFUND_SUCCEEDED"
  | "REFUND_FAILED";

interface BuyerOrderDetailModalProps {
  order: any;
  existingDispute?: any;
  onClose: () => void;
  onRaiseDispute: (order: any) => void;
  onRequestRefund: (order: any) => void;
  onViewDispute?: (order: any, dispute: any) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function mapToStandardOrderStatus(rawStatus?: string): StandardOrderStatus {
  if (!rawStatus) return "PENDING";
  const s = rawStatus.toLowerCase().trim();
  if (s === "placed" || s === "pending") return "PENDING";
  if (s === "confirmed") return "CONFIRMED";
  if (s === "in progress" || s === "processing") return "PROCESSING";
  if (s === "shipped") return "SHIPPED";
  if (s === "delivered" || s === "completed") return "DELIVERED";
  if (s === "cancelled") return "CANCELLED";
  return "PENDING";
}

export function mapToStandardPaymentStatus(rawStatus?: string): StandardPaymentStatus {
  if (!rawStatus) return "PENDING";
  const s = rawStatus.toLowerCase().trim();
  if (s === "paid") return "PAID";
  if (s === "failed") return "FAILED";
  return "PENDING";
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateStr);
  }
}

// ── Countdown Hook ─────────────────────────────────────────────────────────────
export function useDisputeCountdown(deadline: string | null | undefined) {
  const calculate = () => {
    if (!deadline) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "Expired" };
    }
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "Expired" };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return {
      hours,
      minutes,
      seconds,
      isExpired: false,
      formatted: `${hours} hours, ${minutes} minutes, ${seconds} seconds`,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculate);

  useEffect(() => {
    setTimeLeft(calculate());
    if (!deadline) return;

    const interval = setInterval(() => {
      const updated = calculate();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return timeLeft;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BuyerOrderDetailModal({
  order,
  existingDispute,
  onClose,
  onRaiseDispute,
  onRequestRefund,
}: BuyerOrderDetailModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const orderNum = order?.id || order?.orderId || "—";
  const orderStatus = mapToStandardOrderStatus(order?.orderStatus || order?.status);
  const paymentStatus = mapToStandardPaymentStatus(order?.paymentStatus);

  // Delivery & deadline calculation:
  // Prefer server-provided deadline (order.disputeDeadline), fallback to delivery date + 48h
  const deliveredDate = order?.deliveryDate || order?.deliveredAt || (orderStatus === "DELIVERED" ? order?.updatedAt : null);
  const disputeDeadline =
    order?.disputeDeadline ||
    (deliveredDate ? new Date(new Date(deliveredDate).getTime() + 48 * 60 * 60 * 1000).toISOString() : null);

  const countdown = useDisputeCountdown(orderStatus === "DELIVERED" ? disputeDeadline : null);

  // Prices
  const productPrice = Number(order?.productPrice || order?.product?.price || 0);
  const buyerProtectionFee = Number(order?.buyerProtectionFee || 0);
  const shippingFee = Number(order?.shippingFee || 0);
  const totalPaid = Number(order?.totalAmount || order?.total || productPrice + buyerProtectionFee + shippingFee);

  // Product & seller
  const productTitle = order?.productTitle || order?.title || order?.product?.title || "Item";
  const productImage = order?.productImage || order?.imageUrl || "";
  const sellerName = order?.seller?.username || order?.username || "Seller";
  const sellerAvatar = order?.seller?.avatar;
  const deliveryMethod = order?.deliveryMethod === "pickup" ? "Pickup Point" : "Home Delivery";
  const deliveryAddress = order?.address || order?.pickupAddress || "Not provided";
  const phoneNumber = order?.phoneNumber || "Not provided";

  // Existing dispute / refund analysis
  const hasExistingDispute = Boolean(existingDispute);
  const disputeStatusRaw = (existingDispute?.status || existingDispute?.disputeStatus || "OPEN").toUpperCase();
  const disputeReason = existingDispute?.reason || "—";
  const disputeDescription = existingDispute?.description || existingDispute?.details || "";
  const adminResolution = existingDispute?.resolution || existingDispute?.adminNote || null;
  const isRefundRequest =
    Boolean(existingDispute?.refundAmount) ||
    disputeDescription.includes("[Type: Refund Request]") ||
    disputeReason.includes("REFUND");

  // Determine refund status
  let refundStatusText: StandardRefundStatus = "AWAITING_REVIEW";
  if (disputeStatusRaw === "RESOLVED_REFUND" || (disputeStatusRaw === "RESOLVED" && isRefundRequest)) {
    refundStatusText = "REFUND_APPROVED";
  } else if (disputeStatusRaw === "RESOLVED_RELEASE" || disputeStatusRaw === "REJECTED") {
    refundStatusText = "REFUND_FAILED";
  } else if (disputeStatusRaw === "CLOSED") {
    refundStatusText = "REFUND_SUCCEEDED";
  }

  // Copy order ID helper
  const handleCopyOrder = () => {
    if (orderNum) {
      navigator.clipboard.writeText(String(orderNum));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info(`Order #${orderNum} copied to clipboard`);
    }
  };

  // Status step progression for order
  const orderSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStepIdx = orderSteps.indexOf(orderStatus);

  // Dispute timeline steps
  const disputeTimeline = [
    {
      title: "Dispute Submitted",
      desc: "Case filed by buyer and queued for review",
      done: true,
      active: disputeStatusRaw === "OPEN",
    },
    {
      title: "Under Admin Review",
      desc: "Support agents are investigating the claim & evidence",
      done: ["UNDER_REVIEW", "AWAITING_INFORMATION", "RESOLVED_REFUND", "RESOLVED_RELEASE", "RESOLVED", "CLOSED", "REJECTED"].includes(disputeStatusRaw),
      active: disputeStatusRaw === "UNDER_REVIEW" || disputeStatusRaw === "AWAITING_INFORMATION",
    },
    {
      title: "Decision Made",
      desc: "Review completed and verdict determined",
      done: ["RESOLVED_REFUND", "RESOLVED_RELEASE", "RESOLVED", "CLOSED", "REJECTED"].includes(disputeStatusRaw),
      active: false,
    },
    {
      title: isRefundRequest ? "Refund Processing" : "Resolution Applied",
      desc: isRefundRequest ? "Escrow refund initiating through payment gateway" : "Funds released according to decision",
      done: ["RESOLVED_REFUND", "RESOLVED_RELEASE", "CLOSED"].includes(disputeStatusRaw),
      active: disputeStatusRaw === "RESOLVED_REFUND",
    },
    {
      title: "Resolved",
      desc: "Case concluded and finalized",
      done: ["RESOLVED_REFUND", "RESOLVED_RELEASE", "CLOSED", "RESOLVED"].includes(disputeStatusRaw),
      active: disputeStatusRaw === "CLOSED" || disputeStatusRaw === "RESOLVED",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{
        backgroundColor: "rgba(20, 10, 5, 0.65)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#faf8f5] shadow-[0_32px_80px_rgba(203,111,77,0.25)] overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Top Accent Strip */}
        <div className="h-2 bg-gradient-to-r from-[#cb6f4d] via-[#e8956e] to-[#2e7d4f]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#ece9e4] bg-white px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff7f4] border border-[#f5d5c0] text-[#cb6f4d]">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#1a1a1a]">
                  Order #{orderNum}
                </h2>
                <button
                  onClick={handleCopyOrder}
                  className="text-gray-400 hover:text-[#cb6f4d] transition-colors"
                  title="Copy Order ID"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-[#888]">
                Placed on {formatDateTime(order?.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f0eb] text-[#888] transition-all hover:bg-[#fdf2f2] hover:text-[#b33333]"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Status Stepper */}
          <div className="rounded-2xl border border-[#ece9e4] bg-white p-4.5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888]">
                Order Status
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                    orderStatus === "DELIVERED"
                      ? "bg-[#edf7f0] text-[#2e7d4f] border border-[#b8e0c8]"
                      : orderStatus === "CANCELLED"
                      ? "bg-[#fdf2f2] text-[#b33333] border border-[#f0c8c8]"
                      : "bg-[#fff7f0] text-[#cb6f4d] border border-[#f5d5c0]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {orderStatus}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    paymentStatus === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : paymentStatus === "FAILED"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  Payment: {paymentStatus}
                </span>
              </div>
            </div>

            {orderStatus !== "CANCELLED" && (
              <div className="flex items-center justify-between pt-2 px-1 sm:px-4">
                {orderSteps.map((step, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            isDone
                              ? "bg-[#cb6f4d] text-white shadow-sm shadow-[#cb6f4d]/30"
                              : "bg-[#f5f0eb] text-[#aaa] border border-[#ece9e4]"
                          } ${isCurrent ? "ring-4 ring-[#cb6f4d]/20" : ""}`}
                        >
                          {isDone ? <Check size={14} strokeWidth={2.5} /> : idx + 1}
                        </div>
                        <span
                          className={`mt-1.5 text-[10px] font-medium tracking-tight ${
                            isCurrent ? "font-bold text-[#cb6f4d]" : isDone ? "text-[#555]" : "text-[#bbb]"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                      {idx < orderSteps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full ${
                            currentStepIdx > idx ? "bg-[#cb6f4d]" : "bg-[#ece9e4]"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* 48-Hour Delivery Confirmation & Dispute Window Banner */}
          {orderStatus === "DELIVERED" && (
            <div className="rounded-2xl border border-[#f5d5c0] bg-gradient-to-br from-[#fff9f6] via-[#fff5ef] to-[#fdeee8] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#cb6f4d] text-white">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1a1a]">
                      48-Hour Dispute &amp; Refund Window
                    </h4>
                    <p className="text-xs text-[#888]">
                      Buyer Protection coverage period after delivery
                    </p>
                  </div>
                </div>

                {!countdown.isExpired ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#cb6f4d] px-3 py-1 text-xs font-bold text-white shadow-sm shadow-[#cb6f4d]/30 animate-pulse">
                    <Clock size={12} />
                    Active Window
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                    Window Expired
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 rounded-xl bg-white/80 p-3.5 border border-white">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#999] block">
                    Delivered On
                  </span>
                  <span className="text-xs font-semibold text-[#333]">
                    {formatDateTime(deliveredDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#999] block">
                    Dispute Deadline
                  </span>
                  <span className="text-xs font-semibold text-[#cb6f4d]">
                    {formatDateTime(disputeDeadline)}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                {!countdown.isExpired ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-[#666] font-medium">
                      Remaining Time:{" "}
                      <strong className="text-[#cb6f4d] text-sm">
                        {countdown.hours} hours, {countdown.minutes} minutes, {countdown.seconds} seconds
                      </strong>
                    </span>
                    <span className="text-[11px] text-[#aaa]">
                      Auto-refreshed with server deadline
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-100 p-2.5 text-xs text-gray-600 font-medium flex items-center gap-2">
                    <Info size={15} className="text-gray-400 shrink-0" />
                    <span>The 48-hour dispute and refund request period has expired.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons inside the window card */}
              <div className="mt-4 pt-3 border-t border-[#f5d5c0]/60">
                {hasExistingDispute ? (
                  <div className="rounded-xl bg-[#fff7f0] border border-[#f5d5c0] p-3 text-center">
                    <p className="text-xs font-semibold text-[#cb6f4d] flex items-center justify-center gap-1.5">
                      <Shield size={14} />
                      A dispute or refund request has already been filed for this order and is under review.
                    </p>
                  </div>
                ) : !countdown.isExpired ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => onRaiseDispute(order)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[#cb6f4d] bg-white px-4 py-2.5 text-xs font-bold text-[#cb6f4d] transition-all hover:bg-[#fff7f4] shadow-sm hover:shadow active:scale-95"
                    >
                      <AlertTriangle size={14} />
                      RAISE DISPUTE
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestRefund(order)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#cb6f4d] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#b85a38] shadow-sm shadow-[#cb6f4d]/25 active:scale-95"
                    >
                      <RotateCcw size={14} />
                      REQUEST REFUND
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-center text-gray-400 italic">
                    The 48-hour dispute and refund request period has expired.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Product & Seller Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Card */}
            <div className="rounded-2xl border border-[#ece9e4] bg-white p-4.5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#888] block mb-3">
                Product Details
              </span>
              <div className="flex items-start gap-3.5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb]">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText size={20} className="text-[#d4c8be]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-[#1a1a1a]">
                    {productTitle}
                  </h3>
                  {order?.product?.brand && (
                    <p className="text-xs text-[#888]">Brand: {order.product.brand}</p>
                  )}
                  {order?.product?.size && (
                    <p className="text-xs text-[#888]">Size: {order.product.size}</p>
                  )}
                  {order?.productId && (
                    <Link
                      href={`/products/${order.productId}`}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#cb6f4d] hover:underline"
                    >
                      View listing <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="rounded-2xl border border-[#ece9e4] bg-white p-4.5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#888] block mb-3">
                Seller Information
              </span>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-full bg-[#f5f0eb] border border-[#ece9e4] flex items-center justify-center overflow-hidden">
                  {sellerAvatar ? (
                    <img src={sellerAvatar} alt={sellerName} className="h-full w-full object-cover" />
                  ) : (
                    <User size={22} className="text-[#cb6f4d]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#1a1a1a]">@{sellerName}</p>
                  <p className="text-xs text-[#aaa]">Verified Marketplace Seller</p>
                  {order?.seller?.id && (
                    <Link
                      href={`/member/${order.seller.id}`}
                      className="text-[11px] font-semibold text-[#cb6f4d] hover:underline"
                    >
                      View Seller Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Address Information */}
          <div className="rounded-2xl border border-[#ece9e4] bg-white p-4.5 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#888] block mb-3">
              Delivery Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-[#fdfbf9] border border-[#f0ebe4] p-3">
                <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Truck size={12} /> Delivery Method
                </span>
                <span className="font-semibold text-[#333]">{deliveryMethod}</span>
              </div>
              <div className="rounded-xl bg-[#fdfbf9] border border-[#f0ebe4] p-3 sm:col-span-2">
                <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Shipping Address
                </span>
                <span className="font-medium text-[#444] break-words">{deliveryAddress}</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-2xl border border-[#ece9e4] bg-white p-4.5 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#888] block mb-3">
              Payment &amp; Price Breakdown
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#666]">
                <span>Product Price</span>
                <span className="font-medium">THB {productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#666]">
                <span>Buyer Protection Fee</span>
                <span className="font-medium">THB {buyerProtectionFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#666]">
                <span>Shipping Fee</span>
                <span className="font-medium">THB {shippingFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#ece9e4] flex justify-between text-sm font-bold text-[#1a1a1a]">
                <span>Total Paid</span>
                <span className="text-base font-black text-[#cb6f4d]">
                  THB {totalPaid.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Dispute & Refund Tracking Section (if exists) */}
          {hasExistingDispute && (
            <div className="rounded-2xl border border-[#c5d0fa] bg-[#f8faff] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#dde5fa] pb-3">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-[#3b5bdb]" />
                  <h3 className="text-sm font-bold text-[#1a1a1a]">
                    {isRefundRequest ? "Refund Request Tracking" : "Dispute Tracking"}
                  </h3>
                </div>
                <span className="rounded-full bg-[#3b5bdb] px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                  {disputeStatusRaw}
                </span>
              </div>

              {/* 5-step visual dispute timeline */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#888] block mb-3">
                  Progress Timeline
                </span>
                <div className="space-y-3">
                  {disputeTimeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            step.done
                              ? "bg-[#3b5bdb] text-white"
                              : "bg-white text-gray-400 border border-gray-300"
                          } ${step.active ? "ring-4 ring-[#3b5bdb]/20" : ""}`}
                        >
                          {step.done ? <Check size={12} strokeWidth={3} /> : idx + 1}
                        </div>
                        {idx < disputeTimeline.length - 1 && (
                          <div
                            className={`w-0.5 h-6 my-0.5 ${
                              step.done ? "bg-[#3b5bdb]" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p
                          className={`text-xs font-bold ${
                            step.done ? "text-[#1a1a1a]" : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[11px] text-gray-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Details */}
              <div className="rounded-xl bg-white p-3.5 border border-[#dde5fa] text-xs space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#aaa] tracking-wider block">
                    Reason
                  </span>
                  <span className="font-semibold text-[#333]">{disputeReason}</span>
                </div>
                {disputeDescription && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#aaa] tracking-wider block">
                      Description
                    </span>
                    <p className="text-[#555] leading-relaxed whitespace-pre-wrap">
                      {disputeDescription}
                    </p>
                  </div>
                )}
                {adminResolution && (
                  <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-0.5">
                      Admin Decision Note (Buyer Visible)
                    </span>
                    <p className="text-emerald-900 font-medium">{adminResolution}</p>
                  </div>
                )}
              </div>

              {/* Refund Tracking Info */}
              {(isRefundRequest || existingDispute?.refundAmount) && (
                <div className="rounded-xl bg-white p-3.5 border border-[#dde5fa] text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider">
                      Refund Status
                    </span>
                    <span className="font-bold text-[#2e7d4f]">
                      {refundStatusText.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#555]">
                    <span>Refund Amount:</span>
                    <span className="font-black text-[#1a1a1a]">
                      THB {Number(existingDispute?.refundAmount || totalPaid).toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#888] italic">
                    Note: Refunds to your payment card require admin verification and are processed through Stripe once approved.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#ece9e4] bg-white px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-[#f5f0eb] hover:bg-[#e8e2d8] px-6 py-2.5 text-xs font-bold text-[#555] transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

