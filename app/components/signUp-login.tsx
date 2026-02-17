'use client';

import { X, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { API_BASE_URL } from "../constants/api";

export default function SignUpLogin({ onClose }: { onClose: () => void }) {
  // Added 'register' view
  const [view, setView] = useState<"initial" | "login" | "register">("initial");

  // Form States
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Login failed");

      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login successful");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Registration failed");

      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Registration successful");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-xl px-10 py-10 shadow-xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute cursor-pointer right-6 top-4 text-gray-400 hover:text-black">
          <X size={20} />
        </button>

        {view === "initial" && (
          <>
            <h2 className="text-xl font-semibold text-center">Join and sell pre-loved clothes with no fees</h2>
            <div className="mt-6 space-y-3">
              <button className="w-full flex items-center justify-center gap-3 border rounded-md py-2 font-medium hover:bg-gray-50">
                <Image src="/icons/google.svg" alt="Google" width={20} height={20} /> Continue with Google
              </button>
              <button className="w-full flex items-center justify-center gap-3 border rounded-md py-2 font-medium hover:bg-gray-50">
                <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} /> Continue with Facebook
              </button>
              <button className="w-full flex items-center justify-center gap-3 border rounded-md py-2 font-medium hover:bg-gray-50">
                <Image src="/icons/apple.svg" alt="Apple" width={20} height={20} /> Continue with Apple
              </button>
            </div>
            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-3 text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>
            <button
              onClick={() => setView("register")}
              className="w-full bg-[#007782] text-white rounded-md py-2 font-medium hover:bg-[#00656f]"
            >
              Register with email
            </button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <span onClick={() => setView("login")} className="text-[#007782] cursor-pointer hover:underline font-medium">Log in</span>
            </p>
          </>
        )}

        {view === "login" && (
          <div className="flex flex-col">
            <h2 className="text-2xl font-medium text-center mb-8">Log in</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="border-b border-gray-300 focus-within:border-[#007782]">
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-2 outline-none" />
              </div>
              <div className="border-b border-gray-300 focus-within:border-[#007782] flex items-center">
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-2 outline-none" />
                <EyeOff size={20} className="text-gray-400" />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[#007782] text-white rounded-md py-3 font-bold disabled:opacity-50">
                {loading ? "Please wait..." : "Continue"}
              </button>
            </form>
            <button onClick={() => setView("initial")} className="mt-6 text-[#007782] text-sm text-center">Having trouble?</button>
          </div>
        )}

        {view === "register" && (
          <div className="flex flex-col">
            <h2 className="text-2xl font-medium text-center mb-8">Sign up with email</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-1">
                <div className="border-b border-gray-300 focus-within:border-[#007782]">
                  <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full py-2 outline-none" />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">Use letters, numbers, or both. Other Vinted users will see this name on your account.</p>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <div className="border-b border-gray-300 focus-within:border-[#007782]">
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-2 outline-none" />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">Enter the email you want to use on Vinted</p>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="border-b border-gray-300 focus-within:border-[#007782] flex items-center">
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-2 outline-none" />
                  <EyeOff size={20} className="text-gray-400 ml-2" />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">Enter at least 7 characters, including at least 1 letter and at least 1 number</p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-4">
                <label className="flex gap-3 cursor-pointer group">
                  <input type="checkbox" className="mt-1 h-5 w-5 rounded border-gray-300 accent-[#007782]" />
                  <span className="text-sm text-gray-600 leading-snug">I'd like to receive personalised offers and be the first to know about the latest updates via email.</span>
                </label>
                <label className="flex gap-3 cursor-pointer">
                  <input required type="checkbox" className="mt-1 h-5 w-5 rounded border-gray-300 accent-[#007782]" />
                  <span className="text-sm text-gray-600 leading-snug">
                    By registering, I confirm that I accept <span className="text-[#007782] hover:underline cursor-pointer">Vinted's Terms and Conditions</span>, have read the <span className="text-[#007782] hover:underline cursor-pointer">Privacy Policy</span>, and am at least 18 years old.
                  </span>
                </label>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-[#007782] text-white rounded-md py-3 font-bold text-lg mt-4 disabled:opacity-50">
                {loading ? "Registering..." : "Continue"}
              </button>
            </form>
            <button onClick={() => setView("initial")} className="mt-6 text-[#007782] text-sm text-center">Having trouble?</button>
          </div>
        )}
      </div>
    </div>
  );
}
