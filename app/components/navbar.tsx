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
} from "lucide-react";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import SignUpLogin from "./signUp-login";
import { SubMenus } from "./SubMenus";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCatalogTree } from "@/lib/features/categoriesSlice";
import { mapTreeToSubCategories } from "@/lib/categoryUtils";
import { useAuth } from "@/context/AuthContext";
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
import { getUserAvatarUrl } from "@/lib/user-profile";

export default function Navbar() {
  const { isAndroid, isReady } = useAndroidNative();
  const router = useRouter();

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

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/Shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, []);
  const { user, logout, requireLogin } = useAuth();
  let LoggedInUser = user;
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const profileAvatarUrl =
    getUserAvatarUrl(loggedInUser) ||
    getUserAvatarUrl(user) ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop";
  const [openSign, setOpenSign] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [cataOpen, setCataOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [selectedCata, setSelectedCata] = useState("Catalogue");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dispatch = useAppDispatch();
  const categoryTree = useAppSelector((state: any) => state.categories.tree);
  const categoriesStatus = useAppSelector(
    (state: any) => state.categories.status,
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

  useEffect(() => {
    if (isAndroid) return;
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
  }, [isAndroid]);

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
            <Link href="/">
              <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-[#cb6f4d] font-serif">
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
                      handleSearchSubmit(e as any);
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
                                  alt={member?.fullName || member?.username || "avatar"}
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
            <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Email */}
              {user && (
                <Link href={`/Messages`}>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                    <Mail className="w-6 h-6 text-gray-600" />
                  </button>
                </Link>
              )}
              {/* Notifications */}
              {/* <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
              <Bell className="w-6 h-6 text-gray-600" />
             </button> */}
              {user && (
                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="w-9 h-9 flex items-center justify-center rounded-full  cursor-pointer overflow-hidden hover:bg-gray-100"
                  >
                    {/* Avatar / fallback icon */}
                    <Bell className="w-6 h-6 text-gray-600" />
                  </button>

                  {notificationOpen && (
                    <div className="absolute left-[-100] mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1">
                      {/* Profile */}
                      <div className="cursor-pointer flex items-center gap-2">
                        <div className="flex flex-col items-center justify-center min-h-[80px] p-8 text-center">
                          {/* Icon Container */}
                          <div className="relative mb-4">
                            <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-50" />
                            <BellOff
                              size={40}
                              strokeWidth={1}
                              className="relative text-indigo-500 animate-pulse"
                            />
                          </div>

                          {/* Text Content */}
                          <p className="text-xl font-semibold text-gray-900">
                            No notifications yet
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Likes */}
              {/* {user && (
                <Link href={`/products/2`}>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                    <Heart className="w-6 h-6 text-gray-600" />
                  </button>
                </Link>
              )} */}
              {/* Profile Dropdown */}
              {user && (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 cursor-pointer overflow-hidden hover:bg-gray-100"
                  >
                    {/* Avatar from backend */}
                    <img
                      src={profileAvatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop";
                      }}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1">
                      {/* Profile */}
                      <Link href={`/member/${user?.id}`}>
                        <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                          <span>Profile</span>
                        </div>
                      </Link>
                      {/* Invite friends */}
                      <Link href={`/Referrals`}>
                        <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                          <span>Invite friends</span>
                        </div>
                      </Link>
                      {/* Settings */}
                      <Link href={`/setting`}>
                        <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                          <span>Settings</span>
                        </div>
                      </Link>
                      {/* Personalization */}
                      {/* <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                      <span>Personalization</span>
                    </div> */}
                      {/* Balance */}
                      {/* <Link href={`/Balance`}>
                        <div className="px-4 py-2 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            Balance
                          </span>
                          <span className="font-semibold text-sm">$0.00</span>
                        </div>
                      </Link> */}
                      {/* My orders */}
                      <Link href={`/Orders`}>
                        <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                          <span>My orders / Offers</span>
                        </div>
                      </Link>
                      <div className="border-t border-gray-200 my-1" />

                      {/* Logout */}
                      <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 text-red-600">
                        <span onClick={logout}>Log out</span>
                      </div>
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
                <button className="hidden sm:inline-block bg-[#cb6f4d] cursor-pointer text-white px-3 py-1.5 rounded text-sm">
                  Sell Now
                </button>
              </Link>
              {/* Desktop + Tablet Help */}
              <Link href={`/help`}>
                <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100">
                  <HelpCircle className="w-7 h-7 text-gray-600" />
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
            {/* Catalog + Search Row */}
            <div className="flex gap-2 mb-3">
              {/* Catalog */}
              <div className="relative flex-shrink-0 w-32">
                <button
                  onClick={() => setCataOpen(!cataOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 border border-gray-200 rounded text-sm"
                >
                  <span>{selectedCata}</span>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
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
                  <div className="mt-2 border border-gray-200 rounded shadow-md bg-white">
                    {Catagory.map((cat) => (
                      <div
                        key={cat.code}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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

              {/* Search */}
              <div className="flex-1 flex items-center bg-gray-100 px-3 py-2 border border-gray-200 rounded-md">
                <Search className="text-[#cb6f4d] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items"
                  className="bg-transparent outline-none flex-1 px-2"
                />
                <Camera className="text-[#cb6f4d] w-5 h-5 cursor-pointer" />
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
            <div className="relative mt-2">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="w-full px-4 py-2 border border-gray-200 rounded text-sm text-center"
              >
                Language: {selectedLang}
              </button>
              {langOpen && (
                <div className="mt-2 border border-gray-200 rounded shadow-md bg-white">
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedLang(lang.code);
                        setLangOpen(false);
                      }}
                    >
                      {lang.label}
                    </div>
                  ))}
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

