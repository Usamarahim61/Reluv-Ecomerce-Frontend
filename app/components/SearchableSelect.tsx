"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableSelectOption {
  value: number | string;
  label: string;
  /** Extra text to match against when searching (e.g. Thai + English name). Defaults to `label`. */
  searchText?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: number | string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Shown instead of `placeholder` while disabled (e.g. "Select province first") */
  disabledPlaceholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  disabledPlaceholder,
  searchPlaceholder = "Search...",
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      (o.searchText || o.label).toLowerCase().includes(q),
    );
  }, [options, query]);

  /* close on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* focus search input when opened, reset query when closed */
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
    setQuery("");
  }, [isOpen]);

  /* close & reset if disabled while open */
  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setQuery("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(String(filtered[0].value));
    }
  };

  return (
    <div
      className={`relative w-full sm:max-w-[240px] ${className}`}
      ref={containerRef}
    >
      <div
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`flex items-center justify-between border rounded p-2 text-sm cursor-pointer bg-white h-9 transition-all ${
          disabled
            ? "border-gray-200 cursor-not-allowed opacity-60"
            : "border-[#cb6f4d]"
        }`}
      >
        <span
          className={`truncate ${
            disabled
              ? "text-gray-400"
              : selected
                ? "text-[#cb6f4d]"
                : "text-gray-400"
          }`}
        >
          {disabled
            ? disabledPlaceholder || placeholder
            : selected
              ? selected.label
              : placeholder}
        </span>
        <span
          className={`text-xs shrink-0 ml-2 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${disabled ? "text-gray-300" : "text-[#cb6f4d]"}`}
        >
          ▼
        </span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 animate-fadeIn overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={searchPlaceholder}
              onClick={(e) => e.stopPropagation()}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-[#cb6f4d] text-gray-700"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            <div
              onClick={() => handleSelect("")}
              className="p-2 text-sm text-gray-500 hover:bg-[#fef5f1] hover:text-[#cb6f4d] cursor-pointer transition-colors"
            >
              {placeholder}
            </div>
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-gray-400 text-center">
                No results found
              </div>
            ) : (
              filtered.map((o) => {
                const isSelected = String(o.value) === String(value);
                return (
                  <div
                    key={o.value}
                    onClick={() => handleSelect(String(o.value))}
                    className={`p-2 text-sm cursor-pointer transition-colors hover:bg-[#fef5f1] hover:text-[#cb6f4d] ${
                      isSelected
                        ? "bg-[#fef5f1] text-[#cb6f4d] font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {o.label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}