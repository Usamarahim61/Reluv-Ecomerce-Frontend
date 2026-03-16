"use client";
import React, { JSX, useState } from "react";
import { ChevronRight, Info, X } from "lucide-react";

interface backAccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBankAccount({
  isOpen,
  onClose,
}: backAccountDetailsModalProps): JSX.Element | null {
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [iban, setIban] = useState<string>("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">

      {/* Modal container */}
      <div className="w-full max-w-2xl bg-gray-50 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">

        {/* Account Details Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-sm text-gray-500 font-medium">
              Account details
            </h3>

            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-8">

            {/* Account Holder */}
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
                  className="w-full border-b border-gray-200 py-1 focus:outline-none focus:border-[#007782]"
                />
              </div>
            </div>

            {/* IBAN */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <label className="font-semibold text-gray-900 text-[15px] min-w-[200px]">
                IBAN
              </label>

              <div className="flex-1 max-w-md relative">
                <input
                  type="text"
                  placeholder="FRXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full border-b border-gray-200 py-1 pr-8 focus:outline-none focus:border-[#007782] uppercase"
                />

                <Info className="absolute right-0 bottom-2 w-4 h-4 text-gray-400" />
              </div>
            </div>

          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mt-4">
          <div className="p-4 border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-sm text-gray-500 font-medium">
              Billing address
            </h3>
          </div>

          <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 group">
            <span className="font-semibold text-gray-900 text-[15px]">
              Add address
            </span>

            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">

          <p className="text-[12px] text-gray-500 max-w-lg">
            We never share your personal details with anyone other than our
            payment provider for your withdrawals, or unless legally required.
          </p>

          <button className="bg-[#007782] text-white px-10 py-2.5 rounded font-bold hover:bg-[#005f68]">
            Save
          </button>

        </div>

      </div>
    </div>
  );
}
