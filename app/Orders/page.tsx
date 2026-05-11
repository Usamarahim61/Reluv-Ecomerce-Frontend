"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FileText, ChevronRight, Package, ShoppingBag, Tag } from "lucide-react";
import Footer from "../components/Footer";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "../constants/api";

type Category = "Sold" | "Bought";
type Status = "All" | "In Progress" | "Completed" | "Cancelled";

const STATUS_STYLES: Record<Exclude<Status, "All">, { pill: string; dot: string }> = {
  "In Progress": { pill: "bg-[#fff7f0] text-[#cb6f4d] border border-[#f5d5c0]", dot: "bg-[#cb6f4d]" },
  "Completed":   { pill: "bg-[#edf7f0] text-[#2e7d4f] border border-[#b8e0c8]",  dot: "bg-[#2e7d4f]"  },
  "Cancelled":   { pill: "bg-[#fdf2f2] text-[#b33333] border border-[#f0c8c8]",  dot: "bg-[#b33333]"  },
};

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  Sold:   Tag,
  Bought: ShoppingBag,
};

export default function Orders() {
  const { user } = useAuth();
  const [ordersData,     setOrdersData]     = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("Sold");
  const [activeStatus,   setActiveStatus]   = useState<Status>("All");

  const categories: Category[] = ["Sold", "Bought"];
  const statuses:   Status[]   = ["All", "In Progress", "Completed", "Cancelled"];

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
                            {cat === "Sold" ? soldCount : boughtCount} orders
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
                      Items you have {activeCategory === "Sold" ? "sold" : "bought"}
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
                {statuses.map((status) => (
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
                ))}
              </div>

              {/* Order list */}
              <div className="p-4 md:p-6">
                {filteredOrders.length > 0 ? (
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
