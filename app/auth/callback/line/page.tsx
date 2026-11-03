"use client";
import { useEffect, useRef, useState } from "react";
import { loginWithLine } from "../../../../services/auth-service";
import { NEXT_PUBLIC_LINE_CALLBACK_URL } from "@/constants";

// Handles LINE's redirect back after user approves login.
// LINE appends ?code=...&state=... to this page's URL.
export default function LineCallback() {
  const [message, setMessage] = useState("Signing you in…");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    const payload = error
      ? { type: "LINE_AUTH_ERROR", error, state }
      : code
      ? { type: "LINE_AUTH_SUCCESS", code, state }
      : { type: "LINE_POPUP_CLOSED" };

    // Mobile app handoff: the ReluvApp prefixes its state with "reluvapp:".
    if (state && state.startsWith("reluvapp:")) {
      let returnedToApp = false;
      // If the app opens the deep link, this page goes to the background —
      // cancel the website fallback in that case.
      const onVisibility = () => {
        if (document.hidden) {
          returnedToApp = true;
          document.removeEventListener("visibilitychange", onVisibility);
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

      const target = code
        ? `reluvapp://auth/line?code=${encodeURIComponent(code)}&state=${encodeURIComponent(
            state.slice("reluvapp:".length)
          )}`
        : `reluvapp://auth/line?error=${encodeURIComponent(error || "cancelled")}&state=${encodeURIComponent(
            state.slice("reluvapp:".length)
          )}`;


      window.location.href = target;
      const anchor = document.createElement("a");
      anchor.href = target;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      // Only fall back to the website if the app never opened.
      setTimeout(() => {
        if (!returnedToApp) window.location.href = "/";
      }, 2500);
      return;
    }

    if (window.opener) {
      window.opener.postMessage(payload, window.location.origin);
      window.close();
      return;
    }

    const expectedState = sessionStorage.getItem("line_oauth_state");
    const codeVerifier = sessionStorage.getItem("line_oauth_verifier");
    const clearTransaction = () => {
      sessionStorage.removeItem("line_oauth_state");
      sessionStorage.removeItem("line_oauth_verifier");
    };

    if (error) {
      clearTransaction();
      const nextMessage = error === "ACCESS_DENIED" ? "LINE sign in was cancelled." : `LINE sign in failed: ${error}`;
      window.setTimeout(() => setMessage(nextMessage), 0);
      return;
    }
    if (!code || !state || state !== expectedState || !codeVerifier) {
      clearTransaction();
      window.setTimeout(
        () => setMessage("LINE sign in could not be verified. Close this page and try again."),
        0,
      );
      return;
    }

    void loginWithLine({
      code,
      code_verifier: codeVerifier,
      redirect_uri: NEXT_PUBLIC_LINE_CALLBACK_URL,
    })
      .then(({ jwt, user }) => {
        localStorage.setItem("jwt", jwt);
        localStorage.setItem("user", JSON.stringify(user));
        clearTransaction();
        window.location.replace("/");
      })
      .catch((err: unknown) => {
        clearTransaction();
        setMessage(err instanceof Error ? err.message : "LINE login failed. Please try again.");
      });
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-gray-500 text-sm">
      {message}
    </div>
  );
}
