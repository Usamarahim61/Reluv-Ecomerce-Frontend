"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FileText, ChevronRight, Package, ShoppingBag, Tag, DollarSign, Check, X } from "lucide-react";
import Footer from "../components/Footer";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { useSearchParams } from "next/navigation";

type Category = "Sold" | "Bought" | "Offers";
type Status = "All" | "In Progress" | "Completed" | "Cancelled";
type OfferStatus = "All" | "pending" | "accepted" | "declined";

const STATUS_STYLES: Record<Exclude<Status, "All">, { pill: string; dot: string }> = {
  "In Progress": { pill: "bg-[#fff7f0] text-[#cb6f4d] border border-[#f5d5c0]", dot: "bg-[#cb6f4d]" },
  "Completed":   { pill: "bg-[#edf7f0] text-[#2e7d4f] border border-[#b8e0c8]",  dot: "bg-[#2e7d4f]"  },
  "Cancelled":   { pill: "bg-[#fdf2f2] text-[#b33333] border border-[#f0c8c8]",  dot: "bg-[#b33333]"  },
};

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  Sold:   Tag,
  Bought: ShoppingBag,
  Offers: DollarSign,
};

export default function Orders() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [ordersData,     setOrdersData]     = useState<any[]>([]);
  const [offersData,     setOffersData]     = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("Sold");
  const [activeStatus,   setActiveStatus]   = useState<Status>("All");
  const [offerStatus,    setOfferStatus]    = useState<OfferStatus>("All");
  const [respondingTo,   setRespondingTo]   = useState<number | null>(null);

  const categories: Category[] = ["Sold", "Bought", "Offers"];
  const statuses:   Status[]   = ["All", "In Progress", "Completed", "Cancelled"];
  const offerStatuses: OfferStatus[] = ["All", "pending", "accepted", "declined"];

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "offers") setActiveCategory("Offers");
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/fetch-orders-by-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: Number(user.id) }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setOrdersData(Array.isArray(data) ? data : data?.data || []);
      } catch { /* silent */ }
    };
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!user?.id) return;
      try {
        const [sellerRes, buyerRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/offers/seller/${user.id}`),
          fetch(`${API_BASE_URL}/api/offers/buyer/${user.id}`),
        ]);
        const sellerData = sellerRes.ok ? await sellerRes.json() : { data: [] };
        const buyerData = buyerRes.ok ? await buyerRes.json() : { data: [] };
        const allOffers = [
          ...(sellerData.data || []).map((o: any) => ({ ...o, role: "seller" })),
          ...(buyerData.data || []).map((o: any) => ({ ...o, role: "buyer" })),
        ];
        setOffersData(allOffers);
      } catch { /* silent */ }
    };
    fetchOffers();
  }, [user?.id]);

  const handleRespondToOffer = async (offerId: number, action: "accepted" | "declined") => {
    if (!user?.id) return;
    setRespondingTo(offerId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/offers/${offerId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sellerId: Number(user.id) }),
      });
      if (res.ok) {
        setOffersData((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, status: action } : o))
        );
      }
    } catch { /* silent */ } finally {
      setRespondingTo(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return ordersData
      .map((order) => {
        let mappedStatus: Status = "Cancelled";
        if (order.orderStatus === "In Progress" || order.orderStatus === "shipped") mappedStatus = "In Progress";
        else if (order.orderStatus === "delivered") mappedStatus = "Completed";
        else if (order.orderStatus === "cancelled") mappedStatus = "Cancelled";
        return {
          id:       order.id,
          title:    order.product?.title || "No title",
          type:     order.type,
          status:   mappedStatus,
          price:    `${order.totalAmount} €`,
          imageUrl: order.productImage || "",
          username: order.buyer?.username || "",
          date:     new Date(order.createdAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          }),
        };
      })
      .filter((o) => o.type === activeCategory && (activeStatus === "All" || o.status === activeStatus));
  }, [ordersData, activeCategory, activeStatus]);

  const soldCount   = useMemo(() => ordersData.filter((o) => o.type === "Sold").length,   [ordersData]);
  const boughtCount = useMemo(() => ordersData.filter((o) => o.type === "Bought").length, [ordersData]);
  const offersCount = useMemo(() => offersData.length, [offersData]);

  const filteredOffers = useMemo(() => {
    return offersData.filter(
      (o) => offerStatus === "All" || o.status === offerStatus
    );
  }, [offersData, offerStatus]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">

      {/* ── Hero header ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#cb6f4d] via-[#d4805e] to-[#b85a38]">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-black/5" />

        <div className="relative mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
          {/* breadcrumb */}
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-white/60">
            <span>Home</span>
            <ChevronRight size={10} />
            <span className="text-white/90">My Orders</span>
          </nav>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-[36px] font-normal leading-tight text-white md:text-[48px]">
                My Orders
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Track and manage your buying &amp; selling activity
              </p>
            </div>

            {/* stat pills */}
            <div className="flex gap-3">
              {([
                { label: "Sold",   count: soldCount,   Icon: Tag         },
                { label: "Bought", count: boughtCount, Icon: ShoppingBag },
                { label: "Offers", count: offersCount, Icon: DollarSign  },
              ] as const).map(({ label, count, Icon }) => (
                <div key={label} className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur-sm border border-white/20">
                  <Icon size={15} className="text-white/80" />
                  <span className="text-sm text-white/80">{label}</span>
                  <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#cb6f4d]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="w-full shrink-0 lg:w-60">

            {/* Mobile chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
              {categories.map((cat) => {
                const Icon   = CATEGORY_ICONS[cat];
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-all
                      ${active
                        ? "border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-md shadow-[#cb6f4d]/30"
                        : "border-[#d4d4d4] bg-white text-[#555] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"}`}
                  >
                    <Icon size={14} />
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Desktop card */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#ece9e4] bg-white shadow-[0_4px_24px_rgba(203,111,77,0.10)] lg:block">
              {/* orange top bar */}
              <div className="h-1 bg-gradient-to-r from-[#cb6f4d] to-[#e8956e]" />

              <div className="border-b border-[#f5f0eb] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#cb6f4d]">
                  Order Type
                </p>
              </div>

              <div className="divide-y divide-[#f5f0eb]">
                {categories.map((cat) => {
                  const Icon   = CATEGORY_ICONS[cat];
                  const active = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`group flex w-full items-center justify-between px-5 py-4 text-left transition-all
                        ${active ? "bg-[#fff7f4]" : "hover:bg-[#fdfbf9]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all
                          ${active
                            ? "bg-[#cb6f4d] shadow-md shadow-[#cb6f4d]/30"
                            : "bg-[#f5f0eb] group-hover:bg-[#fde8de]"}`}>
                          <Icon size={16} className={active ? "text-white" : "text-[#cb6f4d]"} />
                        </div>
                        <div className="text-left">
                          <span className={`block text-sm font-semibold ${active ? "text-[#cb6f4d]" : "text-[#444] group-hover:text-[#cb6f4d]"}`}>
                            {cat}
                          </span>
                          <span className="text-xs text-[#bbb]">
                            {cat === "Sold" ? soldCount : cat === "Bought" ? boughtCount : offersCount} {cat === "Offers" ? "offers" : "orders"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={15}
                        className={`transition-all ${active ? "text-[#cb6f4d]" : "text-transparent group-hover:text-[#ddb9a9]"}`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Help blurb */}
              <div className="m-4 rounded-xl bg-gradient-to-br from-[#fff7f4] to-[#fdeee8] p-4 border border-[#f5d5c0]">
                <p className="text-xs font-semibold text-[#cb6f4d]">Need help?</p>
                <p className="mt-1 text-xs leading-relaxed text-[#aaa]">
                  Contact support for any issues with your orders.
                </p>
              </div>
            </div>
          </aside>

          {/* ── Main content ────────────────────────────── */}
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-2xl border border-[#ece9e4] bg-white shadow-[0_4px_24px_rgba(203,111,77,0.06)]">

              {/* orange top bar */}
              <div className="h-1 bg-gradient-to-r from-[#cb6f4d] to-[#e8956e]" />

              {/* Content header */}
              <div className="border-b border-[#f5f0eb] px-6 py-5 md:px-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#cb6f4d]">
                      Orders
                    </p>
                    <h2 className="font-serif text-[26px] font-normal text-[#1a1a1a] md:text-[30px]">
                      {activeCategory}
                    </h2>
                    <p className="mt-0.5 text-sm text-[#aaa]">
                      {activeCategory === "Offers"
                        ? "Offers you've sent or received"
                        : `Items you have ${activeCategory === "Sold" ? "sold" : "bought"}`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff0e8] to-[#fde0cc] border border-[#f5d5c0]">
                    {React.createElement(CATEGORY_ICONS[activeCategory], {
                      size: 22,
                      className: "text-[#cb6f4d]",
                    })}
                  </div>
                </div>
              </div>

              {/* Status tabs */}
              <div className="flex gap-2 overflow-x-auto border-b border-[#f5f0eb] px-6 py-4 no-scrollbar md:px-8">
                {activeCategory === "Offers" ? (
                  offerStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setOfferStatus(status)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all capitalize
                        ${offerStatus === status
                          ? "border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-md shadow-[#cb6f4d]/25"
                          : "border-[#e8e0d8] bg-[#fdfbf9] text-[#777] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"}`}
                    >
                      {status}
                    </button>
                  ))
                ) : (
                  statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setActiveStatus(status)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all
                        ${activeStatus === status
                          ? "border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-md shadow-[#cb6f4d]/25"
                          : "border-[#e8e0d8] bg-[#fdfbf9] text-[#777] hover:border-[#cb6f4d] hover:text-[#cb6f4d]"}`}
                    >
                      {status !== "All" && activeStatus !== status && (
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[status as Exclude<Status, "All">].dot}`} />
                      )}
                      {status}
                    </button>
                  ))
                )}
              </div>

              {/* Order/Offer list */}
              <div className="p-4 md:p-6">
                {activeCategory === "Offers" ? (
                  filteredOffers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredOffers.map((offer) => {
                        const isSeller = offer.role === "seller";
                        const isPending = offer.status === "pending";
                        const statusColor =
                          offer.status === "accepted"
                            ? "bg-[#edf7f0] text-[#2e7d4f] border-[#b8e0c8]"
                            : offer.status === "declined"
                            ? "bg-[#fdf2f2] text-[#b33333] border-[#f0c8c8]"
                            : "bg-[#fff7f0] text-[#cb6f4d] border-[#f5d5c0]";
                        return (
                          <div
                            key={offer.id}
                            className="group flex flex-col gap-3 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-4 transition-all hover:border-[#e8c4b0] hover:bg-[#fff7f4] hover:shadow-[0_4px_16px_rgba(203,111,77,0.10)]"
                          >
                            <div className="flex items-center gap-4">
                              {/* Image */}
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb] md:h-20 md:w-20">
                                {offer.productImage ? (
                                  <img
                                    src={`${API_BASE_URL}${offer.productImage}`}
                                    alt={offer.productTitle}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <FileText size={22} className="text-[#d4c8be]" />
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-[#1a1a1a] md:text-[15px]">
                                  {offer.productTitle}
                                </p>
                                <p className="mt-0.5 text-xs text-[#bbb]">
                                  {isSeller ? "From" : "To"}: @{isSeller ? offer.buyer?.username : offer.seller?.username}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusColor}`}>
                                    {offer.status}
                                  </span>
                                  <span className="text-xs text-[#c8bfb5]">
                                    {new Date(offer.createdAt).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="flex shrink-0 flex-col items-end">
                                <span className="text-xs text-[#aaa]">Offer</span>
                                <span className="text-base font-bold text-[#cb6f4d]">
                                  {offer.offerPrice} €
                                </span>
                                <span className="text-xs text-[#bbb] line-through">
                                  {offer.originalPrice} €
                                </span>
                              </div>
                            </div>

                            {/* Message */}
                            {offer.message && (
                              <div className="rounded-xl bg-[#f5f0eb] px-3 py-2 text-xs text-[#666] italic">
                                "{offer.message}"
                              </div>
                            )}

                            {/* Seller actions */}
                            {isSeller && isPending && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRespondToOffer(offer.id, "accepted")}
                                  disabled={respondingTo === offer.id}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2e7d4f] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#256a42] disabled:opacity-50"
                                >
                                  <Check size={14} />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRespondToOffer(offer.id, "declined")}
                                  disabled={respondingTo === offer.id}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold text-[#555] transition-all hover:border-[#b33333] hover:text-[#b33333] disabled:opacity-50"
                                >
                                  <X size={14} />
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="relative mb-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff0e8] to-[#fde0cc] border border-[#f5d5c0]">
                          <DollarSign size={40} className="text-[#cb6f4d]" strokeWidth={1.2} />
                        </div>
                      </div>
                      <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">No offers yet</h3>
                      <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-[#bbb]">
                        Offers you send or receive will appear here
                      </p>
                    </div>
                  )
                ) : filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const ss = STATUS_STYLES[order.status as Exclude<Status, "All">];
                      return (
                        <div
                          key={order.id}
                          className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-[#f0ebe4] bg-[#fdfbf9] p-3 transition-all hover:border-[#e8c4b0] hover:bg-[#fff7f4] hover:shadow-[0_4px_16px_rgba(203,111,77,0.10)] md:p-4"
                        >
                          {/* Image */}
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ece9e4] bg-[#f5f0eb] md:h-20 md:w-20">
                            {order.imageUrl ? (
                              <img
                                src={order.imageUrl}
                                alt={order.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <FileText size={22} className="text-[#d4c8be]" />
                              </div>
                            )}
                            {/* status dot */}
                            {ss && (
                              <span className={`absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${ss.dot}`} />
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#1a1a1a] md:text-[15px]">
                              {order.title}
                            </p>
                            {order.username && (
                              <p className="mt-0.5 text-xs text-[#bbb]">@{order.username}</p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {ss && (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ss.pill}`}>
                                  {order.status}
                                </span>
                              )}
                              <span className="text-xs text-[#c8bfb5]">{order.date}</span>
                            </div>
                          </div>

                          {/* Price + arrow */}
                          <div className="flex shrink-0 flex-col items-end justify-between self-stretch py-1">
                            <span className="text-sm font-bold text-[#1a1a1a] md:text-base">
                              {order.price}
                            </span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f0eb] transition-all group-hover:bg-[#cb6f4d]">
                              <ChevronRight size={13} className="text-[#bbb] transition-colors group-hover:text-white" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative mb-6">
                      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff0e8] to-[#fde0cc] border border-[#f5d5c0]">
                        <Package size={40} className="text-[#cb6f4d]" strokeWidth={1.2} />
                      </div>
                      <div className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-[#cb6f4d]/20" />
                      <div className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-[#cb6f4d]/10" />
                    </div>
                    <h3 className="font-serif text-2xl font-normal text-[#1a1a1a]">No orders yet</h3>
                    <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-[#bbb]">
                      When you {activeCategory.toLowerCase()} something, it'll appear here
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
