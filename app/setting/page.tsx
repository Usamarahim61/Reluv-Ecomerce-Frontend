"use client";

import { useState } from "react";
import ProfileSetting from "../components/ProfileSetting";
import AccountSetting from "../components/AccountSetting";
import Postage from "../components/Postage";
import Notification from "../components/Notification"
import PrivacySetting from "../components/PrivacySetting"
import SecuritySetting from "../components/Security"
import Payments from "../components/Payments"
import BundleDiscount from "../components/BundleDiscount"
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

export default function SettingsComp() {
  const options = [
    "Profile Setting",
    "Account Setting",
    "Postage",
    "Payments",
    "Bundle Discount",
    "Notification",
    "Privacy Setting",
    "Security",
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);

  const renderRightComponent = () => {
    switch (selectedOption) {
      case "Profile Setting": return <ProfileSetting />;
      case "Account Setting": return <AccountSetting />;
      case "Postage": return <Postage />;
      case "Payments": return <Payments />;
      case "Bundle Discount": return <BundleDiscount />;
      case "Notification": return <Notification />;
      case "Privacy Setting": return <PrivacySetting />;
      case "Security": return <SecuritySetting />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-6 md:py-10">
        <h1 className="text-2xl font-bold mb-6 md:hidden">Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          
          {/* Left column / Top Navigation */}
          <aside className="w-full md:w-1/4 lg:w-1/3">
            {/* Mobile: Horizontal scrollable tabs */}
            <div className="md:hidden flex overflow-x-auto pb-2 gap-2 no-scrollbar border-b border-gray-200">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedOption === option 
                    ? "bg-[#007782] text-white font-medium" 
                    : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Desktop: Vertical sidebar */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 text-lg">Settings</h2>
              </div>
              <div className="flex flex-col">
                {options.map((option) => (
                  <button
                    key={option}
                    className={`px-6 py-4 text-left text-sm transition-all hover:bg-gray-50 border-l-4 ${
                      selectedOption === option 
                      ? "bg-gray-50 border-[#007782] font-bold text-[#007782]" 
                      : "border-transparent text-gray-600"
                    }`}
                    onClick={() => setSelectedOption(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right column - content */}
          <div className="w-full md:w-3/4 lg:w-2/3">
            <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm border border-gray-100 min-h-[500px]">
              <h2 className="text-xl font-bold mb-6 hidden md:block text-gray-800">
                {selectedOption}
              </h2>
              {renderRightComponent()}
            </div>
          </div>
        </div>
      </main>

       <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}