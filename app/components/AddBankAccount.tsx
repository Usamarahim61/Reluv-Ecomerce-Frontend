"use client";
import React, { JSX, useState } from "react";
import { ChevronRight, Info } from "lucide-react";

export default function AddBankAccount(): JSX.Element {
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [iban, setIban] = useState<string>("");

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 bg-gray-50 min-h-screen">
      
      {/* Account Details Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
          <h3 className="text-sm text-gray-500 font-medium">Account details</h3>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Account Holder Name */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <label className="font-semibold text-gray-900 text-[15px] min-w-[200px]">
              Account holder's name
            </label>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="e.g. Alex Peterson"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full border-b border-gray-200 py-1 focus:outline-none focus:border-[#007782] text-gray-700 placeholder-gray-300 transition-colors"
              />
            </div>
          </div>

          {/* IBAN */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <label className="font-semibold text-gray-900 text-[15px] min-w-[200px]">
              IBAN
            </label>
            <div className="flex-1 max-w-md relative group">
              <input
                type="text"
                placeholder="FRXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full border-b border-gray-200 py-1 pr-8 focus:outline-none focus:border-[#007782] text-gray-700 placeholder-gray-300 transition-colors uppercase"
              />
              <div className="absolute right-0 bottom-2">
                <Info className="w-4 h-4 text-gray-300 cursor-help hover:text-gray-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Address Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
          <h3 className="text-sm text-gray-500 font-medium">Billing address</h3>
        </div>
        
        <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group">
          <span className="font-semibold text-gray-900 text-[15px]">Add address</span>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      {/* Footer and Save Action */}
      <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[12px] text-gray-500 leading-relaxed max-w-lg">
          We never share your personal details with anyone other than our payment provider 
          for your withdrawals, or unless we're legally obligated to do so (e.g. by tax authorities).
        </p>
        <button className="bg-[#007782] text-white px-10 py-2.5 rounded font-bold hover:bg-[#005f68] transition-all shadow-sm shrink-0">
          Save
        </button>
      </div>
      
    </div>
  );
}