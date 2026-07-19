"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type ColorOption = {
  label: string;
  value: string;
};

type ColorPaletteProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  options?: ColorOption[];
};

const COLOR_STYLES: Record<string, string> = {
  black: "#171717",
  white: "#ffffff",
  grey: "#9ca3af",
  gray: "#9ca3af",
  beige: "#ddd0b6",
  cream: "#fff1cc",
  brown: "#795548",
  camel: "#c19a6b",
  tan: "#d2a679",
  red: "#dc2626",
  burgundy: "#800020",
  maroon: "#6b172a",
  pink: "#ec4899",
  "hot pink": "#ff2d8d",
  "baby pink": "#f9bfd3",
  coral: "#ff7f6e",
  orange: "#f97316",
  yellow: "#facc15",
  mustard: "#d4a017",
  green: "#27945b",
  olive: "#80833a",
  khaki: "#b5a66a",
  mint: "#9de2c2",
  blue: "#2563eb",
  navy: "#172554",
  "royal blue": "#2447d8",
  "sky blue": "#7dd3fc",
  "light blue": "#bae6fd",
  purple: "#7c3aed",
  lavender: "#c4b5fd",
  gold: "linear-gradient(135deg, #8f6b17, #f4d675 48%, #a77b16)",
  silver: "linear-gradient(135deg, #8f969d, #f5f7f8 48%, #a6adb4)",
  bronze: "linear-gradient(135deg, #7c3f1d, #d19a66 48%, #8c4d28)",
  multicolour:
    "conic-gradient(#ef4444, #f59e0b, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
  multicolor:
    "conic-gradient(#ef4444, #f59e0b, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
  printed:
    "repeating-linear-gradient(135deg, #1f2937 0 6px, #f8fafc 6px 12px, #c0613a 12px 18px)",
  other: "linear-gradient(135deg, #f3f4f6, #d1d5db)",
};

const normalizeColorName = (name: string) =>
  name.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");

export const getColorSwatchStyle = (name: string): CSSProperties => ({
  background:
    /^#[0-9a-f]{6}$/i.test(name.trim())
      ? name.trim()
      : COLOR_STYLES[normalizeColorName(name)] ||
        "linear-gradient(135deg, #f3f4f6, #d1d5db)",
});

export function ColorSwatch({
  color,
  className = "h-5 w-5",
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full border border-black/15 shadow-sm ${className}`}
      style={getColorSwatchStyle(color)}
    />
  );
}

export default function ColorPalette({
  value,
  onChange,
  label,
  required = false,
  options = [],
}: ColorPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLFieldSetElement>(null);

  const selectedValues = useMemo(() => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;

    return options.filter((option) => {
      const label = (option.label || option.value || "").toLowerCase();
      const value = (option.value || "").toLowerCase();
      return label.includes(term) || value.includes(term);
    });
  }, [options, search]);

  const toggleOption = (optionValue: string) => {
    const nextValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((item) => item !== optionValue)
      : [...selectedValues, optionValue];

    onChange(nextValues.join(","));
  };

  return (
    <fieldset ref={wrapperRef} className="relative">
      <legend className="font-semibold text-[#1a1816] mb-1">
        {label}
        {required ? " *" : ""}
      </legend>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-[#f7f7f7] px-4 py-3 text-left transition-all duration-200 hover:border-[#cb6f4d]/30 hover:bg-[#fcf7f2] focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]/30"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {selectedValues.length > 0 ? (
            selectedValues.map((selectedValue) => (
              <span
                key={selectedValue}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm"
              >
                <ColorSwatch color={selectedValue} className="h-4 w-4" />
                <span>{selectedValue}</span>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">Select colors</span>
          )}
        </div>

        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
          <div className="mb-2 rounded-lg border border-gray-200 bg-[#f7f7f7] px-3 py-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search colors..."
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-y-auto pr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const optionValue = option.value || option.label;
                const isSelected = selectedValues.includes(optionValue);

                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => toggleOption(optionValue)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                      isSelected ? "bg-[#fff7f2]" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <ColorSwatch color={option.label || optionValue} className="h-5 w-5" />
                      <span className="font-medium text-gray-700">{option.label || optionValue}</span>
                    </span>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-[#cb6f4d] bg-[#cb6f4d] text-white shadow-sm">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0l-3.2-3.2a1 1 0 1 1 1.4-1.4l2.5 2.5 6.5-6.5a1 1 0 0 1 1.4 0Z" />
                        </svg>
                      </span>
                    ) : (
                      <span className="h-5 w-5 rounded-sm border border-gray-300 bg-white shadow-sm" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No colors found.</div>
            )}
          </div>
        </div>
      )}
    </fieldset>
  );
}
