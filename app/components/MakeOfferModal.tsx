"use client";
import { useState } from "react";
import { X, Tag, Info } from "lucide-react";
import { API_BASE_URL } from "@/app/constants/api";

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productDocumentId: string;
  productTitle: string;
  originalPrice: number;
  currency: string;
  sellerId: number;
  buyerId: number;
  conversationId?: number;
}

const MIN_RATIO = 0.5;
const MAX_RATIO = 1.5;

export default function MakeOfferModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  originalPrice,
  currency,
  sellerId,
  buyerId,
  conversationId,
}: MakeOfferModalProps) {
  const [offerPrice, setOfferPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const minOffer = +(originalPrice * MIN_RATIO).toFixed(2);
  const maxOffer = +(originalPrice * MAX_RATIO).toFixed(2);
  const numericOffer = parseFloat(offerPrice);
  const isValid =
    !isNaN(numericOffer) && numericOffer >= minOffer && numericOffer <= maxOffer;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/api/offers/make`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId,
          buyerId,
          sellerId,
          offerPrice: numericOffer,
          message: message.trim() || null,
          conversationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "Failed to submit offer.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOfferPrice("");
    setMessage("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#fdf0ea] flex items-center justify-center">
              <Tag size={15} className="text-[#c0613a]" />
            </div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a] font-sans">
              Make an Offer
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#f5f2ee] flex items-center justify-center hover:bg-[#ede8e3] transition-colors"
          >
            <X size={15} className="text-[#555]" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-[15px] font-semibold text-[#1a1a1a] font-sans mb-1">
              Offer Sent!
            </p>
            <p className="text-[13px] text-[#888] font-sans">
              The seller will review your offer and respond shortly.
            </p>
            <button
              onClick={handleClose}
              className="mt-5 w-full py-3 rounded-full bg-[#c0613a] text-white text-[14px] font-semibold font-sans hover:bg-[#a8502e] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Product name */}
            <p className="text-[12px] text-[#888] font-sans mb-4 truncate">
              For:{" "}
              <span className="text-[#333] font-medium">{productTitle}</span>
            </p>

            {/* Original price reference */}
            <div className="flex items-center justify-between bg-[#faf8f5] rounded-2xl px-4 py-3 mb-4">
              <span className="text-[12px] text-[#888] font-sans">
                Listed price
              </span>
              <span className="text-[15px] font-bold text-[#1a1a1a] font-sans">
                {currency} {originalPrice.toFixed(2)}
              </span>
            </div>

            {/* Offer range hint */}
            <div className="flex items-start gap-2 bg-[#fff8f5] border border-[#f0ddd3] rounded-xl px-3 py-2.5 mb-4">
              <Info size={13} className="text-[#c0613a] mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[#a04828] font-sans leading-relaxed">
                Offer must be between{" "}
                <strong>
                  {currency} {minOffer}
                </strong>{" "}
                and{" "}
                <strong>
                  {currency} {maxOffer}
                </strong>
              </p>
            </div>

            {/* Offer input */}
            <div className="mb-3">
              <label className="block text-[12px] font-semibold text-[#555] font-sans mb-1.5">
                Your Offer ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#888] font-sans">
                  {currency}
                </span>
                <input
                  type="number"
                  min={minOffer}
                  max={maxOffer}
                  step="0.01"
                  value={offerPrice}
                  onChange={(e) => {
                    setOfferPrice(e.target.value);
                    setError(null);
                  }}
                  placeholder={`${minOffer} – ${maxOffer}`}
                  className="w-full pl-14 pr-4 py-3 rounded-xl border border-[#e0dbd5] text-[14px] font-semibold text-[#1a1a1a] font-sans focus:outline-none focus:border-[#c0613a] transition-colors"
                />
              </div>
              {offerPrice && !isNaN(numericOffer) && !isValid && (
                <p className="text-[11px] text-red-500 font-sans mt-1">
                  {numericOffer < minOffer
                    ? `Minimum offer is ${currency} ${minOffer}`
                    : `Maximum offer is ${currency} ${maxOffer}`}
                </p>
              )}
            </div>

            {/* Optional message */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-[#555] font-sans mb-1.5">
                Message to seller{" "}
                <span className="font-normal text-[#aaa]">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. I love this item! Would you consider this price?"
                className="w-full px-4 py-3 rounded-xl border border-[#e0dbd5] text-[13px] text-[#333] font-sans resize-none focus:outline-none focus:border-[#c0613a] transition-colors"
                maxLength={200}
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-500 font-sans mb-3 bg-red-50 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="w-full py-3.5 rounded-full bg-[#c0613a] text-white text-[14px] font-semibold font-sans hover:bg-[#a8502e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Send Offer"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
