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

interface PaymentsProps {
  userId: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Payments({ userId }: PaymentsProps): JSX.Element {
  const [openCardModal, setOpenCardModal] = useState(false);
  const [openBankAccountModal, setOpenBankAccountModal] = useState(false);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Unified User Schema Target Fetching Logic ───────────────────────────────

  useEffect(() => {
    const storedJwt = localStorage.getItem("jwt");
    
    fetch(`${API_BASE_URL}/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${storedJwt}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Could not pull payment elements portfolio");
        return r.json();
      })
      .then((data) => {
        if (data) {
          setSavedCards(Array.isArray(data.savedCards) ? data.savedCards : []);
          setSavedBanks(Array.isArray(data.savedBanks) ? data.savedBanks : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  // ── Modal State Switchers ───────────────────────────────────────────────────

  const openCard = () => {
    setOpenBankAccountModal(false);
    setOpenCardModal(true);
  };

  const openBank = () => {
    setOpenCardModal(false);
    setOpenBankAccountModal(true);
  };

  // ── Unified Database Sync Action Middleware ─────────────────────────────────

  const syncPaymentMethodsToStrapi = async (
    updatedCards: SavedCard[],
    updatedBanks: SavedBank[]
  ) => {
    const storedJwt = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedJwt}`,
      },
      body: JSON.stringify({
        savedCards: updatedCards,
        savedBanks: updatedBanks,
      }),
    });

    if (!res.ok) throw new Error("Synchronization to user record rejected");
    return res.json();
  };

  // ── Action Event Handlers ───────────────────────────────────────────────────

  const handleSaveCard = async (card: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  }) => {
    try {
      const cleanNewCard: SavedCard = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        cardName: card.cardName,
        cardNumber: card.cardNumber.replace(/\s/g, "").slice(-4),
        expiry: card.expiry,
      };

      const updatedCardsArray = [...savedCards, cleanNewCard];
      
      // Persist directly to user object state array structures
      await syncPaymentMethodsToStrapi(updatedCardsArray, savedBanks);
      
      setSavedCards(updatedCardsArray);
      setOpenCardModal(false);
    } catch (err) {
      console.error("Save process execution failed:", err);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const updatedCardsArray = savedCards.filter((c) => c.id !== id);
      await syncPaymentMethodsToStrapi(updatedCardsArray, savedBanks);
      setSavedCards(updatedCardsArray);
    } catch (err) {
      console.error("Deletion operation error context details:", err);
    }
  };

  const handleDeleteBank = async (id: string) => {
    try {
      const updatedBanksArray = savedBanks.filter((b) => b.id !== id);
      await syncPaymentMethodsToStrapi(savedCards, updatedBanksArray);
      setSavedBanks(updatedBanksArray);
    } catch (err) {
      console.error("Bank layout clearing mutation rejected:", err);
    }
  };

  // ── Render Tree ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-sm text-gray-500 bg-white">
        Loading secure wallet options…
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto p-4 space-y-8 bg-white text-[#111111]">
        {/* Payment Options */}
        <section className="space-y-2">
          <h3 className="text-xs text-gray-500 font-medium ml-1">
            Payment options
          </h3>

          {/* Saved cards array lookup layout block */}
          {savedCards.map((card) => (
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
            {/* Saved bank accounts array lookup layout block */}
            {savedBanks.map((bank) => (
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
          </div>
        </section>
      </div>

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