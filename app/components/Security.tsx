"use client";
import  { JSX } from "react";
import { ChevronRight } from "lucide-react";

interface SecurityItem {
  title: string;
  description: string;
  onClick?: () => void;
}

export default function Security(): JSX.Element {
  const securityItems: SecurityItem[] = [
    {
      title: "Email",
      description: "Keep your email up to date.",
    },
    {
      title: "Password",
      description: "Protect your account with a stronger password.",
    },
    {
      title: "2-step verification",
      description: "Confirm new logins with a 4-digit code.",
    },
    {
      title: "Login activity",
      description: "Manage your logged-in devices.",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 bg-white text-[#111111]">
      {/* Header Section */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">Keep your account secure</h2>
        <p className="text-sm text-gray-500">Review your info to help protect your account.</p>
      </div>

      {/* Security Options List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {securityItems.map((item, index) => (
          <button
            key={item.title}
            onClick={item.onClick}
            className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left group ${
              index !== securityItems.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="space-y-0.5">
              <p className="font-medium text-gray-900 text-[15px]">{item.title}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}