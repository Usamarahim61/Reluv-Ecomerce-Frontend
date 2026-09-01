// lib/cookieConsent.ts

export type ConsentCategory = "necessary" | "functional" | "analytics" | "marketing";

export type CookieConsent = {
  necessary: true; // always on, can't be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "relove_cookie_consent";

export const defaultConsent: Omit<CookieConsent, "updatedAt"> = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookieConsent) : null;
  } catch {
    return null;
  }
}

export function saveConsent(consent: Omit<CookieConsent, "necessary" | "updatedAt">) {
  const value: CookieConsent = {
    necessary: true,
    ...consent,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  // let other components/tabs react immediately (e.g. load analytics scripts)
  window.dispatchEvent(new CustomEvent("cookieConsentChanged", { detail: value }));
  return value;
}

export function hasConsent(category: ConsentCategory): boolean {
  const consent = getStoredConsent();
  if (!consent) return false;
  return consent[category] === true;
}