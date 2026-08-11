"use client";
import { useEffect } from "react";

// Handles LINE's redirect back after user approves login.
// LINE appends ?code=...&state=... to this page's URL.
export default function LineCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    const payload = error
      ? { type: "LINE_AUTH_ERROR", error }
      : code
      ? { type: "LINE_AUTH_SUCCESS", code, state }
      : { type: "LINE_POPUP_CLOSED" };

    if (window.opener) {
      window.opener.postMessage(payload, window.location.origin);
      window.close();
    } else {
      // No popup — store code and redirect main tab
      if (code) {
        sessionStorage.setItem("line_auth_code", code);
        if (state) sessionStorage.setItem("line_auth_state", state);
      }
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-gray-500 text-sm">
      Signing you in…
    </div>
  );
}
