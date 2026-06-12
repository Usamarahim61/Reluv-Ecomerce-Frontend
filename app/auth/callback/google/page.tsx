// app/auth/callback/google/page.tsx
'use client';
import { useEffect } from "react";

export default function GoogleCallback() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");

    if (window.opener) {
      window.opener.postMessage(
        token
          ? { type: "GOOGLE_AUTH_SUCCESS", token }
          : { type: "GOOGLE_POPUP_CLOSED" },
        window.location.origin
      );
      window.close();
    } else {
      // opener is null — store token in sessionStorage and redirect main tab
      if (token) sessionStorage.setItem("google_access_token", token);
      window.location.href = "/auth/callback/google/done";
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-gray-500 text-sm">
      Signing you in…
    </div>
  );
}