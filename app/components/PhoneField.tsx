"use client";
import { useState, useEffect } from "react";

const COUNTRIES = [
  { code: "TH", dial: "+66", name: "Thailand" }
];

const BRAND = "#cb6f4d";

const getFlagUrl = (code: string) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

export interface PhoneFieldProps {
  value: string;
  onChange: (e164: string) => void;
  hasError?: boolean;
  placeholder?: string;
  defaultCountryCode?: string;
  width?: "full" | "auto" | string;
}

export default function PhoneField({
  value,
  onChange,
  hasError = false,
  placeholder = "812 345 678",
  defaultCountryCode = "TH",
  width = "full",
}: PhoneFieldProps) {
  const country =
    COUNTRIES.find((c) => c.code === defaultCountryCode) ?? COUNTRIES[0];

  const [localNumber, setLocalNumber] = useState("");

  /* ── Hydrate local number from incoming E.164 value ── */
  useEffect(() => {
    if (!value) return;
    if (value.startsWith(country.dial)) {
      setLocalNumber(value.slice(country.dial.length).trim());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNumberChange = (raw: string) => {
    const digits = raw.replace(/[^\d\s]/g, "");
    setLocalNumber(digits);
    onChange(digits.trim() ? `${country.dial}${digits.replace(/\s/g, "")}` : "");
  };

  const borderColor = hasError ? "#ef4444" : BRAND;
  const resolvedWidth = width === "full" ? "100%" : width === "auto" ? "auto" : width;

  return (
    <div style={{ position: "relative", width: resolvedWidth }}>
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
          overflow: "hidden",
        }}
      >
        {/* ── Country display (non-interactive) ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "0 10px 0 14px",
            height: "100%",
            background: "transparent",
            flexShrink: 0,
          }}
        >
          {/* Flag */}
          <div style={{
            display: "flex",
            alignItems: "center",
            width: "22px",
            height: "16px",
            overflow: "hidden",
            borderRadius: "2px",
            boxShadow: "0 0 1px rgba(0,0,0,0.2)",
          }}>
            <img
              src={getFlagUrl(country.code)}
              alt={country.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <span style={{
            fontSize: "14px",
            fontWeight: 700,
            color: BRAND,
            letterSpacing: "0.02em",
            display: "inline-flex",
            alignItems: "center",
          }}>
            {country.code} {country.dial}
          </span>
        </div>

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
    </div>
  );
}