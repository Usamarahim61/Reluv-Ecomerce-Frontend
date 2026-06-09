"use client";
import React, { JSX, useState } from "react";
import { X, Info, ChevronRight, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BankAccountPayload {
  accountHolder: string;
  iban: string;
  billingAddress?: BillingAddress;
}

interface BillingAddress {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}

interface AddBankAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bank: BankAccountPayload) => void;
}

// ─── IBAN Helpers ─────────────────────────────────────────────────────────────

// Formats raw input as groups of 4: "GB29NWBK60161331926819" → "GB29 NWBK 6016 1331 9268 19"
function formatIBAN(raw: string): string {
  const clean = raw.replace(/\s/g, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") ?? clean;
}

// Basic structural IBAN check (country prefix + 2 check digits + up to 30 alphanum)
function validateIBAN(raw: string): string | null {
  const clean = raw.replace(/\s/g, "").toUpperCase();
  if (clean.length < 15) return "IBAN is too short";
  if (clean.length > 34) return "IBAN is too long";
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(clean))
    return "IBAN format is invalid — should start with a 2-letter country code";

  // Mod-97 checksum
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged
    .split("")
    .map((c) => (c >= "A" ? (c.charCodeAt(0) - 55).toString() : c))
    .join("");

  let remainder = 0;
  for (const chunk of numeric.match(/.{1,9}/g) ?? []) {
    remainder = parseInt(String(remainder) + chunk, 10) % 97;
  }

  if (remainder !== 1) return "IBAN checksum is invalid — please double-check the number";
  return null;
}

// ─── Country List ─────────────────────────────────────────────────────────────

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Australia", "Austria", "Bahrain",
  "Bangladesh", "Belgium", "Brazil", "Canada", "China", "Croatia", "Cyprus",
  "Czech Republic", "Denmark", "Egypt", "Estonia", "Finland", "France",
  "Germany", "Greece", "Hungary", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kuwait",
  "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia", "Malta",
  "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway",
  "Oman", "Pakistan", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Saudi Arabia", "Singapore", "Slovakia", "Slovenia",
  "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Thailand",
  "Tunisia", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Vietnam",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddBankAccount({
  isOpen,
  onClose,
  onSave,
}: AddBankAccountProps): JSX.Element | null {
  const [accountHolder, setAccountHolder] = useState("");
  const [iban, setIban] = useState("");
  const [ibanError, setIbanError] = useState<string | null>(null);
  const [ibanTouched, setIbanTouched] = useState(false);

  const [showAddress, setShowAddress] = useState(false);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    setIban(formatIBAN(raw));
    if (ibanTouched) setIbanError(validateIBAN(raw));
    if (errors.iban) setErrors((p) => ({ ...p, iban: "" }));
  };

  const handleIbanBlur = () => {
    setIbanTouched(true);
    setIbanError(validateIBAN(iban.replace(/\s/g, "")));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!accountHolder.trim())
      newErrors.accountHolder = "Account holder's name is required";

    const ibanClean = iban.replace(/\s/g, "");
    const ibanValidation = validateIBAN(ibanClean);
    if (ibanValidation) newErrors.iban = ibanValidation;

    if (showAddress) {
      if (!line1.trim()) newErrors.line1 = "Street address is required";
      if (!city.trim()) newErrors.city = "City is required";
      if (!postalCode.trim()) newErrors.postalCode = "Postal code is required";
      if (!country) newErrors.country = "Please select a country";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const payload: BankAccountPayload = {
        accountHolder: accountHolder.trim(),
        iban: iban.replace(/\s/g, ""),
        ...(showAddress && {
          billingAddress: { line1, line2, city, postalCode, country },
        }),
      };
      onSave(payload);
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAccountHolder("");
    setIban("");
    setIbanError(null);
    setIbanTouched(false);
    setShowAddress(false);
    setLine1(""); setLine2(""); setCity(""); setPostalCode(""); setCountry("");
    setErrors({});
    onClose();
  };

  const inputBase =
    "w-full border-b border-gray-200 py-1.5 focus:outline-none focus:border-[#cb6f4d] text-sm text-gray-900 bg-transparent transition-colors placeholder:text-gray-300";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-gray-50 rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">

        {/* ── Account Details ─────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Account details</h3>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-7">

            {/* Account holder */}
            <div>
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
                <label className="font-semibold text-gray-900 text-sm md:min-w-[200px] md:pt-1.5">
                  Account holder's name
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="e.g. Alex Peterson"
                    value={accountHolder}
                    onChange={(e) => {
                      setAccountHolder(e.target.value);
                      if (errors.accountHolder)
                        setErrors((p) => ({ ...p, accountHolder: "" }));
                    }}
                    className={inputBase}
                  />
                  {errors.accountHolder && (
                    <p className="text-xs text-red-500 mt-1">{errors.accountHolder}</p>
                  )}
                </div>
              </div>
            </div>

            {/* IBAN */}
            <div>
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
                <div className="md:min-w-[200px]">
                  <label className="font-semibold text-gray-900 text-sm">IBAN</label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    International Bank Account Number
                  </p>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                      value={iban}
                      onChange={handleIbanChange}
                      onBlur={handleIbanBlur}
                      className={`${inputBase} pr-6 uppercase tracking-wider font-mono`}
                      maxLength={42} // 34 chars + up to 8 spaces
                    />
                    <Info className="absolute right-0 bottom-2 w-4 h-4 text-gray-400" />
                  </div>
                  {(ibanError || errors.iban) && (
                    <p className="text-xs text-red-500 mt-1">
                      {ibanError ?? errors.iban}
                    </p>
                  )}
                  {!ibanError && ibanTouched && iban.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">✓ IBAN looks valid</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    Your IBAN is printed on your bank statement or found in your online banking portal.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Billing Address ─────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-3">
          <button
            onClick={() => setShowAddress((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 text-left">Billing address</p>
              <p className="text-xs text-gray-400 text-left mt-0.5">
                {showAddress ? "Collapse" : "Add billing address (optional)"}
              </p>
            </div>
            {showAddress ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            )}
          </button>

          {showAddress && (
            <div className="px-6 pb-6 space-y-5 border-t border-gray-100">
              <div className="pt-5 space-y-5">

                {/* Line 1 */}
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">
                    Street address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12 Baker Street"
                    value={line1}
                    onChange={(e) => {
                      setLine1(e.target.value);
                      if (errors.line1) setErrors((p) => ({ ...p, line1: "" }));
                    }}
                    className={inputBase}
                  />
                  {errors.line1 && (
                    <p className="text-xs text-red-500 mt-1">{errors.line1}</p>
                  )}
                </div>

                {/* Line 2 */}
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 4B"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className={inputBase}
                  />
                </div>

                {/* City + Postal */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium block mb-1">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. London"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) setErrors((p) => ({ ...p, city: "" }));
                      }}
                      className={inputBase}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium block mb-1">
                      Postal code <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SW1A 1AA"
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value.toUpperCase());
                        if (errors.postalCode)
                          setErrors((p) => ({ ...p, postalCode: "" }));
                      }}
                      className={inputBase}
                    />
                    {errors.postalCode && (
                      <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (errors.country)
                        setErrors((p) => ({ ...p, country: "" }));
                    }}
                    className="w-full border-b border-gray-200 py-1.5 focus:outline-none focus:border-[#cb6f4d] text-sm text-gray-900 bg-transparent transition-colors appearance-none"
                  >
                    <option value="" disabled>Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-400 max-w-sm leading-relaxed">
            We never share your personal details with anyone other than our payment
            provider for your withdrawals, or unless legally required.
          </p>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#cb6f4d] hover:bg-[#b5603f] disabled:opacity-60 text-white px-10 py-2.5 rounded font-bold text-sm transition-colors whitespace-nowrap"
          >
            {loading ? "Saving..." : "Save account"}
          </button>
        </div>

      </div>
    </div>
  );
}