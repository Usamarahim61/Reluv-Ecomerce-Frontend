"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  documentId?: string | number;
  username: string;
  email: string;
  city?: string;
  country?: string;
  avatar: string,
  fav_products?: unknown
};

type AuthContextType = {
  user: User | null;
  jwt: string | null;
  loginRequired: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
  closeLoginRequired: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);

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
  }, []);

  useEffect(() => {
    const handleInvalidSession = () => {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      setJwt(null);
      setUser(null);
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
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setJwt(null);
    setUser(null);
    setLoginRequired(false);
    window.location.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jwt,
        loginRequired,
        login: handleLogin,
        logout: handleLogout,
        closeLoginRequired: () => setLoginRequired(false),
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
