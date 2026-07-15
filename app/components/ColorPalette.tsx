"use client";

import type { CSSProperties } from "react";

type ColorPaletteProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
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
}: ColorPaletteProps) {
  const selectedColor = /^#[0-9a-f]{6}$/i.test(value) ? value : "#c0613a";

  return (
    <fieldset>
      <legend className="font-semibold text-[#1a1816] mb-1">
        {label}
        {required ? " *" : ""}
      </legend>
      <label className="relative flex h-[50px] w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-[#f7f7f7] px-3 transition-colors hover:border-gray-300 focus-within:ring-2 focus-within:ring-[#c0613a] focus-within:ring-offset-1">
        <span
          className="block h-7 w-7 shrink-0 rounded-full border-2 border-white shadow-sm ring-1 ring-black/15"
          style={{ backgroundColor: selectedColor }}
        />
        <input
          type="color"
          name="item-colour"
          aria-label={`Choose ${label.toLowerCase()}`}
          value={selectedColor}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className={
            value
              ? "font-mono text-xs font-medium uppercase text-gray-700"
              : "text-xs text-gray-500"
          }
        >
          {value ? selectedColor : "Click to select a colour"}
        </span>
        {value && <span className="ml-auto text-xs text-gray-400">Change</span>}
      </label>
    </fieldset>
  );
}
