/**
 * These types mirror `backend/lib/ai/types.ts`. Frontend and backend are
 * separate npm packages in this repo (no shared internal package today), so
 * this is a deliberate, minimal duplication of the response shape - not a
 * duplication of any logic. If a shared types package gets introduced later,
 * this file is the one to delete in favor of importing the real one.
 */

export type SuggestionTier = "auto" | "suggested" | "unknown";

export interface ResolvedField {
  rawValue: string | null;
  confidence: number;
  tier: SuggestionTier;
  resolvedId: number | null;
  resolvedLabel: string | null;
  attributeCode?: string | null;
}

export interface ResolvedTextField {
  rawValue: string | null;
  confidence: number;
  tier: SuggestionTier;
  text: string | null;
}

export interface ResolvedSuggestions {
  category: ResolvedField;
  subcategory: ResolvedField;
  brand: ResolvedField;
  primaryColor: ResolvedField;
  secondaryColor: ResolvedField;
  material: ResolvedField;
  condition: ResolvedField;
  gender: ResolvedField;
  style: ResolvedField;
  title: ResolvedTextField;
  description: ResolvedTextField;
}

export interface LuxuryEvidenceFlags {
  receiptDetected: boolean;
  invoiceDetected: boolean;
  authenticityCardDetected: boolean;
  warrantyCardDetected: boolean;
  serialNumberDetected: boolean;
  qrCodeDetected: boolean;
  nfcTagDetected: boolean;
  logoCloseUpDetected: boolean;
  hardwarePhotoDetected: boolean;
  stitchingPhotoDetected: boolean;
  careLabelDetected: boolean;
  materialLabelDetected: boolean;
}

export interface LuxuryAssessment {
  isLuxury: boolean;
  matchedBrandConfigId: number | null;
  matchedBrandName: string | null;
  evidence: LuxuryEvidenceFlags;
  missingEvidence: string[];
  aiNotes: string;
}

export interface AnalyzeListingResult {
  requestId: string;
  suggestions: ResolvedSuggestions;
  luxury: LuxuryAssessment;
  modelVersion: string;
}

/** Which of the AI's suggested fields the seller has chosen to apply. */
export type ApplyTarget = keyof ResolvedSuggestions;
