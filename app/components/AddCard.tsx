"use client";
import React, { JSX, useState } from "react";
import { X, Lock, CreditCard, Info } from "lucide-react";
import { API_BASE_URL } from "../constants/api";

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

export default function CardDetailsModal({ isOpen, onClose, onSave  }: CardDetailsModalProps): JSX.Element | null {
  const [cardName, setCardName] = useState<string>("Raja Abad");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

    const handleSaveCard = async () => {
    try {
      setLoading(true);

      const payload = {
        cardName,
        cardNumber,
        expiry,
        cvv,
      };

      // const res = await fetch(
      //   `${API_BASE_URL}/api/cards-payment`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(payload),
      //   }
      // );

      // if (!res.ok) {
      //   throw new Error("Failed");
      // }
      onSave(payload);

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mx-auto pl-6">Card details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Encryption Notice */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Card details</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm">Your card is securely encrypted</span>
              <Lock className="w-4 h-4" />
            </div>
            
            {/* Card Logos */}
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-gray-100 rounded border flex items-center justify-center">
                <div className="flex -space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-orange-500 opacity-80" />
                </div>
              </div>
              <div className="w-10 h-6 bg-gray-100 rounded border flex items-center justify-center text-[10px] font-bold text-blue-800 italic">
                VISA
              </div>
              <div className="w-10 h-6 bg-gray-100 rounded border flex items-center justify-center">
                <div className="flex -space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-blue-500 opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="border rounded-lg p-4 space-y-4">
            {/* Cardholder Name */}
            <div className="relative border-b pb-2">
              <label className="text-xs text-gray-400 block">Cardholder's name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full focus:outline-none text-gray-900 py-1"
              />
            </div>

            {/* Card Number */}
            <div className="relative border-b pb-2">
              <label className="text-xs text-gray-400 block">Card number</label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="e.g. 1234 1234 1234 1234"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full focus:outline-none text-gray-900 py-1"
                />
                <CreditCard className="w-5 h-5 text-gray-300" />
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="flex gap-8">
              <div className="flex-1 border-b pb-2">
                <label className="text-xs text-gray-400 block">Expiry date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full focus:outline-none text-gray-900 py-1"
                />
              </div>
              <div className="flex-1 border-b pb-2">
                <label className="text-xs text-gray-400 block">Security code</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. 123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full focus:outline-none text-gray-900 py-1"
                  />
                  <Info className="w-4 h-4 text-gray-300 ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
             <button
            onClick={handleSaveCard}
            disabled={loading}
            className="w-full bg-[#007782] text-white py-3"
          >
            {loading ? "Saving..." : "Use this card"}
          </button>
            <button 
              onClick={onClose}
              className="w-full text-[#007782] font-bold py-2 hover:underline text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
