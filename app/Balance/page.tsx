"use client";

import React, { useState } from 'react';
import { Info, Menu, X } from 'lucide-react';
import Footer from '../components/Footer';

type NavPath = 
  | 'my-balance/balance' 
  | 'my-balance/settings' 
  | 'payment-history/invoices' 
  | 'payment-history/income';

const Balance = () => {
  const [activePath, setActivePath] = useState<NavPath>('my-balance/balance');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activePath) {
      case 'my-balance/balance': return <BalanceCardView />;
      case 'my-balance/settings': return <SettingsView />;
      case 'payment-history/invoices': return <InvoicesView />;
      case 'payment-history/income': return <IncomeView />;
      default: return <BalanceCardView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f3f5]">
      
      <div className="flex flex-col md:flex-row flex-grow max-w-7xl w-full mx-auto p-4 md:p-10 font-sans text-slate-800">
        
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0 text-left">
          <h1 className="text-2xl font-bold mb-8">Balance</h1>
          <nav className="space-y-6">
            <NavGroup title="My Balance">
              <NavButton label="Balance" path="my-balance/balance" activePath={activePath} onClick={setActivePath} />
              <NavButton label="Settings" path="my-balance/settings" activePath={activePath} onClick={setActivePath} />
            </NavGroup>

            <NavGroup title="Payment history">
              <NavButton label="Invoices" path="payment-history/invoices" activePath={activePath} onClick={setActivePath} />
              <NavButton label="Income" path="payment-history/income" activePath={activePath} onClick={setActivePath} />
            </NavGroup>
          </nav>
        </aside>

        {/* Mobile Navigation - Horizontal Scroll */}
        <div className="md:hidden mb-6">
          <h1 className="text-xl font-bold mb-4">Balance</h1>
          <div className="flex overflow-x-auto pb-2 gap-4 no-scrollbar border-b border-slate-200">
             <MobileTab label="Balance" path="my-balance/balance" activePath={activePath} onClick={setActivePath} />
             <MobileTab label="Settings" path="my-balance/settings" activePath={activePath} onClick={setActivePath} />
             <MobileTab label="Invoices" path="payment-history/invoices" activePath={activePath} onClick={setActivePath} />
             <MobileTab label="Income" path="payment-history/income" activePath={activePath} onClick={setActivePath} />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-grow md:ml-12 text-left">
          {renderContent()}
        </main>
      </div>

      <Footer />
    </div>
  );
};

// --- Helpers ---

const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h3 className="text-[15px] font-semibold mb-3">{title}</h3>
    <div className="flex flex-col gap-3 pl-4">{children}</div>
  </div>
);

const NavButton = ({ label, path, activePath, onClick }: { 
  label: string, path: NavPath, activePath: NavPath, onClick: (p: NavPath) => void 
}) => (
  <button 
    onClick={() => onClick(path)}
    className={`text-left text-sm cursor-pointer transition-colors w-fit ${
      activePath === path ? 'font-bold text-black border-l-2 border-[#007b7b] pl-2 -ml-4' : 'text-slate-500 hover:text-slate-800'
    }`}
  >
    {label}
  </button>
);

const MobileTab = ({ label, path, activePath, onClick }: any) => (
  <button 
    onClick={() => onClick(path)}
    className={`whitespace-nowrap pb-2 text-sm transition-all ${
      activePath === path ? 'border-b-2 border-[#007b7b] font-bold text-black' : 'text-slate-500'
    }`}
  >
    {label}
  </button>
);

const BalanceCardView = () => (
  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
    <div className="p-4 border-b border-slate-100 text-xs text-slate-400">February 2026</div>
    <div className="p-6 flex justify-between items-center border-b border-slate-100">
      <span className="text-slate-500">Pending balance</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-400">€0.00</span>
        <Info size={16} className="text-slate-300 cursor-help" />
      </div>
    </div>
    <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">€0.00</h2>
        <p className="text-slate-400 text-sm">Available balance</p>
      </div>
      <button className="w-full sm:w-auto bg-[#007b7b] hover:bg-[#006666] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
        Activate Balance
      </button>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="space-y-6 text-left">
    <div className="bg-white rounded-sm border border-slate-200 p-5 md:p-8 shadow-sm">
      <h3 className="text-slate-400 text-sm mb-8">Personal details</h3>
      <div className="space-y-8 md:space-y-10">
        <FormInput label="First name" placeholder="e.g. Jane" />
        <FormInput label="Last name" placeholder="e.g. Doe" />
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
          <label className="md:w-1/3 font-semibold text-slate-800">Nationality</label>
          <select className="md:w-2/3 border-b border-slate-200 py-1 outline-none bg-transparent text-slate-400">
            <option>Select nationality</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
          <label className="md:w-1/3 font-semibold text-slate-800">Date of birth</label>
          <div className="md:w-2/3 flex gap-2 md:gap-4">
            <input type="text" placeholder="Day" className="w-full border-b border-slate-200 py-1 outline-none text-center" />
            <select className="w-full border-b border-slate-200 py-1 outline-none bg-transparent text-slate-300"><option>Month</option></select>
            <input type="text" placeholder="Year" className="w-full border-b border-slate-200 py-1 outline-none text-center" />
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-sm border border-slate-200 p-5 md:p-8 shadow-sm">
      <h3 className="text-slate-400 text-sm mb-4">Billing address</h3>
      <button className="flex items-center justify-between w-full text-left font-semibold text-slate-800 hover:text-teal-700 transition-colors">
        <span>Add billing address</span>
        <span className="text-2xl font-light text-slate-400">+</span>
      </button>
    </div>

    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 pt-4">
      <div className="text-[13px] text-slate-500 leading-relaxed max-w-2xl">
        Your Reluv Balance is managed by Mangopay SA... <a href="#" className="text-teal-600 underline">terms</a>.
        <p className="mt-4">For more information, visit our <a href="#" className="text-teal-600 underline">Help Center</a>.</p>
      </div>
      <button className="w-full lg:w-auto bg-[#007b7b] hover:bg-[#006666] text-white px-8 py-3 rounded-md font-bold text-sm">
        Activate Balance
      </button>
    </div>
  </div>
);

const FormInput = ({ label, placeholder }: any) => (
  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
    <label className="md:w-1/3 font-semibold text-slate-800">{label}</label>
    <input type="text" placeholder={placeholder} className="md:w-2/3 border-b border-slate-200 py-1 outline-none focus:border-teal-600 transition-colors placeholder:text-slate-300" />
  </div>
);

const InvoicesView = () => (
  <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-white rounded-sm border border-slate-200 shadow-sm text-center px-6">
    <div className="mb-8 opacity-90">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" className="rotate-12">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeDasharray="3 2" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    </div>
    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4">No invoices yet</h3>
    <p className="text-slate-500 text-sm md:text-[15px] max-w-xs leading-relaxed">Your invoices are generated daily. Please come back later.</p>
  </div>
);

const IncomeView = () => (
  <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-white rounded-sm border border-slate-200 shadow-sm text-center px-6">
    <div className="mb-8 opacity-80">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" className="-rotate-6">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    </div>
    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4">No income yet</h3>
    <p className="text-slate-500 text-sm md:text-[15px] max-w-xs leading-relaxed">When you receive payments for your sales, they’ll be listed here.</p>
  </div>
);

export default Balance;