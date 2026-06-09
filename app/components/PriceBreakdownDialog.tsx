"use client";
import { ShieldCheck, Truck, X, Info } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: string;
  buyerProtectionFee: number;
  shippingFromPrice: string;
};

export default function PriceBreakdownDialog({
  isOpen,
  onClose,
  title,
  price,
  buyerProtectionFee,
  shippingFromPrice,
}: Props) {
  if (!isOpen) return null;

  const priceNum = parseFloat(price.replace(/[^\d.]/g, "")) || 0;
  const currency = price.match(/[^\d.\s]+/)?.[0] ?? "TBH";
  const total = (priceNum + buyerProtectionFee).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-[20px] bg-white overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <span
            className="text-[15px] font-bold text-[#1a1a1a]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Price breakdown
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0ece8]"
            style={{ border: "1.5px solid #e0d8d2" }}
            aria-label="Close"
          >
            <X size={14} className="text-[#666]" />
          </button>
        </div>

        <div className="border-t border-[#ede8e3] mx-5" />

        {/* Product row */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-11 h-11 rounded-xl bg-[#f0e8e3] flex-shrink-0 flex items-center justify-center">
            <ShoppingBagIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1a1a1a] truncate font-sans">
              {title}
            </p>
            <p className="text-[12px] text-[#888] font-sans mt-0.5">{price}</p>
          </div>
          <span className="text-[14px] font-semibold text-[#1a1a1a] font-sans whitespace-nowrap">
            {price}
          </span>
        </div>

        <div className="border-t border-[#ede8e3] mx-5" />

        {/* Buyer Protection row */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-11 h-11 rounded-xl bg-[#edf7ed] flex-shrink-0 flex items-center justify-center">
            <ShieldCheck size={20} className="text-[#2d6a2d]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-[#1a1a1a] font-sans">
                Buyer Protection fee
              </p>
              <Info size={13} className="text-[#bbb]" />
            </div>
            <p className="text-[11px] text-[#aaa] font-sans mt-0.5">
              Mandatory on all purchases
            </p>
          </div>
          <span className="text-[14px] font-semibold text-[#1a1a1a] font-sans whitespace-nowrap">
            {currency} {buyerProtectionFee.toFixed(2)}
          </span>
        </div>

        <div className="border-t border-[#ede8e3] mx-5" />

        {/* Shipping row */}
        <div className="px-5 py-4 bg-[#f7f4f0]">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl bg-white flex-shrink-0 flex items-center justify-center"
              style={{ border: "1.5px solid #e8e2db" }}
            >
              <Truck size={18} className="text-[#c0613a]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-widest font-sans mb-0.5">
                Select at checkout
              </p>
              <p className="text-[13px] font-semibold text-[#1a1a1a] font-sans">
                Postage
              </p>
              <p className="text-[11px] text-[#aaa] font-sans">
                Depends on shipping choice
              </p>
            </div>
            <span className="text-[13px] font-semibold text-[#1a1a1a] font-sans whitespace-nowrap">
              from {shippingFromPrice}
            </span>
          </div>
        </div>

        <div className="border-t border-[#ede8e3] mx-5" />

        {/* Total */}
        <div className="flex justify-between items-center px-5 py-3.5">
          <span className="text-[14px] font-semibold text-[#1a1a1a] font-sans">
            Total
          </span>
          <span
            className="text-[18px] font-bold text-[#c0613a]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {currency} {total}+
          </span>
        </div>

        {/* Note */}
        <div className="px-5 pb-4">
          <div
            className="rounded-xl px-3.5 py-2.5"
            style={{ background: "#fdf5f0", border: "1px solid #f0ddd3" }}
          >
            <p className="text-[11px] text-[#a04828] leading-relaxed font-sans">
              Our Buyer Protection fee is mandatory when you purchase an item on
              Reluv. It is added to every purchase made with the &lsquo;Buy
              Now&rsquo; button. The item price is set by the seller and may be
              subject to negotiation.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <button onClick={onClose} className="pdp-btn-primary">
            OK, close
          </button>
        </div>
      </div>
    </div>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c0613a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
