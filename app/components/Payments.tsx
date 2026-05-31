"use client";
import React, { JSX, useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

import CardDetailsModal from "./AddCard";
import AddBankAccount from "./AddBankAccount";
import { API_BASE_URL } from "../constants/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentOptionProps {
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface SavedCard {
  id: string;
  cardName: string;
  cardNumber: string; // last 4 digits
  expiry: string;
}

interface SavedBank {
  id: string;
  accountHolder: string;
  iban: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PaymentsProps {
  userId: string;
}

export default function Payments({ userId }: PaymentsProps): JSX.Element {
  const [openCardModal, setOpenCardModal] = useState(false);
  const [openBankAccountModal, setOpenBankAccountModal] = useState(false);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // ── Fetch on mount ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/${userId}/payment-methods`)
      .then((r) => r.json())
      .then((data: SavedCard[]) => setSavedCards(data))
      .catch(console.error)
      .finally(() => setLoadingCards(false));
  }, [userId]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/${userId}/bank-accounts`)
      .then((r) => r.json())
      .then((data: SavedBank[]) => setSavedBanks(data))
      .catch(console.error)
      .finally(() => setLoadingBanks(false));
  }, [userId]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openCard = () => {
    setOpenBankAccountModal(false);
    setOpenCardModal(true);
  };

  const openBank = () => {
    setOpenCardModal(false);
    setOpenBankAccountModal(true);
  };

  const handleSaveCard = async (card: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  }) => {
    try {
      const payload = {
        cardName: card.cardName,
        cardNumber: card.cardNumber.replace(/\s/g, "").slice(-4), // store last 4 only
        expiry: card.expiry,
      };

      const res = await fetch(
        `${API_BASE_URL}/api/users/${userId}/payment-methods`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save card");

      const saved: SavedCard = await res.json();
      setSavedCards((prev) => [...prev, saved]);
      setOpenCardModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/users/${userId}/payment-methods/${id}`, {
        method: "DELETE",
      });
      setSavedCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBank = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/users/${userId}/bank-accounts/${id}`, {
        method: "DELETE",
      });
      setSavedBanks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="max-w-2xl mx-auto p-4 space-y-8 bg-white text-[#111111]">

        {/* Payment Options */}
        <section className="space-y-2">
          <h3 className="text-xs text-gray-500 font-medium ml-1">
            Payment options
          </h3>

          {/* Saved cards */}
          {!loadingCards && savedCards.map((card) => (
            <div
              key={card.id}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900 text-[15px]">
                  {card.cardName} •••• {card.cardNumber}
                </span>
                <span className="text-xs text-gray-400">{card.expiry}</span>
              </div>
              <button
                onClick={() => handleDeleteCard(card.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}

          <PaymentRow title="Add card" onClick={openCard} />
        </section>

        {/* Withdrawal Options */}
        <section className="space-y-2">
          <h3 className="text-xs text-gray-500 font-medium ml-1">
            Withdrawal options
          </h3>

          <div className="space-y-3">

            {/* Saved bank accounts */}
            {!loadingBanks && savedBanks.map((bank) => (
              <div
                key={bank.id}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 text-[15px]">
                    {bank.accountHolder}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">
                    {bank.iban.slice(0, 6)}••••
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteBank(bank.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}

            <PaymentRow title="Add bank account" onClick={openBank} />

            <PaymentRow
              title="DAC7 centre"
              icon={
                <div className="p-1.5 border border-gray-300 rounded bg-gray-50">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <line x1="7" y1="8" x2="17" y2="8" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                    <line x1="7" y1="16" x2="12" y2="16" />
                  </svg>
                </div>
              }
            />
          </div>
        </section>
      </div>

      {/* ===== Modals — your originals, untouched ===== */}

      <CardDetailsModal
        isOpen={openCardModal}
        onClose={() => setOpenCardModal(false)}
        onSave={handleSaveCard}
      />

      <AddBankAccount
        isOpen={openBankAccountModal}
        onClose={() => setOpenBankAccountModal(false)}
      />
    </>
  );
}

/* Row — original, untouched */
function PaymentRow({ title, icon, onClick }: PaymentOptionProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group shadow-sm"
    >
      <div className="flex items-center gap-3">
        {icon && <div>{icon}</div>}
        <span className="font-medium text-gray-900 text-[15px]">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
    </button>
  );
}