"use client";
import React, { JSX, useState } from "react";
import { Users, Mail, Smartphone, Ticket, ChevronRight } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

export default function Referrals(): JSX.Element {
  const [inviteLink] = useState("https://www.vinted.es/invite/rajaabad835");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Link copied!");
  };

  return (
    <><Navbar /><div className="w-full bg-white font-sans text-[#111111]">
      {/* Hero Section */}
      <div className="relative h-[500px] w-full overflow-hidden">
        {/* Background Image - Replace src with your actual asset path */}
        <img
          src="/referrals_updated_phones_2x.png"
          alt="Friends laughing"
          className="w-full h-full object-cover" />

        {/* Invitation Card */}
        <div className="absolute top-1/2 left-4 md:left-20 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg w-full max-w-[360px] space-y-4">
          <h1 className="text-2xl font-bold leading-tight">
            Tell a friend—help them sell!
          </h1>
          <p className="text-gray-600 text-[13px] leading-relaxed">
            Get 5 € to shop on Vinted when your friend lists 3 items within 7 days of signing up. Get 10 € more when they sell an item within the first 30 days.
          </p>
          <p className="text-[11px] text-gray-500">
            The referral program is subject to <a href="#" className="text-[#007782] underline">terms</a>.
          </p>

          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 p-2 text-xs text-gray-500 rounded truncate">
              {inviteLink}
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full bg-[#007782] text-white font-bold py-2.5 rounded hover:bg-[#005f68] transition-colors"
            >
              Copy invite link
            </button>
          </div>

          <button className="w-full flex items-center justify-between pt-4 border-t border-gray-100 group">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold">Your referrals</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* How it Works Section */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-center text-2xl font-bold mb-12">How referrals work</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-[#f0f9f9] rounded-full flex items-center justify-center mb-2">
              <Mail className="w-10 h-10 text-[#007782]" />
            </div>
            <h3 className="font-bold text-lg">Invite your friends</h3>
            <p className="text-sm text-gray-500 leading-relaxed px-4">
              Copy the invite link and share it with your friends via email, messaging app, or social media.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-[#f0f9f9] rounded-full flex items-center justify-center mb-2">
              <Smartphone className="w-10 h-10 text-[#007782]" />
            </div>
            <h3 className="font-bold text-lg">Wait for friends to list</h3>
            <p className="text-sm text-gray-500 leading-relaxed px-4">
              You'll receive a 5 € voucher to shop on Vinted when your friend lists 3 items within 7 days of signing up. You'll also get an extra 10 € when they make a sale within the first 30 days.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-[#f0f9f9] rounded-full flex items-center justify-center mb-2">
              <Ticket className="w-10 h-10 text-[#007782]" />
            </div>
            <h3 className="font-bold text-lg">Spend vouchers on Vinted</h3>
            <p className="text-sm text-gray-500 leading-relaxed px-4">
              Your voucher will automatically apply to your next order of 15 € or more (excluding shipping, Buyer Protection, and optional service fees).
            </p>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}