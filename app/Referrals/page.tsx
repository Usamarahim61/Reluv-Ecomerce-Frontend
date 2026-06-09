"use client";
import React, { JSX, useState } from "react";
import { Users, Mail, Smartphone, Ticket, ChevronRight, Copy, Share2 } from "lucide-react";

import Footer from "../components/Footer";

export default function Referrals(): JSX.Element {
  const [inviteLink] = useState("https://reluv-ecomerce-frontend.vercel.app/");
  const shareTitle = "Join me on Reluv!";
  const shareText = "Use my link to sign up, list items, and earn rewards on Reluv!";

  // 1. Copy to Clipboard Function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Link copied to clipboard!");
  };

  // 2. Native Web Share API (Opens native phone/browser share sheet if available)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: inviteLink,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback if browser doesn't support native sharing
      copyToClipboard();
    }
  };

  // 3. WhatsApp Direct Share Link
  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`${shareText} ${inviteLink}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  // 4. Email Direct Share Link
  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareText}\n\n${inviteLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  };

  return (
    <>
      <div className="w-full bg-white font-sans text-[#111111]">
        {/* Hero Section */}
        <div className="relative h-[550px] md:h-[500px] w-full overflow-hidden">
          {/* Background Image */}
          <img
            src="/referrals_updated_phones_2x.png"
            alt="Friends laughing"
            className="w-full h-full object-cover"
          />

          {/* Invitation Card */}
          <div className="absolute top-1/2 left-4 md:left-20 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg w-[calc(100%-32px)] max-w-[360px] space-y-4">
            <h1 className="text-2xl font-bold leading-tight">
              Tell a friend—help them sell!
            </h1>
            <p className="text-gray-600 text-[13px] leading-relaxed">
              Get 5 € to shop on Reluv when your friend lists 3 items within 7 days of signing up. Get 10 € more when they sell an item within the first 30 days.
            </p>
            <p className="text-[11px] text-gray-500">
              The referral program is subject to <a href="#" className="text-[#cb6f4d] underline">terms</a>.
            </p>

            <div className="space-y-3">
              {/* Link preview block */}
              <div className="bg-gray-50 border border-gray-200 p-2.5 text-xs text-gray-500 rounded truncate select-all">
                {inviteLink}
              </div>

              {/* Share Options Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-2 px-3 rounded text-xs hover:bg-gray-50 transition-colors"
                >
                  {/* Custom Simple WhatsApp Icon */}
                  <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 12.008 0c3.201.001 6.212 1.244 8.477 3.504 2.266 2.261 3.507 5.275 3.505 8.484-.004 6.657-5.34 12.004-11.953 12.004-.001 0-.001 0 0 0-2.002-.001-3.975-.51-5.728-1.479L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.742.002-2.602-1.004-5.05-2.831-6.88C16.623 2.151 14.178 1.145 11.58 1.145c-5.445 0-9.87 4.373-9.874 9.747-.001 1.742.466 3.44 1.354 4.951l-.982 3.595 3.679-.953z" />
                  </svg>
                  WhatsApp
                </button>

                <button
                  onClick={shareViaEmail}
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-2 px-3 rounded text-xs hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-4 h-4 text-sky-600" />
                  Email
                </button>
              </div>

              {/* Copy and Device Native Share Buttons */}
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={copyToClipboard}
                  className="col-span-3 flex items-center justify-center gap-2 bg-[#cb6f4d] text-white font-bold py-2.5 rounded text-sm hover:bg-[#b55f3e] transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>

                <button
                  onClick={handleNativeShare}
                  className="col-span-2 flex items-center justify-center gap-2 bg-[#005f68] text-white font-bold py-2.5 rounded text-sm hover:bg-[#004b52] transition-colors"
                  title="More sharing options"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
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
                <Mail className="w-10 h-10 text-[#cb6f4d]" />
              </div>
              <h3 className="font-bold text-lg">Invite your friends</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                Copy the invite link and share it with your friends via email, messaging app, or social media.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-[#f0f9f9] rounded-full flex items-center justify-center mb-2">
                <Smartphone className="w-10 h-10 text-[#cb6f4d]" />
              </div>
              <h3 className="font-bold text-lg">Wait for friends to list</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                You'll receive a 5 € voucher to shop on Reluv when your friend lists 3 items within 7 days of signing up. You'll also get an extra 10 € when they make a sale within the first 30 days.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-[#f0f9f9] rounded-full flex items-center justify-center mb-2">
                <Ticket className="w-10 h-10 text-[#cb6f4d]" />
              </div>
              <h3 className="font-bold text-lg">Spend vouchers on Reluv</h3>
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