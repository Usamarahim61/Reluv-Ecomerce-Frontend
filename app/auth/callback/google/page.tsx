// app/auth/callback/google/page.tsx
'use client';
import { useEffect } from "react";

export default function GoogleCallback() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");

    if (token && window.opener) {
      window.opener.postMessage(
        { type: "GOOGLE_AUTH_SUCCESS", token },
        window.location.origin
      );
    }
    window.close();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-gray-500 text-sm">
      Signing you in…
    </div>
  );
}