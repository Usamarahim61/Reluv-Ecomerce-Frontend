"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertTriangle,
  Check,
  X,
  Clock,
  Shield,
  ChevronDown,
} from "lucide-react";
import { API_BASE_URL } from "../constants/api";

// ── Types ─────────────────────────────────────────────────────────────────────
export type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED"
  | "CLOSED";

export interface DisputeCard {
  id: number;
  documentId?: string;
  disputeId: number;
  title: string;
  imageUrl: string;
  price: string;
  date: string;
  status: DisputeStatus;
  reason: string;
  details: string;
  adminNote: string;
  raisedBy?: { username?: string };
  createdAt: string;
  orderId?: number;
  orderDocumentId?: string;
}

// ── Status config ─────────────────────────────────────────────────────────────
export const DISPUTE_STATUS_STYLES: Record<
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

const STATUS_OPTIONS: { value: DisputeStatus; label: string; desc: string }[] =
  [
    {
      value: "OPEN",
      label: "Open",
      desc: "Dispute is awaiting initial response",
    },
    {
      value: "UNDER_REVIEW",
      label: "Under Review",
      desc: "You are actively reviewing this case",
    },
    {
      value: "RESOLVED",
      label: "Resolved",
      desc: "Dispute has been settled in buyer's favour",
    },
    {
      value: "REJECTED",
      label: "Rejected",
      desc: "Dispute claim was not upheld",
    },
    { value: "CLOSED", label: "Closed", desc: "Close this dispute" },
  ];

// ── Status Update Modal ───────────────────────────────────────────────────────
interface StatusUpdateModalProps {
  card: DisputeCard;
  onClose: () => void;
  onUpdated: (newStatus: DisputeStatus, adminNote: string) => void;
}

function StatusUpdateModal({
  card,
  onClose,
  onUpdated,
}: StatusUpdateModalProps) {
  const [selected, setSelected] = useState<DisputeStatus>(card.status);
  const [adminNote, setAdminNote] = useState(card.adminNote || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/disputes/${card.documentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: { status: selected, resolution: adminNote },
          }),
        },
      );
      if (res.ok) {
        setSaved(true);
        onUpdated(selected, adminNote);
      }
    } catch (err) {
      console.error("Failed to update dispute status:", err);
    } finally {
      setSaving(false);
    }
  };

  const currentStyle = DISPUTE_STATUS_STYLES[selected];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(20,10,5,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#3b5bdb] via-[#5c7cfa] to-[#748ffc]" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f0eb] text-[#888] transition-all hover:bg-[#fdf2f2] hover:text-[#b33333]"
        >
          <X size={15} />
        </button>

        <div className="px-6 pb-6 pt-5">
          {saved ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#edf7f0] to-[#d4f0e0] border border-[#b8e0c8]">
                <Check size={36} className="text-[#2e7d4f]" strokeWidth={2.5} />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">
                Status Updated
              </h3>
              <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-[#888]">
                The dispute status has been updated to{" "}
                <strong>{DISPUTE_STATUS_STYLES[selected].label}</strong>. The
                buyer will be notified.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-[#3b5bdb] px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2f4abf]"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] border border-[#c5d0fa]">
                  <Shield size={20} className="text-[#3b5bdb]" />
                </div>
                <div>
                  <h2 className="font-serif text-[22px] font-normal text-[#1a1a1a]">
                    Manage Dispute
                  </h2>
                  <p className="mt-0.5 text-xs text-[#aaa]">
                    Update status and add a response note
                  </p>
                </div>
              </div>

              {/* Order mini-card */}
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb]">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.title}
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
                    {card.title}
                  </p>
                  {card.raisedBy?.username && (
                    <p className="mt-0.5 text-xs text-[#bbb]">
                      Filed by @{card.raisedBy.username}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-[#bbb]">
                    Reason:{" "}
                    <span className="font-medium text-[#666]">
                      {card.reason}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#1a1a1a]">
                  {card.price}
                </span>
              </div>

              {/* Buyer's description */}
              {card.details && (
                <div className="mb-4 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
                    Buyer's Description
                  </p>
                  <p className="text-sm leading-relaxed text-[#555] italic">
                    "{card.details}"
                  </p>
                </div>
              )}

              {/* Status selector */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#888]">
                  Update Status <span className="text-[#b33333]">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const ss = DISPUTE_STATUS_STYLES[opt.value];
                    const isActive = selected === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSelected(opt.value)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all
                          ${
                            isActive
                              ? `${ss.pill} border-current`
                              : "border-[#ece9e4] bg-[#fdfbf9] text-[#555] hover:border-[#d4c8be]"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2 w-2 rounded-full ${isActive ? ss.dot : "bg-[#ddd]"}`}
                          />
                          <div>
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p
                              className={`text-[11px] ${isActive ? "opacity-70" : "text-[#aaa]"}`}
                            >
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <Check size={14} className="shrink-0 opacity-80" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin note */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#888]">
                  Response Note{" "}
                  <span className="text-[#bbb] normal-case font-normal">
                    (visible to buyer)
                  </span>
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Add a message for the buyer about this dispute…"
                  className="w-full resize-none rounded-2xl border border-[#ece9e4] bg-[#fdfbf9] px-4 py-3 text-sm text-[#333] placeholder:text-[#ccc] focus:border-[#3b5bdb] focus:outline-none focus:ring-2 focus:ring-[#3b5bdb]/15 transition-all"
                />
                <p className="mt-1 text-right text-[10px] text-[#ccc]">
                  {adminNote.length}/500
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center rounded-full border border-[#ddd] bg-white px-4 py-2.5 text-sm font-semibold text-[#555] transition-all hover:border-[#888] hover:text-[#333]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3b5bdb] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2f4abf] disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                >
                  {saving ? (
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
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Save Changes
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

// ── DisputeReceivedCard ───────────────────────────────────────────────────────
interface DisputeReceivedCardProps {
  card: DisputeCard;
  /** Called after a successful status update so the parent list can refresh */
  onStatusUpdated?: (
    disputeId: number,
    newStatus: DisputeStatus,
    adminNote: string,
  ) => void;
  /** Called when the user clicks "View Dispute Details" (same as before) */
  onViewDetails?: (card: DisputeCard) => void;
}

export function DisputeReceivedCard({
  card: initialCard,
  onStatusUpdated,
  onViewDetails,
}: DisputeReceivedCardProps) {
  const [card, setCard] = useState<DisputeCard>(initialCard);
  const [showManage, setShowManage] = useState(false);

  const ss = DISPUTE_STATUS_STYLES[card.status];

  const handleUpdated = (newStatus: DisputeStatus, adminNote: string) => {
    const updated = { ...card, status: newStatus, adminNote };
    setCard(updated);
    onStatusUpdated?.(card.disputeId, newStatus, adminNote);
  };

  return (
    <>
      {showManage && (
        <StatusUpdateModal
          card={card}
          onClose={() => setShowManage(false)}
          onUpdated={(status, note) => {
            handleUpdated(status, note);
            setShowManage(false);
          }}
        />
      )}

      <div className="group flex flex-col gap-3 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-3 transition-all hover:border-[#e8c4b0] hover:bg-[#fff7f4] hover:shadow-[0_4px_16px_rgba(203,111,77,0.10)] md:p-4">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
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

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1a1a1a] md:text-[15px]">
              {card.title}
            </p>
            {card.raisedBy?.username && (
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

          {/* Price */}
          <div className="flex shrink-0 flex-col items-end justify-between self-stretch py-1">
            <span className="text-sm font-bold text-[#1a1a1a] md:text-base">
              {card.price}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* View details — same behaviour as before */}
          <button
            onClick={() => onViewDetails?.(card)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e8c4b0] bg-white px-4 py-2 text-sm font-semibold text-[#cb6f4d] transition-all hover:bg-[#fff7f4] hover:border-[#cb6f4d]"
          >
            <AlertTriangle size={13} />
            View Details
          </button>

          {/* Manage status — seller only */}
          <button
            onClick={() => setShowManage(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#c5d0fa] bg-[#f0f4ff] px-4 py-2 text-sm font-semibold text-[#3b5bdb] transition-all hover:bg-[#e8edff] hover:border-[#3b5bdb]"
          >
            <Shield size={13} />
            Manage Dispute
            <ChevronDown size={12} className="opacity-60" />
          </button>
        </div>
      </div>
    </>
  );
}