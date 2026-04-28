import { BACKEND_URL } from "@/constants";
import { Capacitor } from "@capacitor/core";

const FALLBACK_WEB = BACKEND_URL;
const FALLBACK_ANDROID_EMULATOR = BACKEND_URL;

export const API_BASE_URL = (() => {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (env) return env;

  if (typeof window === "undefined") return FALLBACK_WEB;

  if (typeof window !== "undefined" && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }

  if (Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform();
    if (platform === "android") return FALLBACK_ANDROID_EMULATOR;
  }

  return FALLBACK_WEB;
})();

