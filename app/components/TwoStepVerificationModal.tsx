"use client";
import { BACKEND_URL } from "@/constants";
import { useState } from "react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Step = "intro" | "verify" | "done";

interface Props {
  email: string;
  isEnabled: boolean;           // current 2FA status
  onClose: () => void;
  onStatusChanged?: (enabled: boolean) => void;
}

const API = BACKEND_URL;

async function apiPost(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? data?.message ?? "Request failed");
  return data;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function TwoStepVerificationModal({
  email,
  isEnabled,
  onClose,
  onStatusChanged,
}: Props) {
  const [step, setStep]       = useState<Step>("intro");
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCd, setResendCd] = useState(0);

  // What action are we performing
  const action = isEnabled ? "disable" : "enable";
  const otpString = otp.join("");

  /* ── helpers ── */
  function startResendCooldown(seconds = 30) {
    setResendCd(seconds);
    const id = setInterval(() => {
      setResendCd((s) => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  function handleOtpChange(idx: number, val: string) {
    const next = [...otp];
    next[idx] = val.replace(/\D/, "");
    setOtp(next);
    if (val && idx < 5) {
      (document.getElementById(`2fa-otp-${idx + 1}`) as HTMLInputElement)?.focus();
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      (document.getElementById(`2fa-otp-${idx - 1}`) as HTMLInputElement)?.focus();
    }
  }

  /* ── step handlers ── */
  async function handleSendOtp() {
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/two-factor/send-otp", { email, action });
      setStep("verify");
      startResendCooldown();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCd > 0) return;
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/two-factor/send-otp", { email, action });
      startResendCooldown();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (otpString.length < 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/two-factor/toggle", { email, otp: otpString, action });
      setStep("done");
      onStatusChanged?.(action === "enable");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="bg-[#cb6f4d] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">
              2-Step Verification
            </h2>
            <p className="text-[#fde8df] text-xs mt-0.5">
              {step === "intro"  && (isEnabled ? "Disable extra login protection." : "Add an extra layer of security.")}
              {step === "verify" && "Enter the code we sent to your email."}
              {step === "done"   && (action === "enable" ? "2FA is now active." : "2FA has been turned off.")}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors text-xl leading-none" aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">

          {/* ── STEP: intro ── */}
          {step === "intro" && (
            <>
              {/* Status badge */}
              <div className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
                isEnabled
                  ? "bg-green-50 border-green-200"
                  : "bg-[#fef5f1] border-[#f0c4b0]"
              }`}>
                <span className="text-xl">{isEnabled ? "🔒" : "🔓"}</span>
                <div>
                  <p className={`font-semibold text-sm ${isEnabled ? "text-green-700" : "text-[#cb6f4d]"}`}>
                    {isEnabled ? "Currently Enabled" : "Currently Disabled"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isEnabled
                      ? "A code is sent to your email each time you log in."
                      : "No extra verification is required at login."}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-3">
                {!isEnabled ? (
                  <>
                    <p className="text-sm text-gray-600 font-medium">How it works once enabled:</p>
                    {[
                      { icon: "1️⃣", text: "You log in with your email and password as usual." },
                      { icon: "2️⃣", text: "We send a 6-digit code to your email." },
                      { icon: "3️⃣", text: "You enter the code to complete sign-in." },
                    ].map((step) => (
                      <div key={step.icon} className="flex items-start gap-3 text-sm text-gray-600">
                        <span>{step.icon}</span>
                        <span>{step.text}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    Disabling 2-step verification will remove the extra login protection from your account.
                    We recommend keeping it enabled.
                  </p>
                )}
              </div>

              <div className="bg-[#fef5f1] border border-[#f0c4b0] rounded-lg px-4 py-3 flex items-center gap-3">
                <span className="text-[#cb6f4d] text-lg">✉</span>
                <span className="font-semibold text-gray-800 text-sm">{email}</span>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 active:scale-95 text-white ${
                  isEnabled
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#cb6f4d] hover:bg-[#b55d3e]"
                }`}
              >
                {loading
                  ? "Sending…"
                  : isEnabled
                  ? "Send Code to Disable"
                  : "Send Code to Enable"}
              </button>
            </>
          )}

          {/* ── STEP: verify ── */}
          {step === "verify" && (
            <>
              <p className="text-sm text-gray-600">
                Code sent to <span className="font-semibold text-gray-800">{email}</span>. Expires in 2 minutes.
              </p>

              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`2fa-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200
                               rounded-lg focus:border-[#cb6f4d] focus:outline-none focus:bg-[#fef5f1]
                               transition-colors text-gray-800"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={loading || otpString.length < 6}
                className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 active:scale-95 text-white ${
                  action === "disable"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#cb6f4d] hover:bg-[#b55d3e]"
                }`}
              >
                {loading
                  ? "Verifying…"
                  : action === "enable"
                  ? "Enable 2-Step Verification"
                  : "Disable 2-Step Verification"}
              </button>

              <p className="text-xs text-center text-gray-400">
                Didn't receive it?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCd > 0 || loading}
                  className="text-[#cb6f4d] font-semibold disabled:opacity-40"
                >
                  {resendCd > 0 ? `Resend in ${resendCd}s` : "Resend"}
                </button>
              </p>
            </>
          )}

          {/* ── STEP: done ── */}
          {step === "done" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-[#fef5f1] rounded-full flex items-center justify-center mx-auto text-3xl">
                {action === "enable" ? "🔒" : "🔓"}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  {action === "enable" ? "2FA Enabled!" : "2FA Disabled"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {action === "enable"
                    ? "Your account is now protected with 2-step verification."
                    : "2-step verification has been removed from your account."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold hover:bg-[#b55d3e] transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}