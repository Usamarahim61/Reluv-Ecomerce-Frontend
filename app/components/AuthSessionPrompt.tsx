"use client";

import SignUpLogin from "./signUp-login";
import { useAuth } from "@/context/AuthContext";

export default function AuthSessionPrompt() {
  const { loginRequired, closeLoginRequired } = useAuth();

  if (!loginRequired) return null;

  return (
    <SignUpLogin initialView="login" onClose={closeLoginRequired} />
  );
}
