"use client";
import React, { JSX } from "react";
import { ChevronRight, CreditCard } from "lucide-react";

interface PaymentOptionProps {
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function Payments(): JSX.Element {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 bg-white text-[#111111]">
      
      {/* Payment Options Section */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 font-medium ml-1">Payment options</h3>
        <PaymentRow title="Add card" />
      </section>

      {/* Withdrawal Options Section */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 font-medium ml-1">Withdrawal options</h3>
        <div className="space-y-3">
          <PaymentRow title="Add bank account" />
          
          <PaymentRow 
            title="DAC7 centre" 
            icon={
              <div className="p-1.5 border border-gray-300 rounded bg-gray-50">
                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  );
}

/* Sub-component for individual payment/withdrawal rows */
function PaymentRow({ title, icon, onClick }: PaymentOptionProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group shadow-sm"
    >
      <div className="flex items-center gap-3">
        {icon && <div className="shrink-0">{icon}</div>}
        <span className="font-medium text-gray-900 text-[15px]">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
    </button>
  );
}