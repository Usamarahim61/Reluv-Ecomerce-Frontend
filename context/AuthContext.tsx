"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  documentId?: string | number;
  username: string;
  email: string;
  city?: string;
  country?: string;
  fullName?: string;
  googlePicture?: string;
  googleAddress?: unknown;
  googleProfile?: Record<string, unknown>;
  avatar?: string | { url?: string } | null;
  fav_products?: unknown
};

type AuthContextType = {
  user: User | null;
  jwt: string | null;
  authReady: boolean;
  loginRequired: boolean;
  loginRequiredMessage: string | null;
  login: (jwt: string, user: User) => void;
  logout: () => void;
  requireLogin: (message?: string) => void;
  closeLoginRequired: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const [loginRequiredMessage, setLoginRequiredMessage] = useState<string | null>(null);

  // Load from localStorage on app start
  useEffect(() => {
    const storedJwt = localStorage.getItem("jwt");
    const storedUser = localStorage.getItem("user");

    if (storedJwt && storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJwt(storedJwt);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
      }
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    const handleInvalidSession = () => {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      setJwt(null);
      setUser(null);
      setLoginRequiredMessage("Please log in first to continue.");
      setLoginRequired(true);
    };

    window.addEventListener("reluv:auth-invalid", handleInvalidSession);
    return () => {
      window.removeEventListener("reluv:auth-invalid", handleInvalidSession);
    };
  }, []);

  const handleLogin = (jwt: string, user: User) => {
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("user", JSON.stringify(user));

    setJwt(jwt);
    setUser(user);
    setLoginRequired(false);
    setLoginRequiredMessage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setJwt(null);
    setUser(null);
    setLoginRequired(false);
    setLoginRequiredMessage(null);
    window.location.replace("/");
  };

  const requireLogin = useCallback((message = "Please log in first to continue.") => {
    setLoginRequiredMessage(message);
    setLoginRequired(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        jwt,
        authReady,
        loginRequired,
        loginRequiredMessage,
        login: handleLogin,
        logout: handleLogout,
        requireLogin,
        closeLoginRequired: () => {
          setLoginRequired(false);
          setLoginRequiredMessage(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
