"use client";
import { useState, useEffect, useRef } from "react";

/* ─────────────── Country list ─────────────── */
const COUNTRIES = [
  { code: "TH", dial: "+66",  name: "Thailand" },
  { code: "AF", dial: "+93",  name: "Afghanistan" },
  { code: "AL", dial: "+355", name: "Albania" },
  { code: "DZ", dial: "+213", name: "Algeria" },
  { code: "AR", dial: "+54",  name: "Argentina" },
  { code: "AU", dial: "+61",  name: "Australia" },
  { code: "AT", dial: "+43",  name: "Austria" },
  { code: "BD", dial: "+880", name: "Bangladesh" },
  { code: "BE", dial: "+32",  name: "Belgium" },
  { code: "BR", dial: "+55",  name: "Brazil" },
  { code: "CA", dial: "+1",   name: "Canada" },
  { code: "CN", dial: "+86",  name: "China" },
  { code: "CO", dial: "+57",  name: "Colombia" },
  { code: "HR", dial: "+385", name: "Croatia" },
  { code: "CZ", dial: "+420", name: "Czech Republic" },
  { code: "DK", dial: "+45",  name: "Denmark" },
  { code: "EG", dial: "+20",  name: "Egypt" },
  { code: "FI", dial: "+358", name: "Finland" },
  { code: "FR", dial: "+33",  name: "France" },
  { code: "DE", dial: "+49",  name: "Germany" },
  { code: "GH", dial: "+233", name: "Ghana" },
  { code: "GR", dial: "+30",  name: "Greece" },
  { code: "HK", dial: "+852", name: "Hong Kong" },
  { code: "HU", dial: "+36",  name: "Hungary" },
  { code: "IN", dial: "+91",  name: "India" },
  { code: "ID", dial: "+62",  name: "Indonesia" },
  { code: "IE", dial: "+353", name: "Ireland" },
  { code: "IL", dial: "+972", name: "Israel" },
  { code: "IT", dial: "+39",  name: "Italy" },
  { code: "JP", dial: "+81",  name: "Japan" },
  { code: "JO", dial: "+962", name: "Jordan" },
  { code: "KE", dial: "+254", name: "Kenya" },
  { code: "KR", dial: "+82",  name: "South Korea" },
  { code: "KW", dial: "+965", name: "Kuwait" },
  { code: "MY", dial: "+60",  name: "Malaysia" },
  { code: "MX", dial: "+52",  name: "Mexico" },
  { code: "MA", dial: "+212", name: "Morocco" },
  { code: "NL", dial: "+31",  name: "Netherlands" },
  { code: "NZ", dial: "+64",  name: "New Zealand" },
  { code: "NG", dial: "+234", name: "Nigeria" },
  { code: "NO", dial: "+47",  name: "Norway" },
  { code: "OM", dial: "+968", name: "Oman" },
  { code: "PK", dial: "+92",  name: "Pakistan" },
  { code: "PH", dial: "+63",  name: "Philippines" },
  { code: "PL", dial: "+48",  name: "Poland" },
  { code: "PT", dial: "+351", name: "Portugal" },
  { code: "QA", dial: "+974", name: "Qatar" },
  { code: "RO", dial: "+40",  name: "Romania" },
  { code: "RU", dial: "+7",   name: "Russia" },
  { code: "SA", dial: "+966", name: "Saudi Arabia" },
  { code: "SG", dial: "+65",  name: "Singapore" },
  { code: "ZA", dial: "+27",  name: "South Africa" },
  { code: "ES", dial: "+34",  name: "Spain" },
  { code: "LK", dial: "+94",  name: "Sri Lanka" },
  { code: "SE", dial: "+46",  name: "Sweden" },
  { code: "CH", dial: "+41",  name: "Switzerland" },
  { code: "TW", dial: "+886", name: "Taiwan" },
  { code: "TR", dial: "+90",  name: "Turkey" },
  { code: "AE", dial: "+971", name: "UAE" },
  { code: "GB", dial: "+44",  name: "United Kingdom" },
  { code: "US", dial: "+1",   name: "United States" },
  { code: "VN", dial: "+84",  name: "Vietnam" },
];

const BRAND   = "#cb6f4d";
const HOVER   = "#f5e6df";   // very light tint of brand
const SELECTED_BG = "#cb6f4d";

/* ─────────────── Helper to fetch SVG flag images ─────────────── */
const getFlagUrl = (code: string) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

/* ─────────────── Types ─────────────── */
export interface PhoneFieldProps {
  value: string;
  onChange: (e164: string) => void;
  hasError?: boolean;
  placeholder?: string;
  defaultCountryCode?: string; // e.g. "TH"
  width?: "full" | "auto" | string;
}

/* ─────────────── Component ─────────────── */
export default function PhoneField({
  value,
  onChange,
  hasError = false,
  placeholder = "812 345 678",
  defaultCountryCode = "TH",
  width = "full",
}: PhoneFieldProps) {
  const defaultCountry =
    COUNTRIES.find((c) => c.code === defaultCountryCode) ?? COUNTRIES.find((c) => c.code === "TH")!;

  const [selected, setSelected]     = useState(defaultCountry);
  const [localNumber, setLocalNumber] = useState("");
  const [open, setOpen]             = useState(false);
  const [search, setSearch]         = useState("");
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  /* ── Hydrate local number from incoming E.164 value ── */
  useEffect(() => {
    if (!value) return;
    const match = COUNTRIES.find((c) => value.startsWith(c.dial));
    if (match) {
      setSelected(match);
      setLocalNumber(value.slice(match.dial.length).trim());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Focus search when dropdown opens ── */
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const handleNumberChange = (raw: string) => {
    const digits = raw.replace(/[^\d\s]/g, "");
    setLocalNumber(digits);
    onChange(digits.trim() ? `${selected.dial}${digits.replace(/\s/g, "")}` : "");
  };

  const handleSelectCountry = (country: typeof COUNTRIES[0]) => {
    setSelected(country);
    setOpen(false);
    setSearch("");
    onChange(localNumber.trim() ? `${country.dial}${localNumber.replace(/\s/g, "")}` : "");
  };

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const borderColor = hasError ? "#ef4444" : BRAND;
  const resolvedWidth = width === "full" ? "100%" : width === "auto" ? "auto" : width;

  return (
    <div style={{ position: "relative", width: resolvedWidth }} ref={dropdownRef}>
      {/* ── Main input row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "48px",
          background: "#ffffff",
          border: `1.5px solid ${borderColor}`,
          borderRadius: "10px",
          transition: "box-shadow 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* ── Country trigger ── */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "0 10px 0 14px",
            height: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            outline: "none",
          }}
        >
          {/* Flag Image Container */}
          <div style={{ display: "flex", alignItems: "center", width: "22px", height: "16px", overflow: "hidden", borderRadius: "2px", boxShadow: "0 0 1px rgba(0,0,0,0.2)" }}>
            <img 
              src={getFlagUrl(selected.code)} 
              alt={selected.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <span style={{ fontSize: "14px", fontWeight: 700, color: BRAND, letterSpacing: "0.02em", display: "inline-flex", alignItems: "center" }}>
            {selected.code} {selected.dial}
          </span>

          {/* chevron */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              color: BRAND,
              flexShrink: 0,
              display: "block"
            }}
          >
            <path d="M2 4L6 8L10 4" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* ── Divider ── */}
        <div style={{ width: "1px", height: "24px", background: "#e5e7eb", flexShrink: 0 }} />

        {/* ── Number input ── */}
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            padding: "0 16px",
            fontSize: "15px",
            color: "#374151",
            background: "transparent",
            border: "none",
            outline: "none",
          }}
        />
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 9999,
            width: "280px",
            background: "#ffffff",
            border: `1.5px solid #f0e0d8`,
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(203,111,77,0.13), 0 2px 8px rgba(0,0,0,0.07)",
            overflow: "hidden",
            animation: "phoneDropIn 0.15s ease",
          }}
        >
          <style>{`
            @keyframes phoneDropIn {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .phone-opt::-webkit-scrollbar { width: 4px; }
            .phone-opt::-webkit-scrollbar-track { background: transparent; }
            .phone-opt::-webkit-scrollbar-thumb { background: #f0d4c8; border-radius: 4px; }
          `}</style>

          {/* Search */}
          <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #faeae3" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#fdf5f1",
                border: `1px solid #f0d4c8`,
                borderRadius: "8px",
                padding: "0 10px",
                height: "36px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6" cy="6" r="4.5" stroke={BRAND} strokeWidth="1.5" />
                <path d="M9.5 9.5L12 12" stroke={BRAND} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "13px",
                  color: "#374151",
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#9ca3af", display: "flex", alignItems: "center" }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div
            className="phone-opt"
            style={{ maxHeight: "240px", overflowY: "auto", padding: "6px 0" }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: "13px", color: "#9ca3af" }}>
                No results
              </div>
            ) : (
              filtered.map((country) => {
                const isSelected = country.code === selected.code;
                const isHovered  = hoveredCode === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    onMouseEnter={() => setHoveredCode(country.code)}
                    onMouseLeave={() => setHoveredCode(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "8px 14px",
                      border: "none",
                      cursor: "pointer",
                      background: isSelected
                        ? SELECTED_BG
                        : isHovered
                        ? HOVER
                        : "transparent",
                      transition: "background 0.12s ease",
                      textAlign: "left",
                    }}
                  >
                    {/* Dropdown Flag Image */}
                    <div style={{ display: "flex", alignItems: "center", width: "20px", height: "14px", overflow: "hidden", borderRadius: "2px", flexShrink: 0, boxShadow: "0 0 1px rgba(0,0,0,0.15)" }}>
                      <img 
                        src={getFlagUrl(country.code)} 
                        alt={country.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <span
                      style={{
                        flex: 1,
                        fontSize: "13px",
                        fontWeight: 500,
                        color: isSelected ? "#ffffff" : "#374151",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {country.name}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: isSelected ? "rgba(255,255,255,0.85)" : BRAND,
                        flexShrink: 0,
                      }}
                    >
                      {country.dial}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}