"use client";
import React, { JSX, useState, useEffect } from "react";
import {
  Mail,
  Smartphone,
  Ticket,
  Copy,
  Share2,
  CheckCircle,
  Clock,
  CircleDashed,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import Footer from "../components/Footer";
import { BACKEND_URL, NEXT_PUBLIC_SITE_URL } from "../../constants";
import { useAuth } from "@/context/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────

// Strapi users endpoint returns flat objects (no .attributes wrapper)
interface RefereeUser {
  id: number;
  username: string;
  email: string;
  // products relation populated with just id — we only need the count
  products: { id: number }[];
}

// Derived locally — not from a referral collection
interface ReferralEntry {
  id: number;
  username: string;
  email: string;
  status: "pending" | "listed" | "sold";
  productCount: number;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Referrals(): JSX.Element {
  const { user } = useAuth();

  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [referralCode, setReferralCode] = useState<string>("");
  const [rewardEarned, setRewardEarned] = useState<number>(0);
  const [showReferrals, setShowReferrals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const BASE_URL = NEXT_PUBLIC_SITE_URL;
  const API_URL = BACKEND_URL;

  const inviteLink = referralCode
    ? `${BASE_URL}/?ref=${referralCode}`
    : BASE_URL;

  const shareTitle = "Join me on Reluv!";
  const shareText =
    "Use my link to sign up, list items, and earn rewards on Reluv!";

  // ─── Fetch & derive referral data ─────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;

    const fetchReferralData = async () => {
      const token = localStorage.getItem("jwt");
      setLoading(true);

      try {
        // ── Step 1: Get current user's referralCode + referralRewardEarned ──
        // Using /api/users/me is fine here since we just need these two fields
        const meRes = await fetch(`${API_URL}/api/users/${user?.id}`, {
          headers: { "Content-Type": "application/json" },
        });
        const me = await meRes.json();
        setReferralCode(me.referralCode || "");
        setRewardEarned(me.referralRewardEarned || 0);

        // ── Step 2: Fetch all users referred by current user ──────────────
        // Populate products with just id so we can count them (products relation
        // is on User schema: oneToMany → api::product.product)
        const refereesRes = await fetch(
          `${API_URL}/api/users` +
            `?filters[referredBy][id][$eq]=${user.id}` +
            `&fields[0]=id&fields[1]=username&fields[2]=email` +
            `&populate[products][fields][0]=id`,
          { headers: { "Content-Type": "application/json" } },
        );
        const referees: RefereeUser[] = await refereesRes.json();

        if (!referees || referees.length === 0) {
          setReferrals([]);
          return;
        }

        // ── Step 3: Fetch delivered orders where seller is any of the referees
        // One single query using $in — no N+1
        // Orders where: status=delivered AND seller.id is one of our referee ids
        const refereeIds = referees?.map((r) => r?.id);
        const inParams = refereeIds
          .map((id, i) => `filters[seller][id][$in][${i}]=${id}`)
          .join("&");

        const ordersRes = await fetch(
          `${API_URL}/api/orders` +
            `?${inParams}` +
            `&filters[status][$eq]=delivered` +
            `&populate[seller][fields][0]=id` +
            `&fields[0]=id`,
          { headers: { "Content-Type": "application/json" } },
        );
        const ordersData = await ordersRes.json();
        const orders: {
          id: number;
          attributes: { seller: { data: { id: number } } };
        }[] = ordersData?.data || [];

        // Build a Set of referee ids who have at least one delivered order as seller
        const soldSellerIds = new Set<number>(
          orders.map((o) => o.attributes?.seller?.data?.id).filter(Boolean),
        );

        // ── Step 4: Derive status for each referee ────────────────────────
        // Priority: sold > listed > pending
        const derived: ReferralEntry[] = referees.map((referee) => {
          const productCount = referee.products?.length ?? 0;
          let status: "pending" | "listed" | "sold" = "pending";

          if (soldSellerIds.has(referee.id)) {
            status = "sold";
          } else if (productCount >= 3) {
            status = "listed";
          }

          return {
            id: referee.id,
            username: referee.username,
            email: referee.email,
            status,
            productCount,
          };
        });

        // Sort: sold first, then listed, then pending
        const statusOrder = { sold: 0, listed: 1, pending: 2 };
        derived.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

        setReferrals(derived);
      } catch (err) {
        console.error("Failed to fetch referral data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user?.id, API_URL]);

  // ─── Share handlers ───────────────────────────────────────────────────────

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: inviteLink,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`${shareText} ${inviteLink}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  const shareOnLINE = () => {
    const encoded = encodeURIComponent(inviteLink);
    const text = encodeURIComponent(shareText);
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encoded}&text=${text}`,
      "_blank",
    );
  };

 
  const shareViaEmail = (e?: React.MouseEvent) => {
  if (e) e.preventDefault(); // Prevent default anchor jumping behavior

  const subject = encodeURIComponent(shareTitle);
  const body = encodeURIComponent(`${shareText}\n\n${inviteLink}`);
  
  // Directly setting window.location.href works reliably on modern browsers
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

  // ─── Status helpers ───────────────────────────────────────────────────────

  const statusConfig = (status: ReferralEntry["status"]) => {
    switch (status) {
      case "sold":
        return {
          icon: (
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          ),
          label: "Made a sale",
          reward: "+15 €",
          color: "text-green-600",
          pill: "bg-green-50 text-green-600",
        };
      case "listed":
        return {
          icon: <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
          label: "Listed 3 items",
          reward: "+5 €",
          color: "text-amber-600",
          pill: "bg-amber-50 text-amber-600",
        };
      default:
        return {
          icon: (
            <CircleDashed className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          ),
          label: "Signed up — not listed yet",
          reward: "Pending",
          color: "text-gray-400",
          pill: "bg-gray-100 text-gray-500",
        };
    }
  };

  const pendingCount = referrals.filter((r) => r.status === "pending").length;
  const listedCount = referrals.filter((r) => r.status === "listed").length;
  const soldCount = referrals.filter((r) => r.status === "sold").length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="w-full bg-white font-sans text-[#111111]">
        {/* ── Hero ── */}
        <div className="relative h-[580px] md:h-[520px] w-full overflow-hidden">
          <img
            src="/referrals_updated_phones_2x.png"
            alt="Friends sharing on Reluv"
            className="w-full h-full object-cover"
          />

          {/* Invitation Card */}
          <div className="absolute top-1/2 left-4 md:left-20 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl w-[calc(100%-32px)] max-w-[370px] space-y-4">
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                Tell a friend—help them sell!
              </h1>
              <p className="text-gray-500 text-[13px] leading-relaxed mt-2">
                Get <span className="text-[#cb6f4d] font-semibold">5 €</span>{" "}
                when your friend lists 3 items within 7 days, and{" "}
                <span className="text-[#cb6f4d] font-semibold">10 €</span> more
                when they sell within 30 days.
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Subject to{" "}
                <a
                  href="#"
                  className="text-[#cb6f4d] underline underline-offset-2"
                >
                  terms
                </a>
                .
              </p>
            </div>

            {/* Invite link preview */}
            <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs text-gray-500 truncate select-all font-mono">
              {inviteLink}
            </div>

            {/* Share buttons: LINE + Email */}
            <div className="grid grid-cols-2 gap-2">
                {/* <button
                onClick={shareOnWhatsApp}
                className="flex flex-col items-center justify-center gap-1 border border-gray-200 rounded-lg py-2.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="6" fill="#06C755" />
                  <path
                    d="M19.5 10.9C19.5 7.96 16.6 5.57 13 5.57S6.5 7.96 6.5 10.9c0 2.63 2.33 4.84 5.48 5.26.21.05.5.14.57.33.07.17.04.43.02.6l-.09.55c-.03.17-.13.66.58.36.7-.3 3.8-2.24 5.19-3.83A4.7 4.7 0 0 0 19.5 10.9z"
                    fill="white"
                  />
                  <path
                    d="M17.04 12.4h-1.8a.13.13 0 0 1-.13-.13V9.44c0-.07.06-.13.13-.13h1.8c.07 0 .13.06.13.13v.45c0 .07-.06.13-.13.13h-1.22v.46h1.22c.07 0 .13.06.13.13v.45c0 .07-.06.13-.13.13h-1.22v.46h1.22c.07 0 .13.06.13.13v.45c0 .07-.06.13-.13.13zM9.1 12.4a.13.13 0 0 0 .13-.13v-.45a.13.13 0 0 0-.13-.13H7.88V9.44a.13.13 0 0 0-.13-.13h-.45a.13.13 0 0 0-.13.13v2.83c0 .07.06.13.13.13H9.1zm1.17-3.09h-.45a.13.13 0 0 0-.13.13v2.83c0 .07.06.13.13.13h.45c.07 0 .13-.06.13-.13V9.44a.13.13 0 0 0-.13-.13zm3.27 0h-.45a.13.13 0 0 0-.13.13v1.68l-1.29-1.74a.13.13 0 0 0-.1-.07h-.47a.13.13 0 0 0-.13.13v2.83c0 .07.06.13.13.13h.45c.07 0 .13-.06.13-.13v-1.68l1.3 1.75a.13.13 0 0 0 .1.06h.46c.07 0 .13-.06.13-.13V9.44a.13.13 0 0 0-.13-.13z"
                    fill="#06C755"
                  />
                </svg>
                Whats
              </button> */}
              {/* LINE */}
              <button
                onClick={shareOnLINE}
                className="flex flex-col items-center justify-center gap-1 border border-gray-200 rounded-lg py-2.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="6" fill="#06C755" />
                  <path
                    d="M19.5 10.9C19.5 7.96 16.6 5.57 13 5.57S6.5 7.96 6.5 10.9c0 2.63 2.33 4.84 5.48 5.26.21.05.5.14.57.33.07.17.04.43.02.6l-.09.55c-.03.17-.13.66.58.36.7-.3 3.8-2.24 5.19-3.83A4.7 4.7 0 0 0 19.5 10.9z"
                    fill="white"
                  />
                  <path
                    d="M17.04 12.4h-1.8a.13.13 0 0 1-.13-.13V9.44c0-.07.06-.13.13-.13h1.8c.07 0 .13.06.13.13v.45c0 .07-.06.13-.13.13h-1.22v.46h1.22c.07 0 .13.06.13.13v.45c0 .07-.06.13-.13.13h-1.22v.46h1.22c.07 0 .13.06.13.13v.45c0 .07-.06.13-.13.13zM9.1 12.4a.13.13 0 0 0 .13-.13v-.45a.13.13 0 0 0-.13-.13H7.88V9.44a.13.13 0 0 0-.13-.13h-.45a.13.13 0 0 0-.13.13v2.83c0 .07.06.13.13.13H9.1zm1.17-3.09h-.45a.13.13 0 0 0-.13.13v2.83c0 .07.06.13.13.13h.45c.07 0 .13-.06.13-.13V9.44a.13.13 0 0 0-.13-.13zm3.27 0h-.45a.13.13 0 0 0-.13.13v1.68l-1.29-1.74a.13.13 0 0 0-.1-.07h-.47a.13.13 0 0 0-.13.13v2.83c0 .07.06.13.13.13h.45c.07 0 .13-.06.13-.13v-1.68l1.3 1.75a.13.13 0 0 0 .1.06h.46c.07 0 .13-.06.13-.13V9.44a.13.13 0 0 0-.13-.13z"
                    fill="#06C755"
                  />
                </svg>
                LINE
              </button>

              {/* Email */}
              <a
               href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${inviteLink}`)}`}
                onClick={shareViaEmail}
                className="flex flex-col items-center justify-center gap-1 border border-gray-200 rounded-lg py-2.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-5 h-5 text-sky-500" />
                Email
              </a>
            </div>

            {/* Copy Link + Native Share */}
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={copyToClipboard}
                className="col-span-3 flex items-center justify-center gap-2 bg-[#cb6f4d] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#b55f3e] active:bg-[#9a5235] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={handleNativeShare}
                className="col-span-2 flex items-center justify-center gap-2 bg-[#005f68] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#004b52] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* ── Referrals Tracker ── */}
            {!loading && (
              <>
                <button
                  onClick={() => setShowReferrals(!showReferrals)}
                  className="w-full flex items-center justify-between pt-3 border-t border-gray-100"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>Your referrals</span>
                    {referrals.length > 0 && (
                      <span className="bg-[#f5e6df] text-[#cb6f4d] text-xs font-bold px-2 py-0.5 rounded-full">
                        {referrals.length}
                      </span>
                    )}
                    {rewardEarned > 0 && (
                      <span className="text-[#cb6f4d] text-xs font-medium">
                        · {rewardEarned} € earned
                      </span>
                    )}
                  </div>
                  {showReferrals ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {showReferrals && (
                  <div className="space-y-2">
                    {/* Summary pills */}
                    {referrals.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                        {pendingCount > 0 && (
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                            {pendingCount} pending
                          </span>
                        )}
                        {listedCount > 0 && (
                          <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                            {listedCount} listed
                          </span>
                        )}
                        {soldCount > 0 && (
                          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full">
                            {soldCount} sold
                          </span>
                        )}
                      </div>
                    )}

                    {/* Referral rows */}
                    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                      {referrals.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-3">
                          No referrals yet — share your link to get started!
                        </p>
                      ) : (
                        referrals.map((r) => {
                          const cfg = statusConfig(r.status);
                          const friend = r.username || r.email || "Friend";
                          return (
                            <div
                              key={r.id}
                              className="flex items-start justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs"
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                {cfg.icon}
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-800 truncate">
                                    {friend}
                                  </p>
                                  <p className="text-gray-400">
                                    {cfg.label}
                                    {/* Show product count progress for pending/listed */}
                                    {r.status !== "sold" && (
                                      <span className="ml-1 text-gray-300">
                                        · {r.productCount}/3 items
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`font-bold shrink-0 ${cfg.color}`}
                              >
                                {cfg.reward}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="pt-3 border-t border-gray-100 space-y-2 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-50 rounded" />
              </div>
            )}
          </div>
        </div>

        {/* ── How it Works ── */}
        <section className="max-w-6xl mx-auto py-16 px-4">
          <h2 className="text-center text-2xl font-bold mb-12">
            How referrals work
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-[#f0f9f9] rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-[#cb6f4d]" />
              </div>
              <h3 className="font-bold text-lg">Invite your friends</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                Copy your invite link and share it via LINE, email, or any app
                you use.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-[#f0f9f9] rounded-full flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-[#cb6f4d]" />
              </div>
              <h3 className="font-bold text-lg">Wait for friends to list</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                You'll receive a <strong>5 € voucher</strong> when your friend
                lists 3 items within 7 days, and <strong>10 € more</strong> when
                they make their first sale within 30 days.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-[#f0f9f9] rounded-full flex items-center justify-center">
                <Ticket className="w-10 h-10 text-[#cb6f4d]" />
              </div>
              <h3 className="font-bold text-lg">Spend vouchers on Reluv</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                Your voucher applies automatically to your next order of 15 € or
                more (excluding shipping and service fees).
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
