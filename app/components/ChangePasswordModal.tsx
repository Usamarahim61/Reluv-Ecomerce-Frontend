"use client";
import { BACKEND_URL } from "@/constants";
import { useState } from "react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Step = "send" | "verify" | "reset" | "done";

interface Props {
  email: string;
  onClose: () => void;
  onSuccess?: (password: string) => void;  // ← add this
  onError?: () => void;   // ← add this
}

/* ─────────────────────────────────────────────
   API helpers  (adjust base-url / endpoint paths to match your Strapi routes)
───────────────────────────────────────────── */
const API = BACKEND_URL ?? "";

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
   Sub-components
───────────────────────────────────────────── */

/** Single OTP digit box */
function OtpInput({
  value,
  onChange,
  onKeyDown,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/, ""))}
      onKeyDown={onKeyDown}
      className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg
                 focus:border-[#cb6f4d] focus:outline-none transition-colors text-gray-800
                 focus:bg-[#fef5f1]"
    />
  );
}

/* ─────────────────────────────────────────────
   Main modal
───────────────────────────────────────────── */
export default function ChangePasswordModal({ email, onClose, onSuccess, onError }: Props) {
  const [step, setStep]           = useState<Step>("send");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [resendCd, setResendCd]   = useState(0);   // countdown seconds

  /* OTP refs for auto-focus */
  const digitRefs = Array.from({ length: 6 }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState<React.RefObject<HTMLInputElement>>(
      { current: null } as unknown as React.RefObject<HTMLInputElement>
    )[0]
  );

  /* ── helpers ── */
  const otpString = otp.join("");

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
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      // focus next box
      const nextInput = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`) as HTMLInputElement | null;
      prev?.focus();
    }
  }

  /* ── step handlers ── */
  async function handleSendOtp() {
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/password-reset/send-otp", { email });
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
      await apiPost("/api/password-reset/send-otp", { email });
      startResendCooldown();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otpString.length < 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/password-reset/verify-otp", { email, otp: otpString });
      setStep("reset");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

 async function handleResetPassword() {
  if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
  if (password !== confirm) { setError("Passwords do not match."); return; }
  setError("");
  setLoading(true);
  try {
    await apiPost("/api/password-reset/reset", { email, otp: otpString, password });
    setStep("done");
    onSuccess?.(password); // ← pass the actual password value
  } catch (e: any) {
    setError(e.message);
    onError?.();
  } finally {
    setLoading(false);
  }
}

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="bg-[#cb6f4d] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Change Password</h2>
            <p className="text-[#fde8df] text-xs mt-0.5">
              {step === "send"   && "We'll send a verification code to your email."}
              {step === "verify" && "Enter the 6-digit code we sent you."}
              {step === "reset"  && "Choose a strong new password."}
              {step === "done"   && "Your password has been updated."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        {step !== "done" && (
          <div className="flex px-6 pt-5 gap-2">
            {(["send", "verify", "reset"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  ["send", "verify", "reset"].indexOf(step) >= i
                    ? "bg-[#cb6f4d]"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6 space-y-5">

          {/* ── STEP: send ── */}
          {step === "send" && (
            <>
              <p className="text-sm text-gray-600">
                A one-time code will be sent to:
              </p>
              <div className="bg-[#fef5f1] border border-[#f0c4b0] rounded-lg px-4 py-3 flex items-center gap-3">
                <span className="text-[#cb6f4d] text-lg">✉</span>
                <span className="font-semibold text-gray-800 text-sm">{email}</span>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold
                           hover:bg-[#b55d3e] transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? "Sending…" : "Send Code"}
              </button>
            </>
          )}

          {/* ── STEP: verify ── */}
          {step === "verify" && (
            <>
              <p className="text-sm text-gray-600">
                Sent to <span className="font-semibold text-gray-800">{email}</span>. Code expires in 10 minutes.
              </p>

              {/* OTP boxes */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value.replace(/\D/, ""))}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200
                               rounded-lg focus:border-[#cb6f4d] focus:outline-none focus:bg-[#fef5f1]
                               transition-colors text-gray-800"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpString.length < 6}
                className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold
                           hover:bg-[#b55d3e] transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? "Verifying…" : "Verify Code"}
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

          {/* ── STEP: reset ── */}
          {step === "reset" && (
            <>
              <div className="space-y-4">
                {/* New password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full border border-gray-200 focus:border-[#cb6f4d] focus:outline-none
                                 rounded-lg px-4 py-3 pr-11 text-sm text-gray-700 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#cb6f4d]
                                 transition-colors text-base"
                      aria-label="Toggle visibility"
                    >
                      {showPw ? "🙈" : "👁"}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((lvl) => {
                        const strength =
                          password.length >= 12 && /[^a-zA-Z0-9]/.test(password) ? 4
                          : password.length >= 10 ? 3
                          : password.length >= 6  ? 2
                          : 1;
                        return (
                          <div
                            key={lvl}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              lvl <= strength
                                ? strength === 1 ? "bg-red-400"
                                : strength === 2 ? "bg-yellow-400"
                                : strength === 3 ? "bg-blue-400"
                                : "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full border focus:outline-none rounded-lg px-4 py-3 text-sm
                               text-gray-700 transition-colors ${
                      confirm && confirm !== password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 focus:border-[#cb6f4d]"
                    }`}
                  />
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500">Passwords don't match.</p>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleResetPassword}
                disabled={loading || !password || password !== confirm}
                className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold
                           hover:bg-[#b55d3e] transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? "Updating…" : "Update Password"}
              </button>
            </>
          )}

          {/* ── STEP: done ── */}
          {step === "done" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-[#fef5f1] rounded-full flex items-center justify-center mx-auto text-3xl">
                ✅
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">Password Updated!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your password has been changed successfully.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold
                           hover:bg-[#b55d3e] transition-all active:scale-95"
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