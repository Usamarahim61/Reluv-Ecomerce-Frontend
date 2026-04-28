"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Home as HomeIcon, Inbox, Plus, Search, User } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SignUpLogin from "./signUp-login";

const DEFAULT_CATEGORIES = ["All", "Women", "Men", "Designer", "Kids", "Home", "Electronics"];

export default function AndroidChrome({
  categories = DEFAULT_CATEGORIES,
}: {
  categories?: string[];
}) {
  const searchParams = useSearchParams();
  const selectedCategory = (searchParams.get("category") || "").toLowerCase();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"initial" | "login" | "register">("initial");

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
    document.body.classList.add("android-shell");
    return () => {
      document.body.classList.remove("android-shell");
    };
  }, []);

  if (!user) {
    return (
      <>
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f7f7f8] px-6 text-center">
          <div className="mb-6 text-3xl font-semibold text-[#0f766e]">Reluv</div>
          <p className="mb-8 max-w-sm text-sm text-[#4b5563]">
            Log in or sign up to start browsing, buying, and selling on Reluv.
          </p>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <button
              onClick={() => {
                setAuthView("register");
                setAuthOpen(true);
              }}
              className="w-full rounded-full bg-[#0f766e] py-3 text-sm font-semibold text-white shadow-sm"
            >
              Sign up
            </button>
            <button
              onClick={() => {
                setAuthView("login");
                setAuthOpen(true);
              }}
              className="w-full rounded-full border border-[#0f766e] bg-white py-3 text-sm font-semibold text-[#0f766e]"
            >
              Log in
            </button>
          </div>
        </div>
        {authOpen ? (
          <SignUpLogin
            initialView={authView}
            onClose={() => setAuthOpen(false)}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm text-[#6b7280] shadow-sm ring-1 ring-black/5">
          <Search size={18} className="text-[#6b7280]" />
          <input
            className="flex-1 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9aa3ab]"
            placeholder="Search for items or members"
          />
          <button className="text-[#0f766e]">
            <Camera size={18} />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((label, index) => {
            const isAll = index === 0 || label.toLowerCase() === "all";
            const isActive = isAll
              ? selectedCategory === "" || selectedCategory === "all"
              : selectedCategory === label.toLowerCase();
            const href = isAll
              ? "/Shop"
              : `/Shop?category=${encodeURIComponent(label)}`;
            return (
              <Link
                key={label}
                href={href}
                className={
                  isActive
                    ? "whitespace-nowrap rounded-full border border-[#0f766e] bg-[#0f766e]/10 px-4 py-1.5 text-[12px] text-[#0f766e]"
                    : "whitespace-nowrap rounded-full border border-[#e5e7eb] bg-white px-4 py-1.5 text-[12px] text-[#6b7280]"
                }
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#e5e7eb] bg-white px-4 py-3 z-20">
        <div className="mx-auto grid max-w-md grid-cols-5 text-center text-[11px] text-[#9aa3ab]">
          <Link href="/" className="flex flex-col items-center gap-1 text-[#0f766e]">
            <HomeIcon size={18} />
            Home
          </Link>
          <Link href="/Shop" className="flex flex-col items-center gap-1">
            <Search size={18} />
            Search
          </Link>
          <Link href="/SellNow" className="flex flex-col items-center gap-1 text-[#0f766e]">
            <Plus size={18} />
            Sell
          </Link>
          <Link href="/Messages" className="flex flex-col items-center gap-1">
            <Inbox size={18} />
            Inbox
          </Link>
          <Link href="/setting" className="flex flex-col items-center gap-1">
            <User size={18} />
            Profile
          </Link>
        </div>
      </div>
    </>
  );
}
