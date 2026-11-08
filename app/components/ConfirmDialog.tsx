"use client";

import React from "react";
import { X, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "warning";
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
  icon,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-50 text-red-600",
          confirmBtn:
            "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-400",
          defaultIcon: <AlertTriangle size={20} />,
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 text-amber-600",
          confirmBtn:
            "bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-amber-400",
          defaultIcon: <AlertTriangle size={20} />,
        };
      case "primary":
      default:
        return {
          iconBg: "bg-[#fff0e8] text-[#cb6f4d]",
          confirmBtn:
            "bg-[#cb6f4d] hover:bg-[#b85f3d] text-white shadow-sm focus:ring-[#cb6f4d]",
          defaultIcon: <HelpCircle size={20} />,
        };
    }
  };

  const { iconBg, confirmBtn, defaultIcon } = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 z-10 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
            >
              {icon || defaultIcon}
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-gray-600 leading-relaxed mb-6">
          {message}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer ${confirmBtn}`}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

