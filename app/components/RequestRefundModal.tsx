"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  X,
  UploadCloud,
  FileText,
  ShieldCheck,
  Trash2,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { API_BASE_URL } from "../constants/api";
import { toast } from "react-toastify";

interface RequestRefundModalProps {
  order: any;
  onClose: () => void;
  onSubmit: (
    order: any,
    reason: string,
    details: string,
    evidenceUrl?: string,
  ) => Promise<void>;
}

export const REFUND_REASONS = [
  "Product not received",
  "Wrong product delivered",
  "Damaged product",
  "Product not as described",
  "Missing items",
  "Other cancellation / refund request",
];

export default function RequestRefundModal({
  order,
  onClose,
  onSubmit,
}: RequestRefundModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
      setErrorMsg("Please select a reason for the refund request.");
      return;
    }
    if (!details.trim()) {
      setErrorMsg("Please provide an explanation for the refund.");
      return;
    }
    if (details.trim().length < 10) {
      setErrorMsg("Please provide at least 10 characters in your explanation.");
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
      setSubmitted(true);
      toast.success("Your refund request has been submitted and is awaiting admin review.");
    } catch (err: any) {
      console.error("Refund request error:", err);
      setErrorMsg(err?.message || "Failed to submit refund request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const orderNum = order?.id || order?.orderId || "—";
  const productName = order?.title || order?.productTitle || order?.product?.title || "Product";
  const itemImage = order?.imageUrl || order?.productImage || "";
  const paymentAmount = order?.price || (order?.totalAmount ? `${order.totalAmount} THB` : "—");

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
        <div className="h-1.5 bg-gradient-to-r from-[#cb6f4d] via-[#e8956e] to-[#2e7d4f]" />

        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f0eb] text-[#888] transition-all hover:bg-[#fdf2f2] hover:text-[#b33333] disabled:opacity-50"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="px-6 pb-6 pt-5">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center animate-in fade-in zoom-in-95">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#edf7f0] to-[#d4f0e0] border border-[#b8e0c8]">
                <CheckCircle2 size={40} className="text-[#2e7d4f]" strokeWidth={2.2} />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">
                Refund Request Submitted
              </h3>
              <p className="mt-2.5 max-w-[320px] text-sm leading-relaxed text-[#666]">
                Your refund request has been submitted and is awaiting admin review.
              </p>
              <div className="mt-4 rounded-xl bg-[#f5f0eb] px-4 py-2 text-xs font-mono text-[#555]">
                Order #{orderNum} · Refund Amount: {paymentAmount}
              </div>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-[#cb6f4d] px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#b85a38] shadow-sm shadow-[#cb6f4d]/20"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff7f4] to-[#fdeee8] border border-[#f5d5c0]">
                  <RotateCcw size={20} className="text-[#cb6f4d]" />
                </div>
                <div>
                  <h2 className="font-serif text-[22px] font-normal text-[#1a1a1a]">
                    Request Refund
                  </h2>
                  <p className="mt-0.5 text-xs text-[#888]">
                    Submit a formal refund request for admin evaluation
                  </p>
                </div>
              </div>

              {/* Order & Amount Card */}
              <div className="mb-5 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-4">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#f0ebe4]">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888] block mb-0.5">
                      Order Number
                    </span>
                    <span className="font-mono text-xs font-bold text-[#cb6f4d]">
                      #{orderNum}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888] block mb-0.5">
                      Original Payment Amount
                    </span>
                    <span className="text-sm font-black text-[#1a1a1a]">
                      {paymentAmount}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb]">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FileText size={18} className="text-[#d4c8be]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa] block">
                      Product Name
                    </span>
                    <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                      {productName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refund Reason */}
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">
                  Refund Request Reason <span className="text-[#b33333]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#ece9e4] bg-[#fdfbf9] px-4 py-3 text-sm font-medium text-[#222] focus:border-[#cb6f4d] focus:outline-none focus:ring-2 focus:ring-[#cb6f4d]/15 transition-all"
                    required
                  >
                    <option value="">Select a reason for refund...</option>
                    {REFUND_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
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

              {/* Description */}
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">
                  Description / Explanation <span className="text-[#b33333]">*</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Explain why you are requesting a refund..."
                  className="w-full resize-none rounded-2xl border border-[#ece9e4] bg-[#fdfbf9] px-4 py-3 text-sm text-[#333] placeholder:text-[#ccc] focus:border-[#cb6f4d] focus:outline-none focus:ring-2 focus:ring-[#cb6f4d]/15 transition-all"
                  required
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#aaa]">
                  <span>Min. 10 characters</span>
                  <span>{details.length}/500</span>
                </div>
              </div>

              {/* Optional Supporting Evidence */}
              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">
                  Optional Supporting Evidence
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

              {/* Admin Review Notice */}
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#edf7f0] border border-[#b8e0c8] p-3 text-xs leading-relaxed text-[#2e7d4f]">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#2e7d4f]" />
                <div>
                  <p className="font-semibold">Admin Processing Policy</p>
                  <p className="mt-0.5 text-[11px] text-[#2e7d4f]/90">
                    The refund request must be reviewed and processed by the admin. Stripe refunds are issued automatically upon admin approval.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
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
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#cb6f4d] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#b85a38] disabled:cursor-not-allowed disabled:opacity-40 shadow-sm shadow-[#cb6f4d]/20"
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
                      <RotateCcw size={15} />
                      <span>Submit Refund Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

