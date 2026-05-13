"use client";

import SignUpLogin from "./signUp-login";
import { useAuth } from "@/context/AuthContext";

export default function AuthSessionPrompt() {
  const { loginRequired, loginRequiredMessage, closeLoginRequired } = useAuth();

  if (!loginRequired) return null;

  return (
    <SignUpLogin
      initialView="login"
      message={loginRequiredMessage || undefined}
      onClose={closeLoginRequired}
    />
  );
}
