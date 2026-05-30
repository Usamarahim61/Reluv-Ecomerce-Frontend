"use client";
import { useState } from "react";
import { BACKEND_URL } from "../../constants";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Step = "confirm" | "newEmail" | "verify" | "done";

interface Props {
  email: string;          // current email from logged-in user
  onClose: () => void;
  onEmailChanged?: (newEmail: string) => void; // optional callback to update parent state
}

/* ─────────────────────────────────────────────
   API helpers
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
   Main modal
───────────────────────────────────────────── */
export default function ChangeEmailModal({ email, onClose, onEmailChanged }: Props) {
  const [step, setStep]         = useState<Step>("confirm");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [resendCd, setResendCd] = useState(0);

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
      const nextInput = document.getElementById(`email-otp-${idx + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const prev = document.getElementById(`email-otp-${idx - 1}`) as HTMLInputElement | null;
      prev?.focus();
    }
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* ── step handlers ── */

  // STEP 1: Send OTP to current email to confirm identity
  async function handleSendConfirmOtp() {
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/email-change/send-otp", { email });
      setStep("newEmail");
      startResendCooldown();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Resend OTP to current email
  async function handleResend() {
    if (resendCd > 0) return;
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/email-change/send-otp", { email });
      startResendCooldown();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Verify OTP + submit new email → backend sends verification to new email
  async function handleVerifyAndSendToNew() {
    if (otpString.length < 6) { setError("Please enter all 6 digits."); return; }
    if (!isValidEmail(newEmail)) { setError("Please enter a valid email address."); return; }
    if (newEmail.toLowerCase() === email.toLowerCase()) {
      setError("New email must be different from your current email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/email-change/verify-otp", { email, otp: otpString, newEmail });
      setStep("verify");
      startResendCooldown();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // STEP 3: Confirm new email OTP (sent to the new address)
  async function handleConfirmNewEmail() {
    if (otpString.length < 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/email-change/confirm", { email, otp: otpString, newEmail });
      setStep("done");
      onEmailChanged?.(newEmail);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Step labels for progress bar
  const steps: Step[] = ["confirm", "newEmail", "verify"];
  const stepIndex = steps.indexOf(step);

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
            <h2 className="text-white font-bold text-lg leading-tight">Change Email</h2>
            <p className="text-[#fde8df] text-xs mt-0.5">
              {step === "confirm"  && "First, we'll verify it's really you."}
              {step === "newEmail" && "Enter your new email address."}
              {step === "verify"   && "Check your new inbox for the code."}
              {step === "done"     && "Your email has been updated."}
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
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  stepIndex >= i ? "bg-[#cb6f4d]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6 space-y-5">

          {/* ── STEP: confirm — send OTP to current email ── */}
          {step === "confirm" && (
            <>
              <p className="text-sm text-gray-600">
                To keep your account secure, we'll send a verification code to your current email:
              </p>
              <div className="bg-[#fef5f1] border border-[#f0c4b0] rounded-lg px-4 py-3 flex items-center gap-3">
                <span className="text-[#cb6f4d] text-lg">✉</span>
                <span className="font-semibold text-gray-800 text-sm">{email}</span>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                onClick={handleSendConfirmOtp}
                disabled={loading}
                className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold
                           hover:bg-[#b55d3e] transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? "Sending…" : "Send Verification Code"}
              </button>
            </>
          )}

          {/* ── STEP: newEmail — OTP boxes + new email input ── */}
          {step === "newEmail" && (
            <>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Code sent to <span className="font-semibold text-gray-800">{email}</span>.
                  Enter it below, then provide your new email.
                </p>
              </div>

              {/* OTP boxes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Verification Code
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`email-otp-${idx}`}
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
                <p className="text-xs text-center text-gray-400 mt-2">
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
              </div>

              {/* New email input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">New Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 focus:border-[#cb6f4d] focus:outline-none
                             rounded-lg px-4 py-3 text-sm text-gray-700 transition-colors"
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleVerifyAndSendToNew}
                disabled={loading || otpString.length < 6 || !newEmail}
                className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold
                           hover:bg-[#b55d3e] transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? "Verifying…" : "Verify & Continue"}
              </button>
            </>
          )}

          {/* ── STEP: verify — OTP sent to NEW email ── */}
          {step === "verify" && (
            <>
              <p className="text-sm text-gray-600">
                We sent a confirmation code to your new email:{" "}
                <span className="font-semibold text-gray-800">{newEmail}</span>.
                Enter it to complete the change.
              </p>

              {/* OTP boxes — reuse same array, reset on step change */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`email-otp-${idx}`}
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
                onClick={handleConfirmNewEmail}
                disabled={loading || otpString.length < 6}
                className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold
                           hover:bg-[#b55d3e] transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? "Confirming…" : "Confirm New Email"}
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
                ✅
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">Email Updated!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your email has been changed to{" "}
                  <span className="font-semibold text-gray-700">{newEmail}</span>.
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