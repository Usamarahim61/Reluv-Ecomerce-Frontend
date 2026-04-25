'use client';

import { X, EyeOff, Eye, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { login, register, loginWithGoogle, loginWithFacebook } from "../../services/auth-service";
import { useAuth } from "../../context/AuthContext";

// ─── Google OAuth config ───────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = "139090663543-35knp1pnf47rc7qrnbgf6jf4nkbts4ij.apps.googleusercontent.com";

// ─── Facebook OAuth config ─────────────────────────────────────────────────
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!;

// ─── Popup helper ──────────────────────────────────────────────────────────
function openPopup(url: string, title: string) {
  const w = 500, h = 600;
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  return window.open(url, title, `width=${w},height=${h},left=${left},top=${top}`);
}

export default function SignUpLogin({
  onClose,
  initialView = "initial",
}: {
  onClose: () => void;
  initialView?: "initial" | "login" | "register";
}) {
  const { login: setAuthLogin } = useAuth();
  const [view, setView] = useState<"initial" | "login" | "register">(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState("");

  // ── Google Sign-In via GSI popup ─────────────────────────────────────────
  const handleGoogleLogin = useCallback(() => {
    setSocialLoading("google");
    setError("");

    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback/google`,
      response_type: "token",
      scope: "openid email profile",
      prompt: "select_account",
    });

    const popup = openPopup(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      "Google Sign-In"
    );

    // Listen for the popup to post back the token
    const handler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "GOOGLE_AUTH_SUCCESS") return;

      window.removeEventListener("message", handler);
      popup?.close();

      try {
        const data = await loginWithGoogle(event.data.token);
        setAuthLogin(data.jwt, data.user);
        onClose();
      } catch (err: any) {
        setError(err.message || "Google login failed");
      } finally {
        setSocialLoading(null);
      }
    };

    window.addEventListener("message", handler);

    // Fallback: detect popup closed without message
    const poll = setInterval(() => {
      if (popup?.closed) {
        clearInterval(poll);
        window.removeEventListener("message", handler);
        setSocialLoading(null);
      }
    }, 500);
  }, [setAuthLogin, onClose]);

  // ── Facebook Login via FB SDK ─────────────────────────────────────────────
  const handleFacebookLogin = useCallback(() => {
    setSocialLoading("facebook");
    setError("");

    // Lazy-load the FB SDK if not already present
    const initFB = () => {
      (window as any).FB.login(
        (response: any) => {
          if (response.authResponse) {
            loginWithFacebook(response.authResponse.accessToken)
              .then((data) => {
                setAuthLogin(data.jwt, data.user);
                onClose();
              })
              .catch((err: any) => setError(err.message || "Facebook login failed"))
              .finally(() => setSocialLoading(null));
          } else {
            // User cancelled
            setSocialLoading(null);
          }
        },
        { scope: "email,public_profile" }
      );
    };

    if ((window as any).FB) {
      initFB();
    } else {
      // Inject the FB SDK script
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.onload = () => {
        (window as any).FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: false,
          version: "v19.0",
        });
        initFB();
      };
      script.onerror = () => {
        setError("Failed to load Facebook SDK");
        setSocialLoading(null);
      };
      document.body.appendChild(script);
    }
  }, [setAuthLogin, onClose]);

  // ─────────────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      setAuthLogin(data.jwt, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await register(username, email, password);
      setAuthLogin(data.jwt, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-xl shadow-2xl overflow-y-auto max-h-[92vh] transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 text-gray-400 hover:text-black p-1"
        >
          <X size={24} />
        </button>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          {view === "initial" && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-center leading-tight mb-8">
                Join and sell pre-loved clothes with no fees
              </h2>
              <div className="space-y-3">
                <SocialButton
                  icon="https://www.svgrepo.com/show/475656/google-color.svg"
                  text="Continue with Google"
                  loading={socialLoading === "google"}
                  onClick={handleGoogleLogin}
                />
                <SocialButton
                  icon="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  text="Continue with Facebook"
                  loading={socialLoading === "facebook"}
                  onClick={handleFacebookLogin}
                />
                <SocialButton
                  icon="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/apple.svg"
                  text="Continue with Apple"
                  onClick={() => {}} // wire up Apple later
                />
              </div>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="px-3 text-xs text-gray-400 font-bold uppercase">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={() => setView("register")}
                className="w-full bg-[#007782] text-white rounded-md py-3 font-semibold hover:bg-[#00656f]"
              >
                Register with email
              </button>
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <span onClick={() => setView("login")} className="text-[#007782] cursor-pointer hover:underline font-bold">
                  Log in
                </span>
              </p>
              {error && <p className="mt-3 text-red-500 text-xs font-medium text-center">{error}</p>}
            </>
          )}

          {(view === "login" || view === "register") && (
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-center mb-8">
                {view === "login" ? "Log in" : "Sign up with email"}
              </h2>
              <form onSubmit={view === "login" ? handleLogin : handleRegister} className="space-y-5">
                {view === "register" && (
                  <div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full py-3 border-b border-gray-300 outline-none focus:border-[#007782]"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Visible to other users.</p>
                  </div>
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 border-b border-gray-300 outline-none focus:border-[#007782]"
                />
                <div className="relative border-b border-gray-300 focus-within:border-[#007782]">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {view === "register" && (
                  <div className="space-y-4 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" className="mt-1 h-5 w-5 rounded border-gray-300 accent-[#007782] shrink-0" />
                      <span className="text-xs text-gray-600">I want to receive personalized offers and updates.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input required type="checkbox" className="mt-1 h-5 w-5 rounded border-gray-300 accent-[#007782] shrink-0" />
                      <span className="text-xs text-gray-600">
                        I accept the <span className="text-[#007782] font-medium">Terms & Conditions</span> and{" "}
                        <span className="text-[#007782] font-medium">Privacy Policy</span>.
                      </span>
                    </label>
                  </div>
                )}
                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#007782] text-white rounded-md py-3.5 font-bold disabled:opacity-50 mt-4 shadow-sm active:bg-[#005f68] flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Please wait..." : "Continue"}
                </button>
              </form>
              <button
                onClick={() => setView("initial")}
                className="mt-6 text-[#007782] text-sm font-medium hover:underline self-center"
              >
                {view === "register" && <span>Already have an account? Log In</span>}
                {view === "login" && <span>Don't have an account? Register</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialButton({
  icon,
  text,
  onClick,
  loading = false,
}: {
  icon: string;
  text: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-2.5 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : (
        <Image src={icon} alt="" width={20} height={20} />
      )}
      <span className="text-sm">{text}</span>
    </button>
  );
}