"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  X,
  UploadCloud,
  FileText,
  Check,
  Shield,
  Trash2,
} from "lucide-react";
import { API_BASE_URL } from "../constants/api";
import { toast } from "react-toastify";

interface RaiseDisputeModalProps {
  order: any;
  onClose: () => void;
  onSubmit: (
    order: any,
    reason: string,
    details: string,
    evidenceUrl?: string,
  ) => Promise<void>;
}

export const DISPUTE_REASONS = [
  { value: "PRODUCT_NOT_RECEIVED", label: "Product not received" },
  { value: "WRONG_ITEM", label: "Wrong product delivered" },
  { value: "DAMAGED_PRODUCT", label: "Damaged product" },
  { value: "NOT_AS_DESCRIBED", label: "Product not as described" },
  { value: "MISSING_ITEMS", label: "Missing items" },
  { value: "OTHER", label: "Other" },
];

export default function RaiseDisputeModal({
  order,
  onClose,
  onSubmit,
}: RaiseDisputeModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setFile(selected);
    if (selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMsg("Please select a reason for the dispute.");
      return;
    }
    if (!details.trim()) {
      setErrorMsg("Please provide additional details describing the issue.");
      return;
    }
    if (details.trim().length < 10) {
      setErrorMsg("Please provide at least 10 characters in your description.");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      let evidenceUrl = "";
      if (file) {
        const formData = new FormData();
        formData.append("files", file);
        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt") || ""}`,
          },
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (Array.isArray(uploadData) && uploadData[0]?.url) {
            evidenceUrl = uploadData[0].url.startsWith("http")
              ? uploadData[0].url
              : `${API_BASE_URL}${uploadData[0].url}`;
          }
        }
      }

      await onSubmit(order, selectedReason, details.trim(), evidenceUrl);
      onClose();
    } catch (err: any) {
      console.error("Dispute submission error:", err);
      setErrorMsg(err?.message || "Failed to submit dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const orderNum = order?.id || order?.orderId || "—";
  const itemTitle = order?.title || order?.productTitle || order?.product?.title || "Product";
  const itemImage = order?.imageUrl || order?.productImage || "";
  const priceDisplay = order?.price || (order?.totalAmount ? `${order.totalAmount} THB` : "—");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(20,10,5,0.6)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-[0_24px_64px_rgba(203,111,77,0.22)] overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="h-1.5 bg-gradient-to-r from-[#b33333] via-[#cb6f4d] to-[#e8956e]" />
        
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f0eb] text-[#888] transition-all hover:bg-[#fdf2f2] hover:text-[#b33333] disabled:opacity-50"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5">
          {/* Header */}
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fdf2f2] to-[#fde8e8] border border-[#f0c8c8]">
              <AlertTriangle size={20} className="text-[#b33333]" />
            </div>
            <div>
              <h2 className="font-serif text-[22px] font-normal text-[#1a1a1a]">
                Raise Dispute
              </h2>
              <p className="mt-0.5 text-xs text-[#888]">
                Open a case for review by Reluv Support
              </p>
            </div>
          </div>

          {/* Order Summary & Number */}
          <div className="mb-5 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-3.5">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#f0ebe4]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888]">
                Order Number
              </span>
              <span className="rounded-md bg-[#cb6f4d]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#cb6f4d]">
                #{orderNum}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb]">
                {itemImage ? (
                  <img
                    src={itemImage}
                    alt={itemTitle}
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
                  {itemTitle}
                </p>
                <p className="mt-0.5 text-xs text-[#aaa]">
                  Paid: <span className="font-semibold text-[#555]">{priceDisplay}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Reason Dropdown */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">
              Reason for dispute <span className="text-[#b33333]">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#ece9e4] bg-[#fdfbf9] px-4 py-3 text-sm font-medium text-[#222] focus:border-[#cb6f4d] focus:outline-none focus:ring-2 focus:ring-[#cb6f4d]/15 transition-all"
                required
              >
                <option value="">Select a reason...</option>
                {DISPUTE_REASONS.map((r) => (
                  <option key={r.value} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">
              Description <span className="text-[#b33333]">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Describe what went wrong with your order in detail..."
              className="w-full resize-none rounded-2xl border border-[#ece9e4] bg-[#fdfbf9] px-4 py-3 text-sm text-[#333] placeholder:text-[#ccc] focus:border-[#cb6f4d] focus:outline-none focus:ring-2 focus:ring-[#cb6f4d]/15 transition-all"
              required
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-[#aaa]">
              <span>Min. 10 characters</span>
              <span>{details.length}/500</span>
            </div>
          </div>

          {/* Optional Evidence File Upload */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">
              Supporting Evidence <span className="text-[#888] font-normal lowercase">(optional)</span>
            </label>

            {!file ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e4ded6] bg-[#fdfbf9] px-4 py-4 text-center transition-all hover:border-[#cb6f4d] hover:bg-[#fff9f6]">
                <UploadCloud size={24} className="mb-1.5 text-[#cb6f4d]" />
                <span className="text-xs font-semibold text-[#555]">
                  Click or drag photo/receipt to attach
                </span>
                <span className="mt-0.5 text-[10px] text-[#aaa]">
                  PNG, JPG, WEBP, or PDF up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-[#e4ded6] bg-[#fdfbf9] p-3">
                <div className="flex items-center gap-3 min-w-0">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="h-10 w-10 shrink-0 rounded-lg object-cover border border-[#ddd]"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eee] text-[#888]">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#333]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[#aaa]">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Protection Notice */}
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#f0f4ff] border border-[#c5d0fa] p-3 text-xs leading-relaxed text-[#3b5bdb]">
            <Shield size={16} className="mt-0.5 shrink-0 text-[#3b5bdb]" />
            <div>
              <p className="font-semibold">Buyer Protection Policy</p>
              <p className="mt-0.5 text-[11px] text-[#5b73dc]">
                Disputes are reviewed by our dispute team within 24–48 hours. Funds remain held securely in escrow until resolution.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-full border border-[#ddd] bg-white px-4 py-2.5 text-sm font-semibold text-[#555] transition-all hover:border-[#888] hover:text-[#333] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedReason || !details.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#b33333] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#9a2a2a] disabled:cursor-not-allowed disabled:opacity-40 shadow-sm shadow-[#b33333]/20"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={15} />
                  <span>Submit Dispute</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

