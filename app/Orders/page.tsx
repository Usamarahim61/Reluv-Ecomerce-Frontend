"use client";

import React, { useState, useMemo } from 'react';
import { FileText, Package } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/navbar';

type Category = 'Sold' | 'Bought';
type Status = 'All' | 'In Progress' | 'Completed' | 'Cancelled';

interface Order {
  id: string;
  title: string;
  type: Category;
  status: Status;
  price: string;
}

const MOCK_DATA: Order[] = [
  { id: '1', title: 'Vintage Camera', type: 'Sold', status: 'Completed', price: '$120' },
  { id: '2', title: 'Vintage Camera', type: 'Sold', status: 'Completed', price: '$120' },
  { id: '3', title: 'Vintage Camera', type: 'Sold', status: 'Completed', price: '$120' },
  { id: '1', title: 'Mechanical Keyboard', type: 'Bought', status: 'Completed', price: '$85' },
  { id: '2', title: 'Mechanical Keyboard', type: 'Bought', status: 'Completed', price: '$85' },
  { id: '3', title: 'Mechanical Keyboard', type: 'Bought', status: 'Completed', price: '$85' },
  { id: '4', title: 'Mechanical Keyboard', type: 'Bought', status: 'Completed', price: '$85' },
];

export default function Orders() {
  const [activeCategory, setActiveCategory] = useState<Category>('Sold');
  const [activeStatus, setActiveStatus] = useState<Status>('In Progress');

  const categories: Category[] = ['Sold', 'Bought'];
  const statuses: Status[] = ['All', 'In Progress', 'Completed', 'Cancelled'];

  // Filter logic: Check both the Sidebar (Category) AND the Top Tabs (Status)
  const filteredOrders = useMemo(() => {
    return MOCK_DATA.filter((order) => {
      const matchesCategory = order.type === activeCategory;
      const matchesStatus = activeStatus === 'All' || order.status === activeStatus;
      return matchesCategory && matchesStatus;
    });
  }, [activeCategory, activeStatus]);

  return (
     <>
     <Navbar />
    <div className="flex max-w-7xl text-center m-auto min-h-[600px] bg-white p-10 font-sans">
      {/* Sidebar */}
      <aside className="w-44 flex-shrink-0 pt-2">
        <h2 className="text-xl font-bold mb-8 text-slate-900">My orders</h2>
        <nav className="flex flex-col gap-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-left text-[15px] font-medium transition-colors ${
                activeCategory === cat ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-8">
        <div className="rounded-xl border border-slate-200 shadow-sm min-h-[450px] flex flex-col">
          
          {/* Status Tabs (Persistent for both Sold/Bought) */}
          <header className="flex gap-3 p-4 border-b border-slate-100">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-5 py-2 rounded-full border text-[13px] font-medium transition-all ${
                  activeStatus === status
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                    : 'border-slate-300 text-slate-500 hover:border-slate-400'
                }`}
              >
                {status}
              </button>
            ))}
          </header>

          {/* Result Area */}
          <div className="flex-grow flex flex-col items-center justify-center p-8">
            {filteredOrders.length > 0 ? (
              <div className="w-full space-y-4">
                {filteredOrders.map(order => (
                  <div key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{order.title}</p>
                      <p className="text-xs text-slate-400">{order.status}</p>
                    </div>
                    <span className="font-bold text-emerald-600">{order.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* The Empty State from your image */
              <div className="text-center">
                <div className="mb-6 opacity-60 flex justify-center">
                  <FileText size={80} className="text-indigo-500 transform rotate-[10deg] stroke-[1.2]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No orders yet</h3>
                <p className="text-slate-400 text-sm">
                  When you {activeCategory.toLowerCase()} something, it’ll be listed here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
     <Footer />
    </>
  );
}