"use client";
import { useState, useEffect } from "react";
import { X, Tag, Info, Loader2 } from "lucide-react";
import { editOfferViaSocket } from "@/services/messages-service";

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: number;
  currentOfferPrice: number;
  originalPrice: number;
  currency?: string;
  productTitle?: string;
  conversationId: number;
  onSuccess?: (updatedOffer: any) => void;
}

const MIN_RATIO = 0.5;
const MAX_RATIO = 1.5;

export default function EditOfferModal({
  isOpen,
  onClose,
  offerId,
  currentOfferPrice,
  originalPrice,
  currency = "THB",
  productTitle,
  conversationId,
  onSuccess,
}: EditOfferModalProps) {
  const [newPrice, setNewPrice] = useState(String(currentOfferPrice || ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewPrice(String(currentOfferPrice || ""));
      setError(null);
    }
  }, [isOpen, currentOfferPrice]);

  const minOffer = +(originalPrice * MIN_RATIO).toFixed(2);
  const maxOffer = +(originalPrice * MAX_RATIO).toFixed(2);
  const numericPrice = parseFloat(newPrice);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    setError(null);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price greater than zero.");
      return;
    }

    if (numericPrice === Number(currentOfferPrice)) {
      setError("New price must be different from the current offer price.");
      return;
    }

    if (numericPrice < minOffer) {
      setError(`Offer is too low. Minimum offer is ${currency} ${minOffer.toFixed(2)}.`);
      return;
    }

    if (numericPrice > maxOffer) {
      setError(`Offer is too high. Maximum offer is ${currency} ${maxOffer.toFixed(2)}.`);
      return;
    }

    setLoading(true);
    try {
      const updated = await editOfferViaSocket({
        offerId,
        offerPrice: numericPrice,
        conversationId,
      });
      onSuccess?.(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update offer price.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
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
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#fdf0ea] flex items-center justify-center">
              <Tag size={15} className="text-[#c0613a]" />
            </div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a] font-sans">
              Edit Your Offer
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#f5f2ee] flex items-center justify-center hover:bg-[#ede8e3] transition-colors"
          >
            <X size={15} className="text-[#555]" />
          </button>
        </div>

        {productTitle && (
          <p className="text-[12px] text-[#888] font-sans mb-3 truncate">
            For: <span className="text-[#333] font-medium">{productTitle}</span>
          </p>
        )}

        {/* Current Offer Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] border border-[#f0ece6] mb-4">
          <span className="text-xs text-[#777] font-sans">Current offer</span>
          <span className="text-sm font-bold text-[#1a1a1a] font-sans">
            {currency} {Number(currentOfferPrice || 0).toFixed(2)}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* New Price Input */}
          <div className="mb-3">
            <label className="block text-[12px] font-semibold text-[#444] font-sans mb-1.5">
              New offer price ({currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[14px] font-semibold text-[#888] font-sans select-none">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min={minOffer}
                max={maxOffer}
                value={newPrice}
                onChange={(e) => {
                  setNewPrice(e.target.value);
                  setError(null);
                }}
                placeholder={String(minOffer)}
                className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-[#e0ddd8] text-[15px] font-bold text-[#1a1a1a] font-sans focus:outline-none focus:border-[#c0613a] focus:ring-1 focus:ring-[#c0613a] transition-colors"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-[11px] text-[#999] font-sans">
                Min: {currency} {minOffer}
              </span>
              <span className="text-[11px] text-[#999] font-sans">
                Max: {currency} {maxOffer}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-[#f8f7f5] mb-4">
            <Info size={13} className="text-[#aaa] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#888] font-sans leading-tight">
              You can only edit this offer while it remains unseen and unresponded to by the recipient.
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans mb-4">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-full border border-[#ddd] text-[#555] text-[13px] font-semibold font-sans hover:bg-[#f5f2ee] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-[#c0613a] text-white text-[13px] font-semibold font-sans hover:bg-[#a8502e] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

