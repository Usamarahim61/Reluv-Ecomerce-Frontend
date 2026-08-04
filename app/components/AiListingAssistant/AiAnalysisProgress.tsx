"use client";

import { Loader2 } from "lucide-react";

interface AiAnalysisProgressProps {
  message: string | null;
  onCancel: () => void;
}

export default function AiAnalysisProgress({ message, onCancel }: AiAnalysisProgressProps) {
  if (!message) return null;

  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-[#f7f7f7] px-4 py-3">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-[#1a1816]" />
        <span className="text-sm font-medium text-[#1a1816]">{message}</span>
      </div>
      <button type="button" onClick={onCancel} className="text-sm text-gray-500 underline hover:text-gray-700">
        Cancel
      </button>
    </div>
  );
}
