"use client";
import {
  Search,
  Camera,
  HelpCircle,
  Menu,
  X,
  Mail,
  Bell,
  Heart,
  User,
  BellOff,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import SignUpLogin from "./signUp-login";
import { SubMenus } from "./SubMenus";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import type { RootState } from "@/lib/store";
import { fetchCatalogTree } from "@/lib/features/categoriesSlice";
import { mapTreeToSubCategories } from "@/lib/categoryUtils";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import AndroidChrome from "./AndroidChrome";
import { useAndroidNative } from "./useAndroidNative";
import {
  ProductCardItem,
  searchProducts,
  searchMemebers,
  MemebersCardItem,
} from "@/services/products-service";
import { getUser, getUserAvatr } from "@/services/auth-service";
import { API_BASE_URL } from "@/app/constants/api";

export default function NavbarV2() {
  const { isAndroid, isReady } = useAndroidNative();
  const router = useRouter();

  // Helper function to format absolute image URL
  const toAbsoluteImageUrl = (url: string | undefined | null): string => {
    if (!url)
      return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url}`;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductCardItem[]>([]);
  const [searchResultsForMemebers, setSearchResultsForMemebers] = useState<
    MemebersCardItem[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchResultClick = useCallback((id: string | number) => {
    setSearchQuery("");
    setShowResults(false);
    router.push(`/products/${id}`);
  }, []);
  const handleMemberClick = useCallback((id: string | number) => {
    setSearchQuery("");
    setShowResults(false);
    router.push(`/member/${id}`);
  }, []);

  const handleSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowResults(false);
        router.push(`/Shop?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [router, searchQuery],
  );
  const { user, logout, requireLogin } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();
  const [loggedInUser, setLoggedInUser] = useState<{
    avatar?: { url?: string };
  } | null>(null);
  const [openSign, setOpenSign] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [cataOpen, setCataOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [selectedCata, setSelectedCata] = useState("Catalogue");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dispatch = useAppDispatch();
  const categoryTree = useAppSelector(
    (state: RootState) => state.categories.tree,
  );
  const categoriesStatus = useAppSelector(
    (state: RootState) => state.categories.status,
  );
  const categoriesLoading =
    categoriesStatus === "idle" || categoriesStatus === "loading";
  const menuCategories =
    categoryTree.length > 0 ? mapTreeToSubCategories(categoryTree) : [];

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchResultsForMemebers([]);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        if (selectedCata == "Catalogue") {
          const response = await searchProducts(searchQuery, 5);
          setSearchResults(response.items);
          setSearchResultsForMemebers([]);
          setShowResults(true);
        }
        if (selectedCata == "Members") {
          const response = await searchMemebers(searchQuery, 5);
          console.log(response);
          const result = response?.items;
          setSearchResultsForMemebers(result);
          setSearchResults([]);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setSearchResultsForMemebers([]);
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
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const fetchedUser = await getUserAvatr(Number(user.id));
        setLoggedInUser(fetchedUser);
      } catch {
        console.log("Failed to load profile data.");
      }
    };
    fetchData();
  }, [user?.id]);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const LangRef = useRef<HTMLDivElement | null>(null);

  // FIX 2: Removed the `if (isAndroid) return` guard so click-outside always
  // works for profile, notification, and lang dropdowns on all platforms.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }
      if (LangRef.current && !LangRef.current.contains(target)) {
        setLangOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isAndroid) return;
    if (categoriesStatus === "idle") {
      dispatch(fetchCatalogTree());
    }
  }, [categoriesStatus, dispatch, isAndroid]);

  if (!isReady) return null;
  if (isAndroid) {
    return <AndroidChrome />;
  }

  const languages = [
    // { code: "ES", label: "Español (Spanish)" },
    // { code: "FR", label: "Français (French)" },
    { code: "EN", label: "English (English)" },
    { code: "TH", label: "Thai (ThaiLand)" },
  ];

  const Catagory = [
    { code: "Catalogue", label: "Catalogue" },
    { code: "Members", label: "Members" },
  ];

  const handleSellNowClick = (
    event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (user) return;
    event.preventDefault();
    setMobileMenuOpen(false);
    requireLogin("Please log in first to start selling.");
  };

  return (
    <>
      <nav className="w-full border-b border-gray-200 bg-white">
        {/* Top bar */}
        <div className="border-b border-gray-300">
          <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2 ">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              {/* The Icon/Logo Box */}
              <div className="bg-[#fdfcfb] p-1 rounded-lg flex items-center justify-center">
                <ShoppingBag
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[#cb6f4d]"
                  strokeWidth={2.5}
                />
              </div>

              {/* The Text */}
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1816] tracking-tight">
                Reluv
              </h1>
            </Link>
            {/* Catalog dropdown (desktop + tablet) */}
            <div className="flex gap-0 w-[750px]">
              <div className="relative hidden sm:flex md:flex">
                <button
                  onClick={() => setCataOpen(!cataOpen)}
                  className="flex items-center font-semibold justify-between cursor-pointer bg-gray-100 px-4 py-2 border border-gray-200 rounded text-sm sm:w-36  hover:bg-gray-100"
                >
                  <span>{selectedCata}</span>
                  <svg
                    className={`w-5 h-5 ml-2 transition-transform duration-200 ${
                      cataOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {cataOpen && (
                  <div className="absolute right-0 mt-10 w-44 bg-white border border-gray-200 rounded shadow-lg z-20 py-2">
                    {Catagory.map((cat, idx) => (
                      <div key={cat.code}>
                        {idx !== 0 && (
                          <div className="border-t border-gray-100 mx-2" />
                        )}
                        <div
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedCata(cat.code);
                            setCataOpen(false);
                          }}
                        >
                          {cat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search bar (tablet + desktop) */}
              <div className="relative hidden sm:flex flex-1 items-center bg-gray-100 rounded-md px-3 py-2 border border-gray-200 ">
                <Search className="text-[#cb6f4d] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for items"
                  className="bg-transparent outline-none flex-1 px-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit(e);
                    }
                  }}
                />
                <Camera className="text-[#cb6f4d] w-5 h-5 cursor-pointer" />
                {showResults && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto z-50 mt-1">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Searching...
                      </div>
                    ) : searchResults.length === 0 &&
                      searchResultsForMemebers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No results
                      </div>
                    ) : (
                      <>
                        {/* 🔹 PRODUCTS */}
                        {searchResults.length > 0 && (
                          <div>
                            {searchResults.map((item) => (
                              <button
                                type="button"
                                key={`product-${item.id}`}
                                onClick={() => handleSearchResultClick(item.id)}
                                className="p-3 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 w-full text-left"
                              >
                                <img
                                  src={item.imageUrl || "/placeholder.jpg"}
                                  alt={item.item || item.brand}
                                  className="w-12 h-12 object-cover rounded"
                                />

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {item.brand || item.item}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {item.item}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="font-semibold text-sm">
                                    {item.price}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 🔹 MEMBERS */}
                        {searchResultsForMemebers.length > 0 && (
                          <div>
                            {searchResultsForMemebers.map((member) => (
                              <button
                                type="button"
                                key={`member-${member.id}`}
                                className="p-3 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 w-full text-left"
                              >
                                <img
                                  src={
                                    member.avatar
                                      ? `${API_BASE_URL}${member.avatar}`
                                      : "/avatar-placeholder.png"
                                  }
                                  alt={
                                    member?.fullName ||
                                    member?.username ||
                                    "avatar"
                                  }
                                  className="w-10 h-10 min-w-[40px] object-cover rounded-full"
                                />

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {member?.fullName || member?.username}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {member?.city}, {member?.country}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-0 sm:gap-3 md:gap-4 lg:gap-2">
              {/* Email */}
              {user && (
                <Link href={`/Messages`}>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                    <Mail className="w-6 h-6 text-gray-600" />
                  </button>
                </Link>
              )}
              {/* Notifications */}
              {user && (
                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative w-9 h-9 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-6 h-6 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] bg-[#cb6f4d] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden animate-fadeIn sm:max-w-none">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                        <span className="font-bold text-sm text-gray-900">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => markAllRead()}
                            className="text-xs text-[#cb6f4d] font-bold hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <BellOff
                              size={40}
                              strokeWidth={1.5}
                              className="text-gray-200 mb-3"
                            />
                            <p className="text-sm font-medium text-gray-400">
                              All caught up! No new notifications.
                            </p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                if (!n.read) markRead(n.id);
                                if (n.link) router.push(n.link);
                                setNotificationOpen(false);
                              }}
                              className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                                !n.read ? "bg-orange-50/50" : "bg-white"
                              }`}
                            >
                              {/* Status Dot */}
                              <div
                                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                  !n.read ? "bg-[#cb6f4d]" : "bg-transparent"
                                }`}
                              />

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm leading-snug truncate ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                                >
                                  {n.title}
                                </p>
                                {n.body && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {n.body}
                                  </p>
                                )}
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                  {new Date(n.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Mobile Footer to close */}
                      <div className="sm:hidden border-t border-gray-100 p-2 bg-gray-50">
                        <button
                          onClick={() => setNotificationOpen(false)}
                          className="w-full py-2 text-xs font-bold text-gray-500 uppercase tracking-widest"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Likes */}
              {user && (
                <Link href={`/FavItems`}>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                    <Heart className="w-6 h-6 text-gray-600" />
                  </button>
                </Link>
              )}
              {/* Profile Dropdown */}
              {user && (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 cursor-pointer overflow-hidden hover:bg-gray-100"
                  >
                    <img
                      src={toAbsoluteImageUrl(loggedInUser?.avatar?.url)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop";
                      }}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1">
                      {/* Profile */}
                      {/* FIX 1: Close profileOpen AND mobileMenuOpen on every profile menu item click */}
                      <Link href={`/member/${user?.id}`}>
                        <div
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setProfileOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <span>Profile</span>
                        </div>
                      </Link>
                      {/* Invite friends */}
                      <Link href={`/Referrals`}>
                        <div
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setProfileOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <span>Invite friends</span>
                        </div>
                      </Link>
                      {/* Settings */}
                      <Link href={`/setting`}>
                        <div
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setProfileOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <span>Settings</span>
                        </div>
                      </Link>
                      {/* My orders */}
                      <Link href={`/Orders`}>
                        <div
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setProfileOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <span>My orders / Offers</span>
                        </div>
                      </Link>
                      <div className="border-t border-gray-200 my-1" />

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          setMobileMenuOpen(false);
                        }}
                        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                      >
                        <LogOut size={16} />
                        <span>Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Desktop + Tablet Auth buttons */}
              {!user && (
                <button
                  onClick={() => setOpenSign(true)}
                  className="hidden sm:inline-block cursor-pointer text-[#cb6f4d] border border-[#cb6f4d] px-3 py-1.5 rounded text-sm"
                >
                  Sign up | Log in
                </button>
              )}
              <Link href={`/SellNow`} onClick={handleSellNowClick}>
                <button className="hidden sm:inline-block bg-[#cb6f4d] cursor-pointer text-white px-3 py-1.5 rounded-2xl text-sm">
                  + Sell Now
                </button>
              </Link>
              {/* Desktop + Tablet Language */}
              <div ref={LangRef} className="relative hidden sm:block">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="px-2 py-1 border cursor-pointer border-gray-200 rounded text-md hover:bg-gray-100"
                >
                  {selectedLang}
                </button>
                {langOpen && (
                  <div className="absolute left-0 mt-1 w-44 cursor-pointer bg-white border border-gray-300 rounded shadow-lg z-20 py-2">
                    {languages.map((lang, idx) => (
                      <div key={lang.code}>
                        {idx !== 0 && (
                          <div className="border-t border-gray-100 mx-2" />
                        )}
                        <div
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedLang(lang.code);
                            setLangOpen(false);
                          }}
                        >
                          {lang.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Hamburger for mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mega Menu */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4">
          <SubMenus
            subCategories={menuCategories}
            loading={categoriesLoading}
          />
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden w-full bg-white border-t border-gray-200 shadow-lg py-4 px-4">
            {/* Catalog + Search Row Container */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 px-1">
              {/* 1. Catalog Dropdown */}
              <div className="relative w-full sm:w-40 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCataOpen(!cataOpen)}
                  className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#cb6f4d] transition-all shadow-sm active:scale-95"
                >
                  <span className="truncate">{selectedCata || "Catalog"}</span>
                  <svg
                    className={`w-4 h-4 ml-2 shrink-0 transition-transform duration-300 ${
                      cataOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Catalog Menu Overlay */}
                {cataOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 border border-gray-100 rounded-xl shadow-xl bg-white z-[60] overflow-hidden animate-fadeIn">
                    {Catagory.map((cat) => (
                      <div
                        key={cat.code}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors border-b last:border-b-0 border-gray-50 ${
                          selectedCata === cat.code
                            ? "bg-orange-50 text-[#cb6f4d] font-bold"
                            : "hover:bg-gray-50 text-gray-600"
                        }`}
                        onClick={() => {
                          setSelectedCata(cat.code);
                          setCataOpen(false);
                        }}
                      >
                        {cat.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Search Container */}
              <div className="relative flex-1">
                <div className="flex items-center bg-gray-100 px-4 py-2.5 border border-transparent rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-[#cb6f4d]/20 focus-within:border-[#cb6f4d] transition-all shadow-sm">
                  <Search className="text-[#cb6f4d] w-5 h-5 shrink-0" />

                  <input
                    type="text"
                    placeholder="Search items or members..."
                    className="bg-transparent outline-none flex-1 px-3 text-sm sm:text-base w-full text-gray-700 placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit(e);
                      }
                    }}
                  />

                  <Camera className="text-[#cb6f4d] w-5 h-5 cursor-pointer shrink-0 hover:scale-110 transition-transform" />
                </div>

                {/* 3. Search Results Dropdown */}
                {showResults && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-[65vh] sm:max-h-96 overflow-y-auto z-50 mt-2 animate-fadeIn">
                    {searchLoading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#cb6f4d] mb-2"></div>
                        <p className="text-sm text-gray-500 font-medium">
                          Searching our catalog...
                        </p>
                      </div>
                    ) : searchResults.length === 0 &&
                      searchResultsForMemebers.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm italic">
                        No results found for "{searchQuery}"
                      </div>
                    ) : (
                      <div className="py-2">
                        {/* 🔹 PRODUCTS SECTION */}
                        {searchResults.length > 0 && (
                          <div className="mb-2">
                            <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                              Products
                            </div>
                            {searchResults.map((item) => (
                              <button
                                type="button"
                                key={`product-${item.id}`}
                                onClick={() => handleSearchResultClick(item.id)}
                                className="px-4 py-3 hover:bg-orange-50 flex items-center gap-4 w-full text-left transition-colors group"
                              >
                                <img
                                  src={item.imageUrl || "/placeholder.jpg"}
                                  alt={item.item}
                                  className="w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-100 group-hover:border-[#cb6f4d]/30"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#cb6f4d]">
                                    {item.brand || item.item}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate lowercase">
                                    {item.item}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-black text-[#cb6f4d] text-sm">
                                    {item.price}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 🔹 MEMBERS SECTION */}
                        {searchResultsForMemebers.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mt-2">
                              Members
                            </div>
                            {searchResultsForMemebers.map((member) => (
                              <button
                                type="button"
                                key={`member-${member.id}`}
                                className="px-4 py-3 hover:bg-orange-50 flex items-center gap-4 w-full text-left transition-colors group"
                              >
                                <img
                                  src={
                                    member.avatar
                                      ? `${API_BASE_URL}${member.avatar}`
                                      : "/avatar-placeholder.png"
                                  }
                                  alt={member?.username}
                                  className="w-10 h-10 min-w-[40px] object-cover rounded-full border-2 border-gray-100 group-hover:border-[#cb6f4d]/30"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#cb6f4d]">
                                    {member?.fullName || member?.username}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate uppercase tracking-tighter">
                                    {member?.city} • {member?.country}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Auth buttons */}
            {!user && (
              <div className="flex flex-col gap-2 mb-3">
                <button
                  onClick={() => setOpenSign(true)}
                  className="w-full px-4 py-2 border border-[#cb6f4d] text-[#cb6f4d] rounded text-sm"
                >
                  Sign up | Log in
                </button>
                <button
                  type="button"
                  onClick={handleSellNowClick}
                  className="w-full px-4 py-2 bg-[#cb6f4d] text-white rounded text-sm"
                >
                  Sell
                </button>
              </div>
            )}
            {/* Language selector */}
            <div className="relative mt-4">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#cb6f4d] transition-all shadow-sm active:scale-95"
              >
                <span className="truncate">Language: {selectedLang}</span>
                <svg
                  className={`w-4 h-4 ml-2 shrink-0 transition-transform duration-300 ${
                    langOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Language Dropdown Overlay */}
              {langOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-gray-100 rounded-xl shadow-xl bg-white z-[70] overflow-hidden animate-fadeIn">
                  <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                    Select Language
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {languages.map((lang) => (
                      <div
                        key={lang.code}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors border-b last:border-b-0 border-gray-50 ${
                          selectedLang === lang.code
                            ? "bg-orange-50 text-[#cb6f4d] font-bold"
                            : "hover:bg-gray-50 text-gray-600"
                        }`}
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setLangOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          {lang.label}
                          {selectedLang === lang.code && (
                            <span className="text-[#cb6f4d] text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Sub Categories with icons */}
            <div className="flex flex-col gap-2 mb-3">
              {menuCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/Shop?category=${encodeURIComponent(cat.slug || cat.label)}`}
                  className="cursor-pointer py-2 px-2 flex items-center gap-2 hover:text-[#cb6f4d] rounded"
                >
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      {openSign && <SignUpLogin onClose={() => setOpenSign(false)} />}
    </>
  );
}