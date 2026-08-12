"use client";

import { Check, Sparkles, X } from "lucide-react";
import type { ApplyTarget, ResolvedField, ResolvedSuggestions, ResolvedTextField } from "@/lib/ai/types";

/**
 * Shows what the AI detected, field by field, with each field's confidence
 * tier made visible rather than silently hidden:
 *   - "auto" (>=95%): shown as the default, ready to apply
 *   - "suggested" (80-94%): shown, clearly labeled "AI Suggested"
 *   - "unknown" (<80%): not shown as a value at all - nothing to apply
 *
 * Nothing here writes to the seller's form directly - every field is applied
 * only via an explicit click, per the "seller always remains in control"
 * requirement. This component only ever calls back up to the parent; it
 * holds no form state itself.
 */

const FIELD_LABELS: Record<ApplyTarget, string> = {
  category: "Category",
  subcategory: "Subcategory",
  brand: "Brand",
  Color: "Color",
  material: "Material",
  condition: "Condition",
  title: "Title",
  description: "Description",
};

const APPLICABLE_FIELD_ORDER: ApplyTarget[] = [
  "title",
  "description",
  "category",
  "subcategory",
  "brand",
  "condition",
  "Color",
  "material",
];

function isResolvedField(field: ResolvedField | ResolvedTextField): field is ResolvedField {
  return "resolvedId" in field;
}

function hasApplicableValue(field: ResolvedField | ResolvedTextField | undefined): boolean {
  if (!field) return false;
  if (field.tier === "unknown") return false;
  if (isResolvedField(field)) return Boolean(field.resolvedLabel || field.rawValue);
  return Boolean(field.text && field.text.trim().length > 0);
}

function displayValue(field: ResolvedField | ResolvedTextField): string {
  if (isResolvedField(field)) return field.resolvedLabel ?? field.rawValue ?? "";
  return field.text ?? "";
}

interface AiSuggestionsPanelProps {
  suggestions: ResolvedSuggestions;
  /** Fields the seller has already applied (so we can show a check + disable re-applying). */
  appliedFields: Set<ApplyTarget>;
  onApplyField: (field: ApplyTarget) => void;
  onApplyAll: () => void;
  onDismiss: () => void;
}

export default function AiSuggestionsPanel({
  suggestions,
  appliedFields,
  onApplyField,
  onApplyAll,
  onDismiss,
}: AiSuggestionsPanelProps) {
  const applicableFields = APPLICABLE_FIELD_ORDER.filter((key) => hasApplicableValue(suggestions[key]));

  if (applicableFields.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-gray-200 bg-[#f7f7f7] p-4 text-sm text-gray-600">
        The AI couldn't confidently detect enough details from these photos. Feel free to fill out the
        form manually - clearer, well-lit photos usually help.
        <button type="button" onClick={onDismiss} className="ml-2 font-semibold text-[#1a1816] underline">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-[#e8dfd0] bg-[#fffaf2] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#b8860b]" />
          <span className="font-semibold text-[#1a1816]">AI Suggestions</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onApplyAll}
            className="rounded-full bg-[#1a1816] px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Apply All
          </button>
          <button type="button" onClick={onDismiss} aria-label="Dismiss suggestions" className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {applicableFields.map((key) => {
          const field = suggestions[key];
          const applied = appliedFields.has(key);
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">{FIELD_LABELS[key]}</span>
                  {field.tier === "suggested" && (
                    <span className="rounded-full bg-[#fdf0d5] px-2 py-0.5 text-[10px] font-semibold text-[#8a6d1f]">
                      AI Suggested
                    </span>
                  )}
                </div>
                <p className="truncate text-sm font-medium text-[#1a1816]">{displayValue(field)}</p>
              </div>
              <button
                type="button"
                onClick={() => onApplyField(key)}
                disabled={applied}
                className={`ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                  applied
                    ? "border-green-200 bg-green-50 text-green-600"
                    : "border-gray-200 text-gray-500 hover:border-[#1a1816] hover:text-[#1a1816]"
                }`}
                aria-label={applied ? `${FIELD_LABELS[key]} applied` : `Apply ${FIELD_LABELS[key]}`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
