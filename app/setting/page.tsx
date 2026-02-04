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
      case "Profile Setting":
        return <ProfileSetting />;
      case "Account Setting":
        return <AccountSetting />;
      case "Postage":
        return <Postage />;
      case "Payments":
        return <Payments />;
      case "Bundle Discount":
        return <BundleDiscount />;
      case "Notification":
        return <Notification />;
      case "Privacy Setting":
        return <PrivacySetting />;
      case "Security":
        return <SecuritySetting />;
      default:
        return null;
    }
  };

  return (
     <><Navbar /><div className="mt-5 w-full max-w-5xl mx-auto mt-4 flex flex-col md:flex-row gap-10">
      {/* Left column - options */}
      <div className="w-full md:w-1/3  shadow">
        {options.map((option) => (
          <div
            key={option}
            className={`px-4 py-3 cursor-pointer  hover:bg-gray-50 ${selectedOption === option ? "bg-gray-100 font-semibold" : ""}`}
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </div>
        ))}
      </div>

      {/* Right column - render selected component */}
      <div className="w-full md:w-2/3">{renderRightComponent()}</div>
    </div><Footer /></>
  );
}
