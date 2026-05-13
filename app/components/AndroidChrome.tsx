"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Camera, Home as HomeIcon, Inbox, LogOut, Plus, Search, User } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SignUpLogin from "./signUp-login";
import {
  MemebersCardItem,
  ProductCardItem,
  searchMemebers,
  searchProducts,
} from "@/services/products-service";
import { API_BASE_URL } from "@/app/constants/api";

const DEFAULT_CATEGORIES = ["All", "Women", "Men", "Designer", "Kids", "Home", "Electronics"];

export default function AndroidChrome({
  categories = DEFAULT_CATEGORIES,
}: {
  categories?: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = (searchParams.get("category") || "").toLowerCase();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"initial" | "login" | "register">("initial");
  const [searchQuery, setSearchQuery] = useState("");
  const [productResults, setProductResults] = useState<ProductCardItem[]>([]);
  const [memberResults, setMemberResults] = useState<MemebersCardItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
    document.body.classList.add("android-shell");
    return () => {
      document.body.classList.remove("android-shell");
    };
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) {
      setProductResults([]);
      setMemberResults([]);
      setShowResults(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const [productsResponse, membersResponse] = await Promise.all([
          searchProducts(trimmedQuery, 5),
          searchMemebers(trimmedQuery, 5),
        ]);
        setProductResults(productsResponse.items);
        setMemberResults(membersResponse.items);
        setShowResults(true);
      } catch (error) {
        console.error("Android search error:", error);
        setProductResults([]);
        setMemberResults([]);
        setShowResults(true);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const closeSearch = useCallback(() => {
    setShowResults(false);
    setSearchQuery("");
  }, []);

  const handleProductClick = useCallback(
    (id: string | number) => {
      closeSearch();
      router.push(`/products/${id}`);
    },
    [closeSearch, router],
  );

  const handleMemberClick = useCallback(
    (id: string | number) => {
      closeSearch();
      router.push(`/member/${id}`);
    },
    [closeSearch, router],
  );

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;
      setShowResults(false);
      router.push(`/Shop?search=${encodeURIComponent(trimmedQuery)}`);
    },
    [router, searchQuery],
  );

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
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm text-[#6b7280] shadow-sm ring-1 ring-black/5"
        >
          <Search size={18} className="text-[#6b7280]" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setShowResults(true);
            }}
            className="flex-1 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9aa3ab]"
            placeholder="Search for items or members"
          />
          <button type="button" className="text-[#0f766e]" aria-label="Search by image">
            <Camera size={18} />
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-[#b45309]"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={18} />
          </button>

          {showResults ? (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-2xl border border-[#e5e7eb] bg-white py-2 shadow-xl">
              {searchLoading ? (
                <div className="px-4 py-4 text-center text-sm text-[#6b7280]">
                  Searching...
                </div>
              ) : productResults.length === 0 && memberResults.length === 0 ? (
                <div className="px-4 py-4 text-center text-sm text-[#6b7280]">
                  No results
                </div>
              ) : (
                <>
                  {productResults.map((product) => (
                    <button
                      key={`android-product-${product.id}`}
                      type="button"
                      onClick={() => handleProductClick(product.id)}
                      className="flex w-full items-center gap-3 border-b border-[#f1f5f9] px-4 py-3 text-left active:bg-[#f8fafc]"
                    >
                      <img
                        src={product.imageUrl || "/placeholder.jpg"}
                        alt={product.title || product.item || product.brand || "Product"}
                        className="h-11 w-11 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#111827]">
                          {product.title || product.item || product.brand}
                        </span>
                        <span className="block truncate text-xs text-[#6b7280]">
                          {product.brand || product.category || "Product"}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-[#111827]">
                        {product.price}
                      </span>
                    </button>
                  ))}

                  {memberResults.map((member) => (
                    <button
                      key={`android-member-${member.id}`}
                      type="button"
                      onClick={() => handleMemberClick(member.id)}
                      className="flex w-full items-center gap-3 border-b border-[#f1f5f9] px-4 py-3 text-left active:bg-[#f8fafc]"
                    >
                      <img
                        src={
                          member.avatar
                            ? `${API_BASE_URL}${member.avatar}`
                            : "/avatar-placeholder.png"
                        }
                        alt={member.fullName || member.username || "Member"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#111827]">
                          {member.fullName || member.username}
                        </span>
                        <span className="block truncate text-xs text-[#6b7280]">
                          {[member.city, member.country].filter(Boolean).join(", ") || "Member"}
                        </span>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : null}
        </form>

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
