import { Capacitor } from "@capacitor/core";

const FALLBACK_WEB = "http://localhost:1337";
const FALLBACK_ANDROID_EMULATOR = "http://10.0.2.2:1337";

export const API_BASE_URL = (() => {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (env) return env;

  if (typeof window === "undefined") return FALLBACK_WEB;

  if (Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform();
    if (platform === "android") return FALLBACK_ANDROID_EMULATOR;
  }

  return FALLBACK_WEB;
})();

