"use client";

import { ShieldCheck } from "lucide-react";
import type { LuxuryAssessment } from "@/lib/ai/types";

const EVIDENCE_LABELS: Record<string, string> = {
  "Original receipt": "Original receipt",
  Invoice: "Invoice",
  "Authenticity card": "Authenticity card",
  "Warranty card": "Warranty card",
  "Serial number": "Serial number photo",
  "QR code": "QR code photo",
  "NFC tag": "NFC tag photo",
  "Close-up logo photo": "Close-up logo photo",
  "Hardware photo": "Hardware photo",
  "Stitching photo": "Stitching photo",
  "Care label": "Care label photo",
  "Material label": "Material label photo",
};

interface LuxuryVerificationNoticeProps {
  luxury: LuxuryAssessment;
}

/**
 * IMPORTANT: this component must never say "authentic", "genuine", "fake",
 * or "verified" as a claim about the item - it only explains that extra
 * evidence is needed and what admin review means.
 */
export default function LuxuryVerificationNotice({ luxury }: LuxuryVerificationNoticeProps) {
  if (!luxury.isLuxury) return null;

  return (
    <div className="mt-4 rounded-xl border border-[#d9c9a3] bg-[#fbf6ea] p-4">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#8a181f]" />
        <span className="font-semibold text-[#1a1816]">
          {luxury.matchedBrandName ?? "This brand"} requires extra verification
        </span>
      </div>
      <p className="mb-3 text-sm text-gray-600">
        Items from this brand are held for a quick admin review before they go live. This isn&apos;t a
        judgment on your item - it&apos;s a standard step for this brand. Upload as many of the following
        as you have available, and our team will review them:
      </p>
      {luxury.missingEvidence.length > 0 ? (
        <ul className="grid grid-cols-1 gap-1 text-sm text-[#1a1816] sm:grid-cols-2">
          {luxury.missingEvidence.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b8860b]" />
              {EVIDENCE_LABELS[item] ?? item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-green-700">
          Looks like you&apos;ve already got what&apos;s needed - our team will review shortly after you publish.
        </p>
      )}
    </div>
  );
}
