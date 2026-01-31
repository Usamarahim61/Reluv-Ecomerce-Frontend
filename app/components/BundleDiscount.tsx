"use client";
import React, { JSX, useState } from "react";

export default function BundleDiscount(): JSX.Element {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-2 bg-white">
      {/* Bundle Discount Toggle Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-center shadow-sm">
        <span className="font-semibold text-gray-900 text-[17px]">
          Enable bundle discounts
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEnabled}
            onChange={() => setIsEnabled(!isEnabled)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#007782] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>

      {/* Description Text */}
      <p className="text-sm text-gray-500 leading-relaxed px-1">
        Encourage people to buy more items from you with bundle discounts. Set
        rates based on the number of items per order. Learn more at the{" "}
        <a
          href="#"
          className="text-[#007782] underline hover:text-[#005f68] transition-colors"
        >
          Help Centre
        </a>
        .
      </p>
    </div>
  );
}