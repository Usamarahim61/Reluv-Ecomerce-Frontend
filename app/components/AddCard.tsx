"use client";
import React, { JSX, useState } from "react";
import { X, Lock, CreditCard, Info } from "lucide-react";

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  }) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCardNumber(value: string): string {
  // Strip non-digits, cap at 16
  const digits = value.replace(/\D/g, "").slice(0, 16);
  // Insert a space every 4 digits
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  if (digits.length === 2) return digits + "/";
  return digits;
}

function validateExpiry(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return "Enter a valid expiry (MM/YY)";
  const month = parseInt(match[1], 10);
  const year = parseInt("20" + match[2], 10);
  if (month < 1 || month > 12) return "Month must be between 01 and 12";
  const now = new Date();
  const expDate = new Date(year, month); // first day of next month = card valid until end of expiry month
  if (expDate <= now) return "This card has expired";
  return null;
}

function detectCardType(number: string): "mastercard" | "visa" | "amex" | null {
  const d = number.replace(/\s/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CardDetailsModal({
  isOpen,
  onClose,
  onSave,
}: CardDetailsModalProps): JSX.Element | null {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const cardType = detectCardType(cardNumber);
  const cvvMaxLength = cardType === "amex" ? 4 : 3;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!cardName.trim()) newErrors.cardName = "Cardholder name is required";

    const rawDigits = cardNumber.replace(/\s/g, "");
    if (rawDigits.length < 13 || rawDigits.length > 19)
      newErrors.cardNumber = "Enter a valid card number (13–19 digits)";

    const expiryError = validateExpiry(expiry);
    if (expiryError) newErrors.expiry = expiryError;

    if (cvv.length < 3)
      newErrors.cvv = `Security code must be ${cvvMaxLength} digits`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      onSave({ cardName, cardNumber, expiry, cvv });
      // Reset
      setCardName("");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setErrors({});
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mx-auto pl-6">
            Card details
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Subtitle + card logos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm">Your card is securely encrypted</span>
              <Lock className="w-4 h-4" />
            </div>

            <div className="flex gap-2 items-center">
              {/* Mastercard */}
              <div className="w-10 h-6 bg-gray-100 rounded border flex items-center justify-center">
                <div className="flex -space-x-1">
                  <div
                    className={`w-3 h-3 rounded-full ${cardType === "mastercard" ? "bg-red-500" : "bg-red-300"} transition-colors`}
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${cardType === "mastercard" ? "bg-orange-500" : "bg-orange-300"} transition-colors`}
                  />
                </div>
              </div>
              {/* Visa */}
              <div
                className={`w-10 h-6 rounded border flex items-center justify-center text-[10px] font-bold italic transition-colors ${cardType === "visa" ? "bg-blue-50 border-blue-300 text-blue-800" : "bg-gray-100 text-gray-400"}`}
              >
                VISA
              </div>
              {/* Amex */}
              <div
                className={`w-10 h-6 rounded border flex items-center justify-center text-[9px] font-bold transition-colors ${cardType === "amex" ? "bg-blue-100 border-blue-400 text-blue-700" : "bg-gray-100 text-gray-400"}`}
              >
                AMEX
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="border rounded-lg p-4 space-y-4">

            {/* Cardholder Name */}
            <div className="border-b pb-3">
              <label className="text-xs text-gray-400 block mb-1">
                Cardholder's name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => {
                  setCardName(e.target.value);
                  if (errors.cardName) setErrors((p) => ({ ...p, cardName: "" }));
                }}
                placeholder="Name as it appears on the card"
                className="w-full focus:outline-none text-gray-900 py-1 text-sm placeholder:text-gray-300"
              />
              {errors.cardName && (
                <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>
              )}
            </div>

            {/* Card Number */}
            <div className="border-b pb-3">
              <label className="text-xs text-gray-400 block mb-1">
                Card number
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(formatCardNumber(e.target.value));
                    if (errors.cardNumber)
                      setErrors((p) => ({ ...p, cardNumber: "" }));
                  }}
                  className="w-full focus:outline-none text-gray-900 py-1 text-sm placeholder:text-gray-300 tracking-wider"
                  maxLength={19} // 16 digits + 3 spaces
                />
                <CreditCard className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
              {errors.cardNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiry + CVV */}
            <div className="flex gap-6">
              <div className="flex-1 border-b pb-3">
                <label className="text-xs text-gray-400 block mb-1">
                  Expiry date
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => {
                    setExpiry(formatExpiry(e.target.value));
                    if (errors.expiry) setErrors((p) => ({ ...p, expiry: "" }));
                  }}
                  className="w-full focus:outline-none text-gray-900 py-1 text-sm placeholder:text-gray-300"
                  maxLength={5}
                />
                {errors.expiry && (
                  <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>
                )}
              </div>

              <div className="flex-1 border-b pb-3">
                <label className="text-xs text-gray-400 block mb-1">
                  Security code
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={cardType === "amex" ? "1234" : "123"}
                    value={cvv}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, cvvMaxLength);
                      setCvv(val);
                      if (errors.cvv) setErrors((p) => ({ ...p, cvv: "" }));
                    }}
                    className="w-full focus:outline-none text-gray-900 py-1 text-sm placeholder:text-gray-300 tracking-widest"
                    maxLength={cvvMaxLength}
                  />
                  <Info className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
                {errors.cvv && (
                  <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#cb6f4d] hover:bg-[#b5603f] disabled:opacity-60 text-white py-3 rounded font-bold transition-colors"
            >
              {loading ? "Saving..." : "Use this card"}
            </button>
            <button
              onClick={handleClose}
              className="w-full text-[#cb6f4d] font-bold py-2 hover:underline text-center text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}