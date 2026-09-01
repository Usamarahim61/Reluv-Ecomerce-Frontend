"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { ConsentCategory, defaultConsent, getStoredConsent, saveConsent } from "@/lib/cookieConsent";

type ToggleKey = Exclude<ConsentCategory, "necessary">;

const categoryInfo: { key: ToggleKey; label: string; description: string }[] = [
  {
    key: "functional",
    label: "Functional",
    description: "Remembers your preferences (e.g. language, saved filters) to improve your experience.",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Helps us understand how visitors use RELove so we can improve the platform.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Used to show you more relevant offers and measure campaign performance.",
  },
];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [prefs, setPrefs] = useState<Record<ToggleKey, boolean>>({
    functional: defaultConsent.functional,
    analytics: defaultConsent.analytics,
    marketing: defaultConsent.marketing,
  });

  useEffect(() => {
    // only show if no decision has been stored yet
    const existing = getStoredConsent();
    if (!existing) setVisible(true);
  }, []);

  const closeAndPersist = (consent: Record<ToggleKey, boolean>) => {
    saveConsent(consent);
    setVisible(false);
    setShowCustomize(false);
  };

  const acceptAll = () =>
    closeAndPersist({ functional: true, analytics: true, marketing: true });

  const rejectAll = () =>
    closeAndPersist({ functional: false, analytics: false, marketing: false });

  const savePreferences = () => closeAndPersist(prefs);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#eadfcd] bg-white shadow-[0_20px_60px_rgba(26,24,22,0.15)]">
        {!showCustomize ? (
          // ---- Main banner ----
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8f2ea]">
                <Cookie className="h-5 w-5 text-[#cb6f4d]" />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-lg font-bold text-[#1a1816]">
                  We use cookies
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  We use necessary cookies to make RELove work, and optional cookies to
                  improve your experience, analyse traffic and personalise content. You can
                  accept all, reject non-essential cookies, or customise your choices. Read
                  our{" "}
                  <Link
                    href="/cookie-policy"
                    className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]"
                  >
                    Cookie Policy
                  </Link>{" "}
                  for details.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowCustomize(true)}
                className="rounded-full border border-[#e0ddd8] px-4 py-2 text-sm font-medium text-[#555] transition hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
              >
                Customize
              </button>
              <button
                onClick={rejectAll}
                className="rounded-full border border-[#e0ddd8] px-4 py-2 text-sm font-medium text-[#555] transition hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="rounded-full bg-[#1a1816] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#2a2826]"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // ---- Customize panel ----
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#1a1816]">
                Cookie Preferences
              </h2>
              <button
                onClick={() => setShowCustomize(false)}
                aria-label="Back"
                className="rounded-full p-1 text-gray-400 hover:bg-[#f8f2ea] hover:text-[#cb6f4d]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Necessary - always on */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-[#eadfcd] bg-[#fffdf8] p-4">
                <div>
                  <p className="text-sm font-semibold text-[#1a1816]">Necessary</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Required for the site to function (login, cart, security). Always active.
                  </p>
                </div>
                <span className="mt-0.5 shrink-0 rounded-full bg-[#f0ede8] px-3 py-1 text-xs font-medium text-gray-500">
                  Always On
                </span>
              </div>

              {categoryInfo.map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 rounded-xl border border-[#eadfcd] p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1a1816]">{label}</p>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={prefs[key]}
                    onClick={() =>
                      setPrefs((p) => ({ ...p, [key]: !p[key] }))
                    }
                    className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                      prefs[key] ? "bg-[#cb6f4d]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        prefs[key] ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={rejectAll}
                className="rounded-full border border-[#e0ddd8] px-4 py-2 text-sm font-medium text-[#555] transition hover:border-[#cb6f4d] hover:text-[#cb6f4d]"
              >
                Reject All
              </button>
              <button
                onClick={savePreferences}
                className="rounded-full bg-[#1a1816] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#2a2826]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}