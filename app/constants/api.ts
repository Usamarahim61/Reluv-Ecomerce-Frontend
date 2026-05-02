import { BACKEND_URL } from "@/constants";
import { Capacitor } from "@capacitor/core";

const FALLBACK_WEB = BACKEND_URL;
const FALLBACK_ANDROID_EMULATOR = "http://10.0.2.2:1337";
const BACKEND_PORT = "1337";

type WindowWithApiBaseUrl = Window & {
  __API_BASE_URL__?: string;
};

const getAndroidBackendUrl = () => {
  if (typeof window === "undefined") return FALLBACK_ANDROID_EMULATOR;

  const { protocol, hostname } = window.location;
  const normalizedHost = hostname?.toLowerCase() ?? "";

  if (
    normalizedHost === "localhost" ||
    normalizedHost === "127.0.0.1" ||
    normalizedHost === "10.0.2.2"
  ) {
    return FALLBACK_ANDROID_EMULATOR;
  }

  // Preserve a LAN host if the app is loaded from a local network IP.
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1]))/.test(normalizedHost)) {
    return `${protocol}//${normalizedHost}:${BACKEND_PORT}`;
  }

  return FALLBACK_ANDROID_EMULATOR;
};

export const API_BASE_URL = (() => {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (env) return env;

  if (typeof window === "undefined") return FALLBACK_WEB;

  const configuredApiBaseUrl = (window as WindowWithApiBaseUrl).__API_BASE_URL__;
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  if (Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform();
    if (platform === "android") return getAndroidBackendUrl();
  }

  return FALLBACK_WEB;
})();

