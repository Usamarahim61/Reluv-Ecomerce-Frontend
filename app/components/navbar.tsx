"use client";
import { Search, Camera, HelpCircle } from "lucide-react";
import { useState } from "react";
import SignUpLogin from "./signUp-login";
import HelpComp from './helpComp';

export default function Navbar() {
  const [openSign, setOpenSign] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");

  const languages = [
    { code: "ES", label: "Español (Spanish)" },
    { code: "FR", label: "Français (French)" },
    { code: "EN", label: "English (English)" },
    { code: "NL", label: "Nederlands (Dutch)" },
  ];

  return (
    <>
      <nav className="w-full border-b bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 gap-4">
          <h1 className="text-2xl font-bold text-[#007782]">Reluv</h1>

          {/* Search Bar */}
          <div className="flex-1 flex items-center bg-gray-100 rounded-md px-3 py-2 border focus-within:border-gray-400">
            <Search className="text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for items"
              className="bg-transparent outline-none flex-1 px-2"
            />
            <Camera className="text-gray-400 w-5 h-5 cursor-pointer" />
          </div>

          {/* Buttons + Help + Language */}
          <div className="flex gap-4 items-center relative">
            <button
              onClick={() => setOpenSign(true)}
              className="text-[#007782] cursor-pointer border border-[#007782] px-4 py-1.5 rounded text-sm"
            >
              Sign up | Log in
            </button>
            <button
              onClick={() => setOpenSign(true)}
              className="bg-[#007782] text-white px-4 py-1.5 rounded text-sm cursor-pointer"
            >
              Sell now
            </button>

            {/* Help Circle Button */}
            <button
              onClick={() => setOpenHelp(true)}
              className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 cursor-pointer"
              >
                {selectedLang}
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10 py-2">
                  {languages.map((lang, idx) => (
                    <div key={lang.code}>
                      {idx !== 0 && (
                        <div className="border-t border-gray-200 mx-2" />
                      )}
                      <div
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          lang.code === selectedLang
                            ? "font-bold text-black"
                            : "text-gray-700"
                        }`}
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

        {/* Sub Navigation */}
        <div className="max-w-7xl mx-auto flex gap-6 px-4 py-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
          {["Women", "Men", "Designer", "Kids", "Home", "Electronics"].map(
            (cat) => (
              <span key={cat} className="cursor-pointer hover:underline">
                {cat}
              </span>
            ),
          )}
        </div>
      </nav>
      {openSign  && <SignUpLogin onClose={() => setOpenSign(false)} />}
      {openHelp  && <HelpComp onClose={() => setOpenHelp(false)} />}
    </>
  );
}
