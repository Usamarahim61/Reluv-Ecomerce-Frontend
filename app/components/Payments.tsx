"use client";
import React, { JSX, useState, useEffect } from "react";
import { toast } from "react-toastify";

import CardDetailsModal from "./AddCard";
import AddBankAccount, { BankAccountPayload } from "./AddBankAccount";
import { API_BASE_URL } from "../constants/api";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────
const MAX_CARDS = 2;
const MAX_BANKS = 2;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentOptionProps {
  title: string;
  buttonText: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
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
  iban: string; // full IBAN (no spaces)
}

interface PaymentsProps {
  userId: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Payments({ userId }: PaymentsProps): JSX.Element {
  const { user } = useAuth();

  const [openCardModal, setOpenCardModal] = useState(false);
  const [openBankAccountModal, setOpenBankAccountModal] = useState(false);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([]);

  const [loading, setLoading] = useState(true);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    const storedJwt = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/api/users/${user.id}`, {
      headers: { Authorization: `Bearer ${storedJwt}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Could not fetch payment methods");
        return r.json();
      })
      .then((data) => {
        setSavedCards(Array.isArray(data.savedCards) ? data.savedCards : []);
        setSavedBanks(Array.isArray(data.savedBanks) ? data.savedBanks : []);
      })
      .catch((err) => {
        console.error("Failed to fetch payment methods:", err);
        toast.error("Could not load payment methods.");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  // ── Modal helpers ───────────────────────────────────────────────────────────

  const openAddCard = () => {
    setOpenBankAccountModal(false);
    setOpenCardModal(true);
  };

  const openAddBank = () => {
    setOpenCardModal(false);
    setOpenBankAccountModal(true);
  };

  // ── Sync helper ─────────────────────────────────────────────────────────────

  const syncToStrapi = async (cards: SavedCard[], banks: SavedBank[]) => {
    const storedJwt = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/api/users/${user?.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedJwt}`,
      },
      body: JSON.stringify({ savedCards: cards, savedBanks: banks }),
    });
    if (!res.ok) throw new Error("Sync to user record failed");
    return res.json();
  };

  // ── Card handlers ────────────────────────────────────────────────────────────

  const handleSaveCard = async (card: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  }) => {
    const saveToastId = toast.loading("Saving changes…");
    try {
      const newCard: SavedCard = {
        id: crypto.randomUUID(),
        cardName: card.cardName,
        cardNumber: card.cardNumber.replace(/\s/g, "").slice(-4),
        expiry: card.expiry,
      };
      const updated = [...savedCards, newCard];

      await syncToStrapi(updated, savedBanks);
      setSavedCards(updated);
      setOpenCardModal(false);

      toast.update(saveToastId, {
        render: "Card added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (error) {
      console.error("Failed to save configuration profile updates", error);
      toast.update(saveToastId, {
        render: "Update failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDeleteCard = async (id: string) => {
    const deleteToastId = toast.loading("Removing card…");
    try {
      const updated = savedCards.filter((c) => c.id !== id);
      await syncToStrapi(updated, savedBanks);
      setSavedCards(updated);

      toast.update(deleteToastId, {
        render: "Card removed successfully.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (error) {
      console.error("Failed to save configuration profile updates", error);
      toast.update(deleteToastId, {
        render: "Update failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // ── Bank handlers ────────────────────────────────────────────────────────────

  const handleSaveBank = async (bank: BankAccountPayload) => {
    const saveToastId = toast.loading("Saving changes…");
    try {
      const newBank: SavedBank = {
        id: crypto.randomUUID(),
        accountHolder: bank.accountHolder,
        iban: bank.iban,
      };
      const updated = [...savedBanks, newBank];

      await syncToStrapi(savedCards, updated);
      setSavedBanks(updated);
      setOpenBankAccountModal(false);

      toast.update(saveToastId, {
        render: "Bank account added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (error) {
      console.error("Failed to save configuration profile updates", error);
      toast.update(saveToastId, {
        render: "Update failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDeleteBank = async (id: string) => {
    const deleteToastId = toast.loading("Removing bank account…");
    try {
      const updated = savedBanks.filter((b) => b.id !== id);
      await syncToStrapi(savedCards, updated);
      setSavedBanks(updated);

      toast.update(deleteToastId, {
        render: "Bank account removed successfully.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (error) {
      console.error("Failed to save configuration profile updates", error);
      toast.update(deleteToastId, {
        render: "Update failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#cb6f4d]" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto p-4 space-y-8 bg-white text-[#111111]">

        {/* Payment Options */}
        <section className="space-y-2">
          <h3 className="text-xs text-gray-500 font-medium ml-1">Payment options</h3>

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
                className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
              >
                 <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {savedCards.length < MAX_CARDS ? (
            <PaymentRow title="Card setup" buttonText="Add card" onClick={openAddCard} />
          ) : (
            <p className="text-xs text-gray-400 ml-1">
              Maximum of {MAX_CARDS} cards reached. Remove one to add another.
            </p>
          )}
        </section>

        {/* Withdrawal Options */}
        <section className="space-y-2">
          <h3 className="text-xs text-gray-500 font-medium ml-1">Withdrawal options</h3>

          <div className="space-y-3">
            {savedBanks.map((bank) => (
              <div
                key={bank.id}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 text-[15px]">
                    {bank.accountHolder}
                  </span>
                  <span className="text-xs text-gray-400 font-mono uppercase">
                    {bank.iban.slice(0, 6)}••••
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteBank(bank.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}

            {savedBanks.length < MAX_BANKS ? (
              <PaymentRow title="Bank Account setup" buttonText="Add bank account" onClick={openAddBank} />
            ) : (
              <p className="text-xs text-gray-400 ml-1">
                Maximum of {MAX_BANKS} bank accounts reached. Remove one to add another.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Card Modal */}
      <CardDetailsModal
        isOpen={openCardModal}
        onClose={() => setOpenCardModal(false)}
        onSave={handleSaveCard}
      />

      {/* Bank Modal */}
      <AddBankAccount
        isOpen={openBankAccountModal}
        onClose={() => setOpenBankAccountModal(false)}
        onSave={handleSaveBank}
      />
    </>
  );
}

function PaymentRow({ title, buttonText, icon, onClick, disabled }: PaymentOptionProps): JSX.Element {
  return (
    <div
      className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm disabled:opacity-40"
    >
      <div className="flex items-center gap-3">
        {icon && <div>{icon}</div>}
        <span className="font-medium text-gray-400 text-[15px] italic">{title}</span>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="px-4 py-2 bg-[#cb6f4d] text-white text-xs font-semibold rounded-md hover:bg-[#b05e3f] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonText}
      </button>
    </div>
  );
}