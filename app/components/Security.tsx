"use client";
import { JSX, useState } from "react";
import { ChevronRight } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";
import TwoStepVerificationModal from "./TwoStepVerificationModal";
import LoginActivityModal from "./Loginactivitymodal";
import { useAuth } from "@/context/AuthContext";

interface Props {
  email?: string;
  twoFactorEnabled?: boolean;
  onEmailChanged?: (newEmail: string) => void;
  on2FAChanged?: (enabled: boolean) => void;
}

export default function Security({
  email,
  twoFactorEnabled = false,
  onEmailChanged,
  on2FAChanged,
}: Props): JSX.Element {

  const { user } = useAuth();
  const [showPasswordModal,  setShowPasswordModal]  = useState(false);
  const [showEmailModal,     setShowEmailModal]     = useState(false);
  const [show2FAModal,       setShow2FAModal]       = useState(false);
  const [showActivityModal,  setShowActivityModal]  = useState(false);

  const [currentEmail, setCurrentEmail] = useState<string>(user?.email ?? "");

  const [is2FAEnabled, setIs2FAEnabled] = useState(twoFactorEnabled);

  function handleEmailChanged(newEmail: string) {
    setCurrentEmail(newEmail);
    onEmailChanged?.(newEmail);
    setShowEmailModal(false);
  }

  function handle2FAChanged(enabled: boolean) {
    setIs2FAEnabled(enabled);
    on2FAChanged?.(enabled);
  }

  type SecurityItem = {
    title: string;
    description: string;
    onClick: () => void;
    badge?: { label: string; color: "green" | "gray" };
  };

  const securityItems: SecurityItem[] = [
    {
      title: "Email",
      description: `Current: ${currentEmail}`,
      onClick: () => setShowEmailModal(true),
    },
    {
      title: "Password",
      description: "Protect your account with a stronger password.",
      onClick: () => setShowPasswordModal(true),
    },
    {
      title: "2-Step Verification",
      description: is2FAEnabled
        ? "A code is sent to your email on each login."
        : "Confirm new logins with a 6-digit code.",
      onClick: () => setShow2FAModal(true),
      badge: is2FAEnabled
        ? { label: "Enabled", color: "green" }
        : { label: "Off", color: "gray" },
    },
    {
      title: "Login Activity",
      description: "Manage your logged-in devices.",
      onClick: () => setShowActivityModal(true),
    },
  ];

  return (
    <>
      {showPasswordModal && (
        <ChangePasswordModal
          email={currentEmail}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      {showEmailModal && (
        <ChangeEmailModal
          email={currentEmail}
          onClose={() => setShowEmailModal(false)}
          onEmailChanged={handleEmailChanged}
        />
      )}
      {show2FAModal && (
        <TwoStepVerificationModal
          email={currentEmail}
          isEnabled={is2FAEnabled}
          onClose={() => setShow2FAModal(false)}
          onStatusChanged={handle2FAChanged}
        />
      )}
      {showActivityModal && (
        <LoginActivityModal
          email={currentEmail}
          onClose={() => setShowActivityModal(false)}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6 bg-white text-[#111111]">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">Keep your account secure</h2>
          <p className="text-sm text-gray-500">Review your info to help protect your account.</p>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {securityItems.map((item, index) => (
            <button
              key={item.title}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50
                          transition-colors text-left group cursor-pointer
                          ${index !== securityItems.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-[15px]">{item.title}</p>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge.color === "green"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.badge.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}