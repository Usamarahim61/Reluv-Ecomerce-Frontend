"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import {
  FileText,
  ChevronRight,
  Package,
  ShoppingBag,
  Tag,
  DollarSign,
  Check,
  X,
  Clock,
  ShoppingCart,
  AlertTriangle,
  Shield,
} from "lucide-react";
import Footer from "../components/Footer";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Category =
  | "Sold"
  | "Bought"
  | "Offers"
  | "Disputes_Recieved"
  | "Disputes_Raised";
type Status = "All" | "Placed" | "In Progress" | "Completed" | "Cancelled";
type OfferStatus = "All" | "pending" | "accepted" | "declined";
type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED"
  | "CLOSED";

const STATUS_STYLES: Record<
  Exclude<Status, "All">,
  { pill: string; dot: string }
> = {
  Placed: {
    pill: "bg-[#f0f4ff] text-[#3b5bdb] border border-[#c5d0fa]",
    dot: "bg-[#3b5bdb]",
  },
  "In Progress": {
    pill: "bg-[#fff7f0] text-[#cb6f4d] border border-[#f5d5c0]",
    dot: "bg-[#cb6f4d]",
  },
  Completed: {
    pill: "bg-[#edf7f0] text-[#2e7d4f] border border-[#b8e0c8]",
    dot: "bg-[#2e7d4f]",
  },
  Cancelled: {
    pill: "bg-[#fdf2f2] text-[#b33333] border border-[#f0c8c8]",
    dot: "bg-[#b33333]",
  },
};

const DISPUTE_STATUS_STYLES: Record<
  DisputeStatus,
  { pill: string; dot: string; label: string }
> = {
  OPEN: {
    pill: "bg-[#fff7f0] text-[#cb6f4d] border border-[#f5d5c0]",
    dot: "bg-[#cb6f4d]",
    label: "Open",
  },
  UNDER_REVIEW: {
    pill: "bg-[#f0f4ff] text-[#3b5bdb] border border-[#c5d0fa]",
    dot: "bg-[#3b5bdb]",
    label: "Under Review",
  },
  RESOLVED: {
    pill: "bg-[#edf7f0] text-[#2e7d4f] border border-[#b8e0c8]",
    dot: "bg-[#2e7d4f]",
    label: "Resolved",
  },
  REJECTED: {
    pill: "bg-[#fdf2f2] text-[#b33333] border border-[#f0c8c8]",
    dot: "bg-[#b33333]",
    label: "Rejected",
  },
  CLOSED: {
    pill: "bg-[#f5f5f5] text-[#888] border border-[#ddd]",
    dot: "bg-[#888]",
    label: "Closed",
  },
};

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  Sold: Tag,
  Bought: ShoppingBag,
  Offers: DollarSign,
  Disputes_Recieved: AlertTriangle,
  Disputes_Raised: Shield,
};

// ── Dispute Modal ─────────────────────────────────────────────────────────────
interface DisputeModalProps {
  order: any;
  onClose: () => void;
  onSubmit: (orderId: any, reason: string, details: string) => Promise<void>;
}

const DISPUTE_REASONS = [
  "ITEM_NOT_RECEIVED",
  "DAMAGED_PRODUCT",
  "WRONG_ITEM",
  "PAYMENT_ISSUE",
];

function DisputeModal({ order, onClose, onSubmit }: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !details.trim()) return;
    setSubmitting(true);
    await onSubmit(order, reason, details);
    setSubmitting(false);
    setSubmitted(true);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(20,10,5,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-[0_24px_64px_rgba(203,111,77,0.20)] overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="h-1.5 bg-gradient-to-r from-[#b33333] via-[#cb6f4d] to-[#e8956e]" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f0eb] text-[#888] transition-all hover:bg-[#fdf2f2] hover:text-[#b33333]"
        >
          <X size={15} />
        </button>

        <div className="px-6 pb-6 pt-5">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#edf7f0] to-[#d4f0e0] border border-[#b8e0c8]">
                <Check size={36} className="text-[#2e7d4f]" strokeWidth={2.5} />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">
                Dispute Filed
              </h3>
              <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-[#888]">
                Your dispute has been submitted. Our team will review it within
                24–48 hours and contact you.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-[#cb6f4d] px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#b85a38]"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fdf2f2] to-[#fde8e8] border border-[#f0c8c8]">
                  <AlertTriangle size={20} className="text-[#b33333]" />
                </div>
                <div>
                  <h2 className="font-serif text-[22px] font-normal text-[#1a1a1a]">
                    File a Dispute
                  </h2>
                  <p className="mt-0.5 text-xs text-[#aaa]">
                    Describe the issue with your order
                  </p>
                </div>
              </div>

              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb]">
                  {order.imageUrl ? (
                    <img
                      src={order.imageUrl}
                      alt={order.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText size={18} className="text-[#d4c8be]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                    {order.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#bbb]">
                    Order · {order.date}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#1a1a1a]">
                  {order.price}
                </span>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#888]">
                  Reason for dispute <span className="text-[#b33333]">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {DISPUTE_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all
                        ${
                          reason === r
                            ? "border-[#b33333] bg-[#fdf2f2] text-[#b33333]"
                            : "border-[#ece9e4] bg-[#fdfbf9] text-[#555] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
                        }`}
                    >
                      {reason === r && (
                        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#b33333] align-middle" />
                      )}
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#888]">
                  Additional details <span className="text-[#b33333]">*</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Describe the issue in as much detail as possible…"
                  className="w-full resize-none rounded-2xl border border-[#ece9e4] bg-[#fdfbf9] px-4 py-3 text-sm text-[#333] placeholder:text-[#ccc] focus:border-[#cb6f4d] focus:outline-none focus:ring-2 focus:ring-[#cb6f4d]/15 transition-all"
                />
                <p className="mt-1 text-right text-[10px] text-[#ccc]">
                  {details.length}/500
                </p>
              </div>

              <div className="mb-5 flex items-start gap-2 rounded-xl bg-[#f0f4ff] border border-[#c5d0fa] px-3 py-2.5">
                <Shield size={14} className="mt-0.5 shrink-0 text-[#3b5bdb]" />
                <p className="text-xs leading-relaxed text-[#3b5bdb]">
                  Your purchase is protected. Disputes are reviewed by our team
                  within 24–48 hours.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center rounded-full border border-[#ddd] bg-white px-4 py-2.5 text-sm font-semibold text-[#555] transition-all hover:border-[#888] hover:text-[#333]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason || !details.trim() || submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#b33333] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#9a2a2a] disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={14} />
                      File Dispute
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dispute Status Modal ──────────────────────────────────────────────────────
interface DisputeStatusModalProps {
  order: any;
  dispute: any;
  onClose: () => void;
}

const DISPUTE_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    pill: string;
    icon: React.ElementType;
    iconColor: string;
    bg: string;
    border: string;
    desc: string;
  }
> = {
  OPEN: {
    label: "Open",
    pill: "bg-[#fff7f0] text-[#cb6f4d] border-[#f5d5c0]",
    icon: Clock,
    iconColor: "text-[#cb6f4d]",
    bg: "from-[#fff7f0] to-[#fdeee8]",
    border: "border-[#f5d5c0]",
    desc: "Your dispute has been received and is pending review by our support team.",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    pill: "bg-[#f0f4ff] text-[#3b5bdb] border-[#c5d0fa]",
    icon: Shield,
    iconColor: "text-[#3b5bdb]",
    bg: "from-[#f0f4ff] to-[#e8edff]",
    border: "border-[#c5d0fa]",
    desc: "Our team is actively reviewing your case and gathering information.",
  },
  RESOLVED: {
    label: "Resolved",
    pill: "bg-[#edf7f0] text-[#2e7d4f] border-[#b8e0c8]",
    icon: Check,
    iconColor: "text-[#2e7d4f]",
    bg: "from-[#edf7f0] to-[#d4f0e0]",
    border: "border-[#b8e0c8]",
    desc: "Your dispute has been resolved. Please check your email for the outcome details.",
  },
  REJECTED: {
    label: "Rejected",
    pill: "bg-[#fdf2f2] text-[#b33333] border-[#f0c8c8]",
    icon: X,
    iconColor: "text-[#b33333]",
    bg: "from-[#fdf2f2] to-[#fde8e8]",
    border: "border-[#f0c8c8]",
    desc: "Unfortunately, your dispute was not upheld after review. Contact support for more details.",
  },
  CLOSED: {
    label: "Closed",
    pill: "bg-[#f5f5f5] text-[#888] border-[#ddd]",
    icon: X,
    iconColor: "text-[#888]",
    bg: "from-[#f5f5f5] to-[#efefef]",
    border: "border-[#ddd]",
    desc: "This dispute has been closed.",
  },
};

function DisputeStatusModal({
  order,
  dispute,
  onClose,
}: DisputeStatusModalProps) {
  const statusKey = (
    dispute?.disputeStatus ||
    dispute?.status ||
    "OPEN"
  ).toUpperCase();
  const cfg = DISPUTE_STATUS_CONFIG[statusKey] || DISPUTE_STATUS_CONFIG["OPEN"];
  const StatusIcon = cfg.icon;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const submittedOn = dispute?.createdAt
    ? new Date(dispute.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const timelineSteps = [
    {
      label: "Dispute submitted",
      done: true,
      date: submittedOn,
    },
    {
      label: "Under review by support team",
      done: ["UNDER_REVIEW", "RESOLVED", "REJECTED", "CLOSED"].includes(
        statusKey,
      ),
      date: null,
    },
    {
      label: "Resolution reached",
      done: ["RESOLVED", "REJECTED", "CLOSED"].includes(statusKey),
      date: null,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(20,10,5,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.15)] overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="h-1.5 bg-gradient-to-r from-[#cb6f4d] via-[#d4805e] to-[#e8956e]" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f0eb] text-[#888] transition-all hover:bg-[#fdf2f2] hover:text-[#b33333]"
        >
          <X size={15} />
        </button>

        <div className="px-6 pb-6 pt-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff0e8] to-[#fde0cc] border border-[#f5d5c0]">
              <AlertTriangle size={20} className="text-[#cb6f4d]" />
            </div>
            <div>
              <h2 className="font-serif text-[22px] font-normal text-[#1a1a1a]">
                Dispute Status
              </h2>
              <p className="mt-0.5 text-xs text-[#aaa]">
                Submitted on {submittedOn}
              </p>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb]">
              {order?.imageUrl ? (
                <img
                  src={order.imageUrl}
                  alt={order.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText size={18} className="text-[#d4c8be]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                {order?.title || "—"}
              </p>
              <p className="mt-0.5 text-xs text-[#bbb]">
                Order · {order?.date || "—"}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold text-[#1a1a1a]">
              {order?.price || "—"}
            </span>
          </div>

          <div
            className={`mb-5 rounded-2xl bg-gradient-to-br ${cfg.bg} border ${cfg.border} p-4`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#888]">
                Current Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${cfg.pill}`}
              >
                <StatusIcon size={11} />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#555]">{cfg.desc}</p>
            {dispute?.adminNote && (
              <div className="mt-3 rounded-xl bg-white/70 border border-white/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa] mb-1">
                  Admin Note
                </p>
                <p className="text-xs text-[#444] leading-relaxed">
                  {dispute.adminNote}
                </p>
              </div>
            )}
          </div>

          <div className="mb-5 space-y-3">
            <div className="rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
                Reason
              </p>
              <p className="text-sm font-medium text-[#333]">
                {dispute?.reason || "—"}
              </p>
            </div>
            {dispute?.details && (
              <div className="rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-[#555] italic">
                  "{dispute.details}"
                </p>
              </div>
            )}
          </div>

          <div className="mb-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
              Timeline
            </p>
            <div className="space-y-0">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all
                      ${
                        step.done
                          ? "border-[#cb6f4d] bg-[#cb6f4d]"
                          : "border-[#ddd] bg-white"
                      }`}
                    >
                      {step.done ? (
                        <Check
                          size={11}
                          className="text-white"
                          strokeWidth={3}
                        />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ddd]" />
                      )}
                    </div>
                    {i < 2 && (
                      <div
                        className={`w-0.5 flex-1 my-0.5 rounded-full ${step.done ? "bg-[#f5d5c0]" : "bg-[#ece9e4]"}`}
                        style={{ minHeight: "20px" }}
                      />
                    )}
                  </div>
                  <div className="pb-4 pt-0.5 min-w-0">
                    <p
                      className={`text-sm font-medium ${step.done ? "text-[#1a1a1a]" : "text-[#bbb]"}`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-[11px] text-[#ccc] mt-0.5">
                        {step.date}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-full bg-[#cb6f4d] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#b85a38]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isWithin48Hours(completedAt: string | undefined | null): boolean {
  if (!completedAt) return false;
  const diff = Date.now() - new Date(completedAt).getTime();
  return diff <= 48 * 60 * 60 * 1000;
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Orders() {
  return (
    <Suspense fallback={null}>
      <OrdersInner />
    </Suspense>
  );
}

function OrdersInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [disputesData, setDisputesData] = useState<any[]>([]);
  // Disputes received = disputes where the current user is the seller on the order
  const [disputesReceivedData, setDisputesReceivedData] = useState<any[]>([]);

  const [activeCategory, setActiveCategory] = useState<Category>("Sold");
  const [activeStatus, setActiveStatus] = useState<Status>("All");
  const [offerStatus, setOfferStatus] = useState<OfferStatus>("All");
  const [disputeRaisedStatus, setDisputeRaisedStatus] = useState<
    DisputeStatus | "All"
  >("All");
  const [disputeReceivedStatus, setDisputeReceivedStatus] = useState<
    DisputeStatus | "All"
  >("All");

  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<number | null>(null);
  const [rejectOrder, setRejectOrder] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<Record<number, string>>({});

  // Dispute modals
  const [disputeOrder, setDisputeOrder] = useState<any | null>(null);
  const [viewDisputeData, setViewDisputeData] = useState<{
    order: any;
    dispute: any;
  } | null>(null);

  const categories: Category[] = [
    "Sold",
    "Bought",
    "Offers",
    "Disputes_Recieved",
    "Disputes_Raised",
  ];
  const statuses: Status[] = [
    "All",
    "Placed",
    "In Progress",
    "Completed",
    "Cancelled",
  ];
  const offerStatuses: OfferStatus[] = [
    "All",
    "pending",
    "accepted",
    "declined",
  ];
  const disputeStatuses: (DisputeStatus | "All")[] = [
    "All",
    "OPEN",
    "UNDER_REVIEW",
    "RESOLVED",
    "REJECTED",
    "CLOSED",
  ];

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "offers") setActiveCategory("Offers");
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    const acceptedOffers = offersData.filter(
      (o) => o.status === "accepted" && o.expiresAt,
    );
    if (acceptedOffers.length === 0) return;
    const interval = setInterval(() => {
      const newTimeLeft: Record<number, string> = {};
      acceptedOffers.forEach((offer) => {
        const diff = new Date(offer.expiresAt).getTime() - Date.now();
        if (diff <= 0) {
          newTimeLeft[offer.id] = "Expired";
        } else {
          const h = Math.floor(diff / 3_600_000);
          const m = Math.floor((diff % 3_600_000) / 60_000);
          const s = Math.floor((diff % 60_000) / 1_000);
          newTimeLeft[offer.id] = `${h}h ${m}m ${s}s`;
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);
    return () => clearInterval(interval);
  }, [offersData]);

  // Fetch orders
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/orders/fetch-orders-by-user`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: Number(user.id) }),
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        setOrdersData(Array.isArray(data) ? data : data?.data || []);
      } catch {
        /* silent */
      }
    };
    fetchData();
  }, [user?.id]);

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      if (!user?.id) return;
      try {
        const [sellerRes, buyerRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/offers/seller/${user.id}`),
          fetch(`${API_BASE_URL}/api/offers/buyer/${user.id}`),
        ]);
        const sellerData = sellerRes.ok ? await sellerRes.json() : { data: [] };
        const buyerData = buyerRes.ok ? await buyerRes.json() : { data: [] };
        setOffersData([
          ...(sellerData.data || []).map((o: any) => ({
            ...o,
            role: "seller",
          })),
          ...(buyerData.data || []).map((o: any) => ({ ...o, role: "buyer" })),
        ]);
      } catch {
        /* silent */
      }
    };
    fetchOffers();
  }, [user?.id]);

  // Fetch disputes raised BY this user (buyer)
  const fetchDisputesRaised = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/disputes?filters[raisedBy][id][$eq]=${user.id}&populate[order][populate][product]=true&populate[order][populate][buyer]=true&populate[order][populate][seller]=true&populate[raisedBy][fields][0]=id`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setDisputesData(Array.isArray(data) ? data : data?.data || []);
    } catch {
      /* silent */
    }
  };

  // Fetch disputes RECEIVED by this user (seller)
  const fetchDisputesReceived = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/disputes?filters[order][seller][id][$eq]=${user.id}&populate[order][populate][product]=true&populate[order][populate][buyer]=true&populate[order][populate][seller]=true&populate[raisedBy][fields][0]=id&populate[raisedBy][fields][1]=username`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setDisputesReceivedData(Array.isArray(data) ? data : data?.data || []);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    fetchDisputesRaised();
    fetchDisputesReceived();
  }, [user?.id]);

  const handleRespondToOffer = async (
    offerId: number,
    action: "accepted" | "declined",
  ) => {
    if (!user?.id) return;
    setRespondingTo(offerId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/offers/${offerId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sellerId: Number(user.id) }),
      });
      if (res.ok)
        setOffersData((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, status: action } : o)),
        );
    } catch {
      /* silent */
    } finally {
      setRespondingTo(null);
    }
  };

  const handleConfirmOrder = async (orderId: any) => {
    if (!user?.id) return;
    setConfirmingOrder(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            // <--- Strapi requires this wrapper
            orderStatus: "in progress", // Make sure this key matches your Strapi field name
            seller: Number(user.id),
          },
        }),
      });
      if (res.ok) {
        setOrdersData((prev) =>
          prev.map((o) =>
            o.documentId === orderId ? { ...o, orderStatus: "in progress" } : o,
          ),
        );
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setConfirmingOrder(null);
    }
  };

  const handleRejectOrder = async (orderId: any) => {
    if (!user?.id) return;
    setRejectOrder(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { orderStatus: "cancelled", seller: Number(user.id) },
        }),
      });
      if (res.ok) {
        setOrdersData((prev) =>
          prev.map((o) =>
            o.documentId === orderId ? { ...o, orderStatus: "cancelled" } : o,
          ),
        );
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setRejectOrder(null);
    }
  };

  const handleBuyWithOffer = (offer: any) => {
    const product = offer.product;
    router.push(
      `/CheckOut?${new URLSearchParams({
        productId: String(product?.id || offer.product),
        documentId: String(product?.documentId || ""),
        title: offer.productTitle,
        brand: product?.brand || "",
        size: product?.size || "",
        price: String(offer.offerPrice),
        currency: "TBH",
        imageUrl: offer.productImage || "",
        buyerProtectionFee: "100",
        shippingFee: "100",
        sellerId: String(offer.seller?.id || ""),
        offerId: String(offer.id),
      }).toString()}`,
    );
  };

  const handleDisputeSubmit = async (
    order: any,
    reason: string,
    details: string,
  ) => {
    if (!user?.id) return;
    try {
      const sellerID = ordersData.find((o) => {
        return o.id === order.id;
      })?.seller?.id;
      const res = await fetch(`${API_BASE_URL}/api/disputes/file-dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            order: order?.id,
            raisedBy: Number(user.id),
            sellerId: Number(sellerID),
            reason,
            details,
          },
        }),
      });
      if (res.ok) {
        await fetchDisputesRaised();
      }
    } catch (err) {
      console.error("Dispute submission failed:", err);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return ordersData
      .map((order) => {
        let mappedStatus: Status = "Cancelled";
        if (order.orderStatus === "placed") mappedStatus = "Placed";
        else if (
          order.orderStatus === "in progress" ||
          order.orderStatus === "shipped"
        )
          mappedStatus = "In Progress";
        else if (order.orderStatus === "delivered") mappedStatus = "Completed";
        else if (order.orderStatus === "cancelled") mappedStatus = "Cancelled";
        return {
          id: order.id,
          documentId: order.documentId,
          title: order.product?.title || "No title",
          type: order.type,
          status: mappedStatus,
          price: `${order.totalAmount} €`,
          imageUrl: order.productImage || "",
          username: order.buyer?.username || "",
          date: new Date(order.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          completedAt:
            mappedStatus === "Completed"
              ? order.updatedAt || order.completedAt || null
              : null,
          buyerId: order.buyer?.id || null,
        };
      })
      .filter(
        (o) =>
          o.type === activeCategory &&
          (activeStatus === "All" || o.status === activeStatus),
      );
  }, [ordersData, activeCategory, activeStatus]);

  // Map a dispute to a card-friendly shape
  const mapDisputeToCard = (dispute: any) => {
    const order = dispute.order || {};
    const product = order.product || {};
    const status = (
      dispute.disputeStatus ||
      dispute.status ||
      "OPEN"
    ).toUpperCase() as DisputeStatus;
    return {
      id: dispute.id,
      documentId: dispute.documentId,
      disputeId: dispute.id,
      title: product.title || "No title",
      imageUrl: product.images?.[0]?.url
        ? `${API_BASE_URL}${product.images[0].url}`
        : order.productImage || "",
      price: order.totalAmount ? `${order.totalAmount} €` : "—",
      date: new Date(dispute.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status,
      reason: dispute.reason || "—",
      details: dispute.details || "",
      adminNote: dispute.adminNote || "",
      raisedBy: dispute.raisedBy,
      createdAt: dispute.createdAt,
      orderId: order.id,
      orderDocumentId: order.documentId,
    };
  };

  const filteredDisputesRaised = useMemo(() => {
    return disputesData
      .map(mapDisputeToCard)
      .filter(
        (d) =>
          disputeRaisedStatus === "All" || d.status === disputeRaisedStatus,
      );
  }, [disputesData, disputeRaisedStatus]);

  const filteredDisputesReceived = useMemo(() => {
    return disputesReceivedData
      .map(mapDisputeToCard)
      .filter(
        (d) =>
          disputeReceivedStatus === "All" || d.status === disputeReceivedStatus,
      );
  }, [disputesReceivedData, disputeReceivedStatus]);

  const filteredOffers = useMemo(
    () =>
      offersData.filter(
        (o) => offerStatus === "All" || o.status === offerStatus,
      ),
    [offersData, offerStatus],
  );

  // Counts
  const soldCount = useMemo(
    () => ordersData.filter((o) => o.type === "Sold").length,
    [ordersData],
  );
  const boughtCount = useMemo(
    () => ordersData.filter((o) => o.type === "Bought").length,
    [ordersData],
  );
  const offersCount = useMemo(() => offersData.length, [offersData]);
  const disputesRaisedCount = useMemo(
    () => disputesData.length,
    [disputesData],
  );
  const disputesReceivedCount = useMemo(
    () => disputesReceivedData.length,
    [disputesReceivedData],
  );

  // Helper: does this order already have a raised dispute?
  const orderHasDispute = (orderId: any) =>
    disputesData.some((d) => d.order?.id === orderId || d.order === orderId);

  // ── Dispute card component (shared for raised/received) ─────────────────────
  const renderDisputeCard = (card: any, isReceived = false) => {
    const ss = DISPUTE_STATUS_STYLES[card.status as DisputeStatus];
    return (
      <div
        key={card.id}
        className="group flex flex-col gap-3 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-3 transition-all hover:border-[#e8c4b0] hover:bg-[#fff7f4] hover:shadow-[0_4px_16px_rgba(203,111,77,0.10)] md:p-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb] md:h-20 md:w-20">
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FileText size={22} className="text-[#d4c8be]" />
              </div>
            )}
            {ss && (
              <span
                className={`absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${ss.dot}`}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1a1a1a] md:text-[15px]">
              {card.title}
            </p>
            {isReceived && card.raisedBy?.username && (
              <p className="mt-0.5 text-xs text-[#bbb]">
                By: @{card.raisedBy.username}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {ss && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ss.pill}`}
                >
                  {ss.label}
                </span>
              )}
              <span className="text-xs text-[#c8bfb5]">{card.date}</span>
            </div>
            <p className="mt-1 text-xs text-[#aaa]">
              Reason:{" "}
              <span className="font-medium text-[#666]">{card.reason}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end justify-between self-stretch py-1">
            <span className="text-sm font-bold text-[#1a1a1a] md:text-base">
              {card.price}
            </span>
          </div>
        </div>

        {/* View dispute details button */}
        <button
          onClick={() =>
            setViewDisputeData({
              order: card,
              dispute: {
                id: card.disputeId,
                disputeStatus: card.status,
                reason: card.reason,
                details: card.details,
                adminNote: card.adminNote,
                createdAt: card.createdAt,
              },
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e8c4b0] bg-white px-4 py-2 text-sm font-semibold text-[#cb6f4d] transition-all hover:bg-[#fff7f4] hover:border-[#cb6f4d]"
        >
          <AlertTriangle size={13} />
          View Dispute Details
        </button>
      </div>
    );
  };

  // ── Category label helper ──────────────────────────────────────────────────
  const getCategoryLabel = (cat: Category) => {
    if (cat === "Disputes_Recieved") return "Disputes Received";
    if (cat === "Disputes_Raised") return "Disputes Raised";
    return cat;
  };

  const getCategorySubtitle = (cat: Category) => {
    if (cat === "Sold") return "Items you have sold";
    if (cat === "Bought") return "Items you have bought";
    if (cat === "Offers") return "Offers you've sent or received";
    if (cat === "Disputes_Recieved")
      return "Disputes filed against your orders";
    if (cat === "Disputes_Raised") return "Disputes you have filed";
    return "";
  };

  const getCategoryCount = (cat: Category) => {
    if (cat === "Sold") return soldCount;
    if (cat === "Bought") return boughtCount;
    if (cat === "Offers") return offersCount;
    if (cat === "Disputes_Recieved") return disputesReceivedCount;
    if (cat === "Disputes_Raised") return disputesRaisedCount;
    return 0;
  };

  // ── Render tabs based on active category ─────────────────────────────────────
  const renderStatusTabs = () => {
    if (activeCategory === "Offers") {
      return offerStatuses.map((status) => (
        <button
          key={status}
          onClick={() => setOfferStatus(status)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all capitalize
            ${
              offerStatus === status
                ? "border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-md shadow-[#cb6f4d]/25"
                : "border-[#e8e0d8] bg-[#fdfbf9] text-[#777] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
            }`}
        >
          {status}
        </button>
      ));
    }
    if (activeCategory === "Disputes_Raised") {
      return disputeStatuses.map((status) => (
        <button
          key={status}
          onClick={() => setDisputeRaisedStatus(status)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all
            ${
              disputeRaisedStatus === status
                ? "border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-md shadow-[#cb6f4d]/25"
                : "border-[#e8e0d8] bg-[#fdfbf9] text-[#777] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
            }`}
        >
          {status === "All"
            ? "All"
            : DISPUTE_STATUS_STYLES[status as DisputeStatus]?.label || status}
        </button>
      ));
    }
    if (activeCategory === "Disputes_Recieved") {
      return disputeStatuses.map((status) => (
        <button
          key={status}
          onClick={() => setDisputeReceivedStatus(status)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all
            ${
              disputeReceivedStatus === status
                ? "border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-md shadow-[#cb6f4d]/25"
                : "border-[#e8e0d8] bg-[#fdfbf9] text-[#777] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
            }`}
        >
          {status === "All"
            ? "All"
            : DISPUTE_STATUS_STYLES[status as DisputeStatus]?.label || status}
        </button>
      ));
    }
    // Sold / Bought
    return statuses.map((status) => (
      <button
        key={status}
        onClick={() => setActiveStatus(status)}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all
          ${
            activeStatus === status
              ? "border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-md shadow-[#cb6f4d]/25"
              : "border-[#e8e0d8] bg-[#fdfbf9] text-[#777] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
          }`}
      >
        {status !== "All" && activeStatus !== status && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[status as Exclude<Status, "All">].dot}`}
          />
        )}
        {status}
      </button>
    ));
  };

  // ── Render main list ─────────────────────────────────────────────────────────
  const renderList = () => {
    // Disputes Raised
    if (activeCategory === "Disputes_Raised") {
      if (filteredDisputesRaised.length === 0)
        return renderEmptyState(
          <Shield size={40} className="text-[#cb6f4d]" strokeWidth={1.2} />,
          "No disputes raised",
          "Disputes you file will appear here",
        );
      return (
        <div className="space-y-3">
          {filteredDisputesRaised.map((card) => renderDisputeCard(card, false))}
        </div>
      );
    }

    // Disputes Received
    if (activeCategory === "Disputes_Recieved") {
      if (filteredDisputesReceived.length === 0)
        return renderEmptyState(
          <AlertTriangle
            size={40}
            className="text-[#cb6f4d]"
            strokeWidth={1.2}
          />,
          "No disputes received",
          "Disputes filed against your orders will appear here",
        );
      return (
        <div className="space-y-3">
          {filteredDisputesReceived.map((card) =>
            renderDisputeCard(card, true),
          )}
        </div>
      );
    }

    // Offers
    if (activeCategory === "Offers") {
      if (filteredOffers.length === 0)
        return renderEmptyState(
          <DollarSign size={40} className="text-[#cb6f4d]" strokeWidth={1.2} />,
          "No offers yet",
          "Offers you send or receive will appear here",
        );
      return (
        <div className="space-y-3">
          {filteredOffers.map((offer) => {
            const isSeller = offer.role === "seller";
            const isPending = offer.status === "pending";
            const statusColor =
              offer.status === "accepted"
                ? "bg-[#edf7f0] text-[#2e7d4f] border-[#b8e0c8]"
                : offer.status === "declined"
                  ? "bg-[#fdf2f2] text-[#b33333] border-[#f0c8c8]"
                  : "bg-[#fff7f0] text-[#cb6f4d] border-[#f5d5c0]";
            return (
              <div
                key={offer.id}
                className="group flex flex-col gap-3 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-4 transition-all hover:border-[#e8c4b0] hover:bg-[#fff7f4] hover:shadow-[0_4px_16px_rgba(203,111,77,0.10)]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb] md:h-20 md:w-20">
                    {offer.productImage ? (
                      <img
                        src={`${API_BASE_URL}${offer.productImage}`}
                        alt={offer.productTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FileText size={22} className="text-[#d4c8be]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1a1a1a] md:text-[15px]">
                      {offer.productTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-[#bbb]">
                      {isSeller ? "From" : "To"}: @
                      {isSeller
                        ? offer.buyer?.username
                        : offer.seller?.username}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusColor}`}
                      >
                        {offer.status}
                      </span>
                      <span className="text-xs text-[#c8bfb5]">
                        {new Date(offer.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-xs text-[#aaa]">Offer</span>
                    <span className="text-base font-bold text-[#cb6f4d]">
                      {offer.offerPrice} TBH
                    </span>
                    <span className="text-xs text-[#bbb] line-through">
                      {offer.originalPrice} TBH
                    </span>
                  </div>
                </div>

                {offer.message && (
                  <div className="rounded-xl bg-[#f5f0eb] px-3 py-2 text-xs text-[#666] italic">
                    "{offer.message}"
                  </div>
                )}

                {isSeller && isPending && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToOffer(offer.id, "accepted")}
                      disabled={respondingTo === offer.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2e7d4f] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#256a42] disabled:opacity-50"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      onClick={() => handleRespondToOffer(offer.id, "declined")}
                      disabled={respondingTo === offer.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold text-[#555] transition-all hover:border-[#b33333] hover:text-[#b33333] disabled:opacity-50"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                )}

                {!isSeller && offer.status === "accepted" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-[#fff8f5] border border-[#f0ddd3] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#c0613a]" />
                        <span className="text-xs text-[#a04828] font-semibold">
                          {timeLeft[offer.id] === "Expired"
                            ? "Offer Expired"
                            : "Time remaining:"}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#c0613a]">
                        {timeLeft[offer.id] || "Calculating..."}
                      </span>
                    </div>
                    {timeLeft[offer.id] !== "Expired" && (
                      <button
                        onClick={() => handleBuyWithOffer(offer)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c0613a] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#a8502e]"
                      >
                        <ShoppingCart size={14} />
                        Buy Now with Offer Price
                      </button>
                    )}
                    {timeLeft[offer.id] === "Expired" && (
                      <div className="text-center py-2 text-xs text-[#888]">
                        This offer has expired. The product is now available
                        again.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Sold / Bought orders
    if (filteredOrders.length === 0)
      return renderEmptyState(
        <Package size={40} className="text-[#cb6f4d]" strokeWidth={1.2} />,
        "No orders yet",
        `When you ${activeCategory.toLowerCase()} something, it'll appear here`,
      );

    return (
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const ss = STATUS_STYLES[order.status as Exclude<Status, "All">];
          const isPlacedSold =
            order.status === "Placed" && activeCategory === "Sold";

          const hasDispute = orderHasDispute(order.id);
          const showDisputeBtn =
            activeCategory === "Bought" &&
            order.status === "Completed" &&
            isWithin48Hours(order.completedAt) &&
            !hasDispute;

          return (
            <div
              key={order.id}
              className="group flex flex-col gap-3 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-3 transition-all hover:border-[#e8c4b0] hover:bg-[#fff7f4] hover:shadow-[0_4px_16px_rgba(203,111,77,0.10)] md:p-4"
            >
              <div className="flex cursor-pointer items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb] md:h-20 md:w-20">
                  {order.imageUrl ? (
                    <img
                      src={order.imageUrl}
                      alt={order.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText size={22} className="text-[#d4c8be]" />
                    </div>
                  )}
                  {ss && (
                    <span
                      className={`absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${ss.dot}`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1a1a1a] md:text-[15px]">
                    {order.title}
                  </p>
                  {order.username && (
                    <p className="mt-0.5 text-xs text-[#bbb]">
                      @{order.username}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {ss && (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ss.pill}`}
                      >
                        {order.status}
                      </span>
                    )}
                    <span className="text-xs text-[#c8bfb5]">{order.date}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between self-stretch py-1">
                  <span className="text-sm font-bold text-[#1a1a1a] md:text-base">
                    {order.price}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f0eb] transition-all group-hover:bg-[#cb6f4d]">
                    <ChevronRight
                      size={13}
                      className="text-[#bbb] transition-colors group-hover:text-white"
                    />
                  </div>
                </div>
              </div>

              {isPlacedSold && (
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => handleConfirmOrder(order?.documentId)}
                    disabled={confirmingOrder === order.id}
                    className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-full bg-[#cb6f4d] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#cc8970] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    {confirmingOrder === order.id ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Confirm Order
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleRejectOrder(order?.documentId)}
                    disabled={rejectOrder === order.id}
                    className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#b33333] transition-all hover:border-[#b33333] hover:bg-[#fdf2f2] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    {rejectOrder === order.id ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        Reject Order
                      </>
                    )}
                  </button>
                </div>
              )}

              {showDisputeBtn && (
                <div className="mt-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#f0ebe4]" />
                    <span className="text-[10px] uppercase tracking-wider text-[#ccc] font-medium">
                      Issue with this order?
                    </span>
                    <div className="h-px flex-1 bg-[#f0ebe4]" />
                  </div>
                  <button
                    onClick={() => setDisputeOrder(order)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#cb6f4d] px-4 py-2.5 text-sm font-semibold text-[#cb6f4d] transition-all hover:bg-[#fff7f4] hover:shadow-[0_2px_12px_rgba(203,111,77,0.12)] active:scale-95"
                  >
                    <AlertTriangle size={14} />
                    File a Dispute
                  </button>
                </div>
              )}

              {/* Already has dispute badge */}
              {activeCategory === "Bought" &&
                order.status === "Completed" &&
                hasDispute && (
                  <div className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#fff7f0] border border-[#f5d5c0] px-4 py-2 text-xs font-semibold text-[#cb6f4d]">
                    <AlertTriangle size={12} />
                    Dispute already filed for this order
                  </div>
                )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmptyState = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
  ) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff0e8] to-[#fde0cc] border border-[#f5d5c0]">
          {icon}
        </div>
        <div className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-[#cb6f4d]/20" />
        <div className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-[#cb6f4d]/10" />
      </div>
      <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">
        {title}
      </h3>
      <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-[#bbb]">
        {subtitle}
      </p>
    </div>
  );

  // ── Header stats items ───────────────────────────────────────────────────────
  const headerStats = [
    { label: "Sold", count: soldCount, Icon: Tag },
    { label: "Bought", count: boughtCount, Icon: ShoppingBag },
    { label: "Offers", count: offersCount, Icon: DollarSign },
    {
      label: "Disputes",
      count: disputesRaisedCount + disputesReceivedCount,
      Icon: AlertTriangle,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Dispute file modal */}
      {disputeOrder && (
        <DisputeModal
          order={disputeOrder}
          onClose={() => setDisputeOrder(null)}
          onSubmit={handleDisputeSubmit}
        />
      )}

      {/* Dispute view/status modal */}
      {viewDisputeData && (
        <DisputeStatusModal
          order={viewDisputeData.order}
          dispute={viewDisputeData.dispute}
          onClose={() => setViewDisputeData(null)}
        />
      )}

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#cb6f4d] via-[#d4805e] to-[#b85a38]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-black/5" />

        <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <nav className="mb-4 flex items-center gap-1.5 text-[10px] sm:text-xs text-white/60">
            <span>Home</span>
            <ChevronRight size={10} />
            <span className="text-white/90">My Orders</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="font-serif text-[32px] font-normal leading-tight text-white sm:text-[40px] md:text-[48px]">
                My Orders
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-white/70">
                Track and manage your buying &amp; selling activity
              </p>
            </div>

            {/* ── Stats row — now includes Disputes ── */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 lg:mb-1">
              {headerStats.map(({ label, count, Icon }, index) => (
                <div
                  key={label}
                  className={`flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-3 backdrop-blur-sm border border-white/20 sm:rounded-2xl sm:px-4 sm:py-2.5 ${
                    index === 3 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <Icon size={14} className="text-white/80 shrink-0" />
                  <span className="text-xs sm:text-sm text-white/80 font-medium">
                    {label}
                  </span>
                  <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[10px] sm:text-xs font-black text-[#cb6f4d]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-60">
            {/* Mobile horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-all
                      ${
                        active
                          ? "border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-md shadow-[#cb6f4d]/30"
                          : "border-[#d4d4d4] bg-white text-[#555] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
                      }`}
                  >
                    <Icon size={14} />
                    {getCategoryLabel(cat)}
                  </button>
                );
              })}
            </div>

            {/* Desktop sidebar */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#ece9e4] bg-white shadow-[0_4px_24px_rgba(203,111,77,0.10)] lg:block">
              <div className="h-1 bg-gradient-to-r from-[#cb6f4d] to-[#e8956e]" />
              <div className="border-b border-[#f5f0eb] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#cb6f4d]">
                  Order Type
                </p>
              </div>
              <div className="divide-y divide-[#f5f0eb]">
                {categories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat];
                  const active = activeCategory === cat;
                  const count = getCategoryCount(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`group flex w-full items-center justify-between px-5 py-4 text-left transition-all
                        ${active ? "bg-[#fff7f4]" : "hover:bg-[#fdfbf9]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all
                          ${active ? "bg-[#cb6f4d] shadow-md shadow-[#cb6f4d]/30" : "bg-[#f5f0eb] group-hover:bg-[#fde8de]"}`}
                        >
                          <Icon
                            size={16}
                            className={active ? "text-white" : "text-[#cb6f4d]"}
                          />
                        </div>
                        <div className="text-left">
                          <span
                            className={`block text-sm font-semibold ${active ? "text-[#cb6f4d]" : "text-[#444] group-hover:text-[#cb6f4d]"}`}
                          >
                            {getCategoryLabel(cat)}
                          </span>
                          <span className="text-xs text-[#bbb]">
                            {count}{" "}
                            {cat === "Offers"
                              ? "offers"
                              : cat.startsWith("Disputes")
                                ? "disputes"
                                : "orders"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={15}
                        className={`transition-all ${active ? "text-[#cb6f4d]" : "text-transparent group-hover:text-[#ddb9a9]"}`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="m-4 rounded-xl bg-gradient-to-br from-[#fff7f4] to-[#fdeee8] p-4 border border-[#f5d5c0]">
                <p className="text-xs font-semibold text-[#cb6f4d]">
                  Need help?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#aaa]">
                  Contact support for any issues with your orders.
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-2xl border border-[#ece9e4] bg-white shadow-[0_4px_24px_rgba(203,111,77,0.06)]">
              <div className="h-1 bg-gradient-to-r from-[#cb6f4d] to-[#e8956e]" />

              {/* Header */}
              <div className="border-b border-[#f5f0eb] px-6 py-5 md:px-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#cb6f4d]">
                      Orders
                    </p>
                    <h2 className="font-serif text-[26px] font-normal text-[#1a1a1a] md:text-[30px]">
                      {getCategoryLabel(activeCategory)}
                    </h2>
                    <p className="mt-0.5 text-sm text-[#aaa]">
                      {getCategorySubtitle(activeCategory)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff0e8] to-[#fde0cc] border border-[#f5d5c0]">
                    {React.createElement(CATEGORY_ICONS[activeCategory], {
                      size: 22,
                      className: "text-[#cb6f4d]",
                    })}
                  </div>
                </div>
              </div>

              {/* Status tabs — rendered ONCE */}
              <div className="flex gap-2 overflow-x-auto border-b border-[#f5f0eb] px-6 py-4 no-scrollbar md:px-8">
                {renderStatusTabs()}
              </div>

              {/* List */}
              <div className="p-4 md:p-6">{renderList()}</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
