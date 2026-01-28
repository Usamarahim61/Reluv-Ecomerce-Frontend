"use client";
import { Search, Camera, HelpCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import SignUpLogin from "./signUp-login";
import HelpComp from "./helpComp";
import { SubMenus } from "./SubMenus"; 
import { subCategories, SubCategoryItem } from "../constants/subCatagories"; 
import Link from "next/link";

export default function Navbar() {
  const [openSign, setOpenSign] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [cataOpen, setCataOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [selectedCata, setSelectedCata] = useState("Catalogue");

  const languages = [
    { code: "ES", label: "Español (Spanish)" },
    { code: "FR", label: "Français (French)" },
    { code: "EN", label: "English (English)" },
    { code: "NL", label: "Nederlands (Dutch)" },
  ];

  const Catagory = [
    { code: "Catalogue", label: "Catalogue" },
    { code: "Members", label: "Members" },
  ];
  return (
    <>
      <nav className="w-full border-b border-gray-200 bg-white">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-3">
          {/* Logo */}
           <Link href="/">
          <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-[#007782]">
            Reluv
          </h1>
          </Link>
          {/* Catalog dropdown (desktop + tablet) */}
          <div className="relative hidden sm:flex md:flex">
            <button
              onClick={() => setCataOpen(!cataOpen)}
              className="flex items-center font-semibold justify-between cursor-pointer bg-gray-100 px-4 py-2 border border-gray-200 rounded text-sm sm:w-36 md:w-44 hover:bg-gray-100"
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
                    {idx !== 0 && <div className="border-t border-gray-100 mx-2" />}
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
          <div className="hidden sm:flex flex-1 items-center bg-gray-100 rounded-md px-3 py-2 border border-gray-200 sm:ml-2">
            <Search className="text-[#007782] w-5 h-5" />
            <input
              type="text"
              placeholder="Search for items"
              className="bg-transparent outline-none flex-1 px-2"
            />
            <Camera className="text-[#007782] w-5 h-5 cursor-pointer" />
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
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

            {/* Desktop + Tablet Auth buttons */}
            <button
              onClick={() => setOpenSign(true)}
              className="hidden sm:inline-block cursor-pointer text-[#007782] border border-[#007782] px-3 py-1.5 rounded text-sm"
            >
              Sign up | Log in
            </button>
            <button
              onClick={() => setOpenSign(true)}
              className="hidden sm:inline-block bg-[#007782] cursor-pointer text-white px-3 py-1.5 rounded text-sm"
            >
              Sell
            </button>

            {/* Desktop + Tablet Help */}
            <button
              onClick={() => setOpenHelp(true)}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <HelpCircle className="w-7 h-7 text-gray-600" />
            </button>

            {/* Desktop + Tablet Language */}
            <div className="relative hidden sm:block">
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
                      {idx !== 0 && <div className="border-t border-gray-100 mx-2" />}
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
        </div>

        {/* Mega Menu */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4">
          <SubMenus subCategories={subCategories} />
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
                <Search className="text-[#007782] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items"
                  className="bg-transparent outline-none flex-1 px-2"
                />
                <Camera className="text-[#007782] w-5 h-5 cursor-pointer" />
              </div>
            </div>

            {/* Auth buttons */}
            <div className="flex flex-col gap-2 mb-3">
              <button
                onClick={() => setOpenSign(true)}
                className="w-full px-4 py-2 border border-[#007782] text-[#007782] rounded text-sm"
              >
                Sign up | Log in
              </button>
              <button className="w-full px-4 py-2 bg-[#007782] text-white rounded text-sm">
                Sell
              </button>
            </div>

            {/* Sub Categories with icons */}
            <div className="flex flex-col gap-2 mb-3">
              {subCategories.map((cat) => (
                <div
                  key={cat.label}
                  className="cursor-pointer py-2 px-2 flex items-center gap-2 hover:bg-gray-100 rounded"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>

            {/* Language selector */}
            <div className="relative mt-2">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="w-full px-4 py-2 border border-gray-200 rounded text-sm text-left"
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
          </div>
        )}
      </nav>

      {openSign && <SignUpLogin onClose={() => setOpenSign(false)} />}
      {openHelp && <HelpComp onClose={() => setOpenHelp(false)} />}
    </>
  );
}

