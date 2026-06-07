"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Truck,
  CreditCard,
  Gift,
  Bell,
  Eye,
  Shield,
  ChevronRight,
} from "lucide-react";
import ProfileSetting from "../components/ProfileSetting";
import AccountSetting from "../components/AccountSetting";
import Postage from "../components/Postage";
import Notification from "../components/Notification";
import PrivacySetting from "../components/PrivacySetting";
import SecuritySetting from "../components/Security";
import Payments from "../components/Payments";
import BundleDiscount from "../components/BundleDiscount";
import Footer from "../components/Footer";

export default function SettingsComp() {
  const options = [
    { label: "Profile Setting", icon: User },
    { label: "Account Setting", icon: Lock },
    { label: "Postage", icon: Truck },
    { label: "Payments", icon: CreditCard },
    // { label: "Bundle Discount", icon: Gift },
    { label: "Notification", icon: Bell },
    { label: "Privacy Setting", icon: Eye },
    { label: "Security", icon: Shield },
  ];

  const [selectedOption, setSelectedOption] = useState(options[0].label);

  const renderRightComponent = () => {
    switch (selectedOption) {
      case "Profile Setting": return <ProfileSetting />;
      case "Account Setting": return <AccountSetting />;
      case "Postage": return <Postage />;
      case "Payments": return <Payments userId="" />;
      // case "Bundle Discount": return <BundleDiscount />;
      case "Notification": return <Notification />;
      case "Privacy Setting": return <PrivacySetting />;
      case "Security": return <SecuritySetting />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf9f7] via-white to-[#f0ede8]">
      
      {/* Header */}
      <div className="border-b border-[#e0ddd8] bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a1a]">Settings</h1>
          <p className="text-[#888] text-sm mt-1">Manage your account and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-80 shrink-0">
            {/* Mobile Tabs */}
            <div className="lg:hidden mb-6">
              <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 no-scrollbar">
                {options.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedOption === option.label;
                  return (
                    <button
                      key={option.label}
                      onClick={() => setSelectedOption(option.label)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-[#cb6f4d] text-white shadow-lg"
                          : "bg-white text-[#555] border border-[#e0ddd8] hover:border-[#cb6f4d]"
                      }`}
                    >
                      <IconComponent size={16} />
                      <span className="hidden xs:inline">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block bg-white rounded-2xl border border-[#e0ddd8] shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 border-b border-[#f0ede8] bg-linear-to-r from-[#faf9f7] to-white">
                <h2 className="font-serif text-lg font-bold text-[#1a1a1a]">Settings Menu</h2>
              </div>

              <div className="divide-y divide-[#f0ede8]">
                {options.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedOption === option.label;
                  return (
                    <button
                      key={option.label}
                      onClick={() => setSelectedOption(option.label)}
                      className={`w-full px-6 py-4 flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? "bg-[#fff0e8] border-l-4 border-l-[#cb6f4d]"
                          : "hover:bg-[#faf9f7] border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? "bg-[#cb6f4d]" : "bg-[#f0ede8]"
                        }`}>
                          <IconComponent 
                            size={18} 
                            className={isSelected ? "text-white" : "text-[#cb6f4d]"}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          isSelected ? "text-[#cb6f4d] font-semibold" : "text-[#555]"
                        }`}>
                          {option.label}
                        </span>
                      </div>
                      {isSelected && <ChevronRight size={18} className="text-[#cb6f4d]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-[#e0ddd8] shadow-sm overflow-hidden">
              {/* Content Header */}
              <div className="hidden md:block px-6 md:px-8 py-6 border-b border-[#f0ede8] bg-linear-to-r from-[#faf9f7] to-white">
                <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">
                  {selectedOption}
                </h2>
                <p className="text-sm text-[#888] mt-1">
                  Manage your {selectedOption.toLowerCase()}
                </p>
              </div>

              {/* Content Body */}
              <div className="p-6 md:p-8">
                {renderRightComponent()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="hidden md:block mt-16">
        <Footer />
      </div>
    </div>
  );
}