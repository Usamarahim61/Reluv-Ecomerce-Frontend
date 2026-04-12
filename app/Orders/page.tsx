"use client";

import React, { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import Footer from "../components/Footer";


type Category = "Sold" | "Bought";
type Status = "All" | "In Progress" | "Completed" | "Cancelled";

type Order = {
  id: string;
  title: string;
  type: "Sold" | "Bought";
  status: string;
  price: string;
  imageUrl: string;
  username: string;
  date: string;
};

const MOCK_DATA: Order[] = [
  {
    id: "s1",
    title: "Vintage Canon AE-1 Camera",
    type: "Sold",
    status: "Vendido",
    price: "120,00 €",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150",
    username: "marcos_retro",
    date: "Ayer"
  },
  {
    id: "b1",
    title: "Mechanical Keyboard Custom RGB",
    type: "Bought",
    status: "Entregado",
    price: "85,00 €",
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150",
    username: "tech_store_es",
    date: "Hoy"
  },
];

export default function Orders() {
  const [activeCategory, setActiveCategory] = useState<Category>("Sold");
  const [activeStatus, setActiveStatus] = useState<Status>("In Progress");

  const categories: Category[] = ["Sold", "Bought"];
  const statuses: Status[] = ["All", "In Progress", "Completed", "Cancelled"];

  const filteredOrders = useMemo(() => {
    return MOCK_DATA.filter((order) => {
      const matchesCategory = order.type === activeCategory;
      const matchesStatus = activeStatus === "All" || order.status === activeStatus;
      return matchesCategory && matchesStatus;
    });
  }, [activeCategory, activeStatus]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* < /> */}
      
      {/* Main Container: 
          - flex-col on mobile, flex-row on md+ 
          - Reduced padding on mobile (p-4 vs p-10)
      */}
      <div className="flex flex-col md:flex-row max-w-7xl w-full m-auto flex-grow bg-white p-4 md:p-10 font-sans gap-6 md:gap-0">
        
        {/* Sidebar: Becomes a horizontal nav or simple header on mobile */}
        <aside className="w-full md:w-44 flex-shrink-0 pt-2">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-8 text-slate-900 text-start">
            My orders
          </h2>
          <nav className="flex md:flex-col gap-6 border-b md:border-b-0 pb-4 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-left text-[15px] font-medium transition-colors cursor-pointer relative ${
                  activeCategory === cat
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-[#007782]"
                }`}
              >
                {cat}
                {/* Mobile underline indicator */}
                {activeCategory === cat && (
                  <span className="absolute -bottom-[17px] left-0 w-full h-0.5 bg-slate-900 md:hidden" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow md:ml-8 w-full">
          <div className="rounded-xl border border-slate-200 shadow-sm min-h-[450px] flex flex-col overflow-hidden">
            
            {/* Status Tabs: 
                - Added overflow-x-auto so it scrolls on small screens instead of squishing buttons 
            */}
            <header className="flex gap-3 p-4 border-b border-slate-100 overflow-x-auto no-scrollbar whitespace-nowrap">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`px-5 py-2 rounded-full border text-[13px] font-medium transition-all flex-shrink-0 ${
                    activeStatus === status
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50/50"
                      : "border-slate-300 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  {status}
                </button>
              ))}
            </header>

            {/* Result Area */}
            <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
              {filteredOrders.length > 0 ? (
                <div className="w-full bg-white">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start md:items-center gap-4 py-4 md:p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Item Image */}
                      <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                        {order.imageUrl ? (
                          <img
                            src={order.imageUrl}
                            alt={order.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300">
                             <FileText size={24} />
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-[14px] md:text-[15px] font-medium text-gray-900 line-clamp-2 md:truncate">
                          {order.title}
                        </h4>
                        <div className="flex flex-col mt-1">
                          <span className="text-[12px] md:text-[13px] text-emerald-600 font-medium">
                            {order.status}
                          </span>
                          <span className="text-[12px] md:text-[13px] text-gray-400">
                            {order.date}
                          </span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex flex-col items-end justify-between self-stretch py-1">
                        <span className="text-[14px] md:text-[15px] font-bold text-gray-900">
                          {order.price}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-10">
                  <div className="mb-6 opacity-60 flex justify-center">
                    <FileText
                      size={60}
                      className="text-indigo-500 transform rotate-[10deg] stroke-[1.2] md:w-20 md:h-20"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">
                    No orders yet
                  </h3>
                  <p className="text-slate-400 text-sm max-w-[250px] m-auto">
                    When you {activeCategory.toLowerCase()} something, it’ll be listed here
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}