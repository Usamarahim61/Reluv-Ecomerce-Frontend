"use client";
import React, { JSX, useState, useEffect } from "react";
import { toast } from "react-toastify";

import CardDetailsModal from "./AddCard";
import AddBankAccount, { BankAccountPayload } from "./AddBankAccount";
import { API_BASE_URL } from "../constants/api";
import { useAuth } from "@/context/AuthContext";
import { Trash2, CheckCircle2, Clock, ExternalLink, Landmark } from "lucide-react";

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
  const [stripeConnect, setStripeConnect] = useState<{
    connected: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    status: string;
    stripeAccountId: string | null;
    bankName: string | null;
    bankAccountLast4: string | null;
  } | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const [loading, setLoading] = useState(true);

  const fetchStripeConnectStatus = async (jwt: string | null) => {
    if (!jwt) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/stripe-connect/status`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.ok) {
        setStripeConnect({
          connected: Boolean(data.connected),
          payoutsEnabled: Boolean(data.payoutsEnabled),
          detailsSubmitted: Boolean(data.detailsSubmitted),
          status: data.status || "Not connected",
          stripeAccountId: data.stripeAccountId || null,
          bankName: data.bankName || null,
          bankAccountLast4: data.bankAccountLast4 || null,
        });
      }
    } catch {
      // Non-fatal: Stripe Connect card stays ready for setup
    }
  };

  // ── Fetch ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    const storedJwt = localStorage.getItem("jwt");
    Promise.all([
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
        }),
      fetchStripeConnectStatus(storedJwt),
    ])
      .catch((err) => {
        console.error("Failed to fetch payment methods:", err);
        toast.error("Could not load payment methods.");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleStripeConnectOnboard = async () => {
    const storedJwt = localStorage.getItem("jwt");
    if (!storedJwt) {
      toast.error("Please log in again to connect your Stripe payout account.");
      return;
    }
    setConnectingStripe(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${API_BASE_URL}/api/stripe-connect/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedJwt}`,
        },
        body: JSON.stringify({
          returnUrl: `${origin}/setting?tab=payments&stripe_connect=return`,
          refreshUrl: `${origin}/setting?tab=payments&stripe_connect=refresh`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.url) {
        throw new Error(json?.error?.message || json?.message || "Could not start Stripe Connect setup.");
      }
      window.location.href = json.url;
    } catch (err: any) {
      toast.error(err?.message || "Failed to connect Stripe payout account.");
      setConnectingStripe(false);
    }
  };

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
        <section className="space-y-3">
          <h3 className="text-xs text-gray-500 font-medium ml-1">Withdrawal options</h3>

          {/* Seller Stripe Connect Payout Setup */}
          <div className="w-full p-4 bg-[#faf8f5] border border-[#f0ddd3] rounded-lg shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#fff0e8] border border-[#f5d5c0] flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4 text-[#cb6f4d]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">
                      Stripe Connect Seller Payouts
                    </span>
                    {stripeConnect?.payoutsEnabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </span>
                    ) : stripeConnect?.stripeAccountId ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        <Clock className="w-3 h-3" />
                        {stripeConnect.status || "Verification Pending"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                        Not connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Connect your Stripe account to receive automated order payouts and dispute release transfers.
                  </p>
                  {stripeConnect?.stripeAccountId && (
                    <p className="text-[11px] text-gray-500 font-mono mt-1">
                      Account: {stripeConnect.stripeAccountId}
                      {stripeConnect.bankAccountLast4 ? ` • Bank •••• ${stripeConnect.bankAccountLast4}` : ""}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleStripeConnectOnboard}
                disabled={connectingStripe}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#cb6f4d] text-white text-xs font-semibold rounded-md hover:bg-[#b05e3f] transition-colors disabled:opacity-50 shrink-0"
              >
                <span>
                  {connectingStripe
                    ? "Redirecting..."
                    : stripeConnect?.payoutsEnabled
                    ? "Manage Stripe Account"
                    : stripeConnect?.stripeAccountId
                    ? "Complete Stripe Setup"
                    : "Connect Stripe Account"}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

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