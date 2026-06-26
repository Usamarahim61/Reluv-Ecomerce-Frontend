"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  TH_PROVINCES,
  TH_DISTRICTS,
  getDistrictsByProvince,
  type District,
  type Subdistrict,
} from "../constants/thailand-location";
import subdistrictsData from "../constants/subdistricts.json";

const ALL_SUBDISTRICTS = subdistrictsData as Subdistrict[];

const getSubdistrictsByDistrict = (districtCode: number): Subdistrict[] =>
  ALL_SUBDISTRICTS.filter((s) => s.districtCode === districtCode);

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ThaiAddress {
  addressLine1: string;
  addressLine2: string;
  provinceCode: number;
  districtCode: number;
  subdistrictCode: number;
  postalCode: string;
  city: string; // synced to province name for Strapi compat
}

export const emptyThaiAddress: ThaiAddress = {
  addressLine1: "",
  addressLine2: "",
  provinceCode: 0,
  districtCode: 0,
  subdistrictCode: 0,
  postalCode: "",
  city: "",
};

/**
 * Formats a ThaiAddress into a single human-readable string.
 * e.g. "99/1 Soi 11, Ko Chang, Koh Chang, Trat, 23130, THAILAND"
 */
export function formatThaiAddress(addr: ThaiAddress): string {
  if (!addr.addressLine1?.trim() && !addr.addressLine2?.trim()) {
    return "";
  }
  const province = TH_PROVINCES.find(
    (p) => p.provinceCode === addr.provinceCode,
  );
  const district = TH_DISTRICTS.find(
    (d) => d.districtCode === addr.districtCode,
  );
  const subdistrict = ALL_SUBDISTRICTS.find(
    (s) => s.subdistrictCode === addr.subdistrictCode,
  );

  const parts = [
    addr.addressLine1,
    addr.addressLine2,
    subdistrict?.subdistrictNameEn ?? "",
    district?.districtNameEn ?? "",
    province?.provinceNameEn ?? "",
    addr.postalCode,
    province || addr.postalCode ? "THAILAND" : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "";
}

/**
 * Converts raw API user data (where codes may arrive as strings) into a
 * typed ThaiAddress and pre-populates the cascading district/subdistrict lists.
 */
export function hydrateThaiAddress(userData: {
  addressLine1?: string | null;
  addressLine2?: string | null;
  provinceCode?: string | number | null;
  districtCode?: string | number | null;
  subdistrictCode?: string | number | null;
  postalCode?: string | null;
  city?: string | null;
}): ThaiAddress {
  return {
    addressLine1: userData.addressLine1 ?? "",
    addressLine2: userData.addressLine2 ?? "",
    provinceCode: Number(userData.provinceCode) || 0,
    districtCode: Number(userData.districtCode) || 0,
    subdistrictCode: Number(userData.subdistrictCode) || 0,
    postalCode: userData.postalCode ?? "",
    city: userData.city ?? "",
  };
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface ThaiAddressModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Called when the user dismisses the modal without saving */
  onClose: () => void;
  /**
   * Called when the user submits the form.
   * Receives the fully validated ThaiAddress.
   */
  onSave: (address: ThaiAddress) => void;
  /** Initial values pre-filled into the form (e.g. from API) */
  initialAddress?: ThaiAddress;
  /** Optional title override */
  title?: string;
  /** Label for the submit button */
  submitLabel?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  initialAddress = emptyThaiAddress,
  title = "Edit Address",
  submitLabel = "Apply Changes",
}: ThaiAddressModalProps) {
  const [form, setForm] = useState<ThaiAddress>(initialAddress);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [success, setSuccess] = useState(false);

  // Sync form when initialAddress changes (e.g. after API fetch)
  useEffect(() => {
    setForm(initialAddress);
    if (initialAddress.provinceCode) {
      setDistricts(getDistrictsByProvince(initialAddress.provinceCode));
    }
    if (initialAddress.districtCode) {
      setSubdistricts(getSubdistrictsByDistrict(initialAddress.districtCode));
    }
  }, [initialAddress]);

  // Reset success flag when modal reopens
  useEffect(() => {
    if (isOpen) setSuccess(false);
  }, [isOpen]);

  // Cascade: province → districts
  useEffect(() => {
    if (form.provinceCode) {
      setDistricts(getDistrictsByProvince(form.provinceCode));
    } else {
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [form.provinceCode]);

  // Cascade: district → subdistricts
  useEffect(() => {
    if (form.districtCode) {
      setSubdistricts(getSubdistrictsByDistrict(form.districtCode));
    } else {
      setSubdistricts([]);
    }
  }, [form.districtCode]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    const province = TH_PROVINCES.find((p) => p.provinceCode === code);
    setForm((prev) => ({
      ...prev,
      provinceCode: code,
      districtCode: 0,
      subdistrictCode: 0,
      postalCode: "",
      city: province?.provinceNameEn ?? "",
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      districtCode: code,
      subdistrictCode: 0,
      postalCode: "",
    }));
  };

  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    const sub = ALL_SUBDISTRICTS.find((s) => s.subdistrictCode === code);
    setForm((prev) => ({
      ...prev,
      subdistrictCode: code,
      postalCode: sub ? String(sub.postalCode) : "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setSuccess(false);
    }, 600);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[95vh]">
        {/* Header */}
        <div className="relative p-4 border-b border-gray-100 flex items-center justify-center shrink-0">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 flex-1"
        >
          {/* Address Line 1 */}
          <Field label="House / Building No., Street / Soi">
            <input
              type="text"
              value={form.addressLine1}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, addressLine1: e.target.value }))
              }
              placeholder="e.g. 99/1 Moo 5, Sukhumvit Soi 11"
              className="field-input"
              required
            />
          </Field>

          {/* Address Line 2 */}
          <Field
            label={
              <>
                Address Line 2{" "}
                <span className="text-gray-300">(optional)</span>
              </>
            }
          >
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, addressLine2: e.target.value }))
              }
              placeholder="Floor, unit, landmark…"
              className="field-input"
            />
          </Field>

          {/* Province */}
          <Field label="Province">
            <select
              value={form.provinceCode || ""}
              onChange={handleProvinceChange}
              className="field-input"
              required
            >
              <option value="">Select province</option>
              {TH_PROVINCES.map((p) => (
                <option key={p.provinceCode} value={p.provinceCode}>
                  {p.provinceNameEn} ({p.provinceNameTh})
                </option>
              ))}
            </select>
          </Field>

          {/* District */}
          <Field label="District">
            <select
              value={form.districtCode || ""}
              onChange={handleDistrictChange}
              disabled={!form.provinceCode}
              className="field-input disabled:opacity-40"
              required
            >
              <option value="">
                {form.provinceCode
                  ? "Select district"
                  : "Select province first"}
              </option>
              {districts.map((d) => (
                <option key={d.districtCode} value={d.districtCode}>
                  {d.districtNameEn} ({d.districtNameTh})
                </option>
              ))}
            </select>
          </Field>

          {/* Subdistrict */}
          <Field label="Subdistrict">
            <select
              value={form.subdistrictCode || ""}
              onChange={handleSubdistrictChange}
              disabled={!form.districtCode}
              className="field-input disabled:opacity-40"
              required
            >
              <option value="">
                {form.districtCode
                  ? "Select subdistrict"
                  : "Select district first"}
              </option>
              {subdistricts.map((s) => (
                <option key={s.subdistrictCode} value={s.subdistrictCode}>
                  {s.subdistrictNameEn} ({s.subdistrictNameTh})
                </option>
              ))}
            </select>
          </Field>

          {/* Postal Code — auto-filled */}
          <Field label="Postal Code">
            <input
              type="text"
              value={form.postalCode}
              readOnly
              placeholder="Auto-filled from subdistrict"
              className="field-input cursor-not-allowed text-gray-500"
            />
          </Field>

          {/* Country — fixed */}
          <Field label="Country">
            <p className="mt-0.5 text-gray-800 text-[15px] font-medium">
              THAILAND
            </p>
          </Field>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full bg-[#cb6f4d] hover:bg-[#b05b3b] transition-colors text-white py-3 rounded-lg font-medium"
            >
              {success ? "Done ✓" : submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-gray-400 hover:text-gray-600 text-sm py-1 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Scoped styles for inputs/selects inside the modal */}
      <style jsx>{`
        .field-input {
          width: 100%;
          background: transparent;
          outline: none;
          margin-top: 2px;
          color: #1f2937;
          font-size: 15px;
        }
        .field-input::placeholder {
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
}

// ── Small layout helper ────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 py-1 focus-within:border-[#cb6f4d] transition-colors">
      <label className="block text-xs text-gray-400">{label}</label>
      {children}
    </div>
  );
}