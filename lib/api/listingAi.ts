import { API_BASE_URL } from "@/app/constants/api";
import type { AnalyzeListingResult } from "../ai/types";

/**
 * Auth pattern matches how the rest of this frontend calls authenticated
 * endpoints (see e.g. app/components/Notification.tsx) - a JWT is stored in
 * localStorage after login and sent as a Bearer token. Note this is a
 * different (and more correct) pattern than the existing `sell-now` request,
 * which currently sends a plain `userId` in the body instead of a real auth
 * header - the new AI endpoints require a real, verifiable identity since
 * they're rate-limited and audited per user.
 */
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export class RateLimitedError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super("Too many AI analysis requests. Please wait before trying again.");
  }
}

export class AiAnalysisError extends Error {}

interface AnalyzeListingParams {
  imageIds: number[];
  categoryId?: number | null;
  signal?: AbortSignal;
}

export async function analyzeListingImages(
  params: AnalyzeListingParams,
): Promise<AnalyzeListingResult> {
  const response = await fetch(`${API_BASE_URL}/api/listing-ai/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      imageIds: params.imageIds,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    }),
    signal: params.signal,
  });

  if (response.status === 429) {
    const payload = await response.json().catch(() => ({}));
    throw new RateLimitedError(Number(payload?.retryAfterMs) || 60000);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AiAnalysisError(payload?.error || `AI analysis failed (${response.status}).`);
  }

  return payload as AnalyzeListingResult;
}

interface RescopeParams {
  requestId: string;
  categoryId: number;
  signal?: AbortSignal;
}

export async function rescopeSuggestion(params: RescopeParams): Promise<AnalyzeListingResult> {
  const response = await fetch(`${API_BASE_URL}/api/listing-ai/rescope`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ requestId: params.requestId, categoryId: params.categoryId }),
    signal: params.signal,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AiAnalysisError(payload?.error || `Could not re-check suggestions (${response.status}).`);
  }

  return payload as AnalyzeListingResult;
}

export async function submitAiFeedback(params: {
  requestId: string;
  field?: string;
  rating: "correct" | "incorrect" | "incomplete";
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/listing-ai/feedback`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AiAnalysisError(body?.error || `Could not save feedback (${response.status}).`);
  }
}

export interface LuxuryEvidencePayload {
  productId: number;
  receiptImageIds?: number[];
  invoiceImageIds?: number[];
  authenticityCardImageIds?: number[];
  warrantyCardImageIds?: number[];
  serialNumberImageIds?: number[];
  qrCodeImageIds?: number[];
  nfcTagImageIds?: number[];
  logoCloseUpImageIds?: number[];
  hardwarePhotoImageIds?: number[];
  stitchingPhotoImageIds?: number[];
  careLabelImageIds?: number[];
  materialLabelImageIds?: number[];
}

export async function submitLuxuryEvidence(payload: LuxuryEvidencePayload): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/listing-verifications/evidence`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AiAnalysisError(body?.error || `Could not submit evidence (${response.status}).`);
  }
  return body;
}

export async function getMyVerificationStatus(productId: number): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/listing-verifications/mine/${productId}`, {
    headers: getAuthHeaders(),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AiAnalysisError(body?.error || `Could not load verification status (${response.status}).`);
  }
  return body;
}

/** Uploads raw files to Strapi's media library and returns their ids - reused by both the manual submit flow and the AI pre-analysis step so images are never uploaded twice. */
export async function uploadImagesToStrapi(files: File[]): Promise<number[]> {
  if (files.length === 0) return [];

  const form = new FormData();
  for (const file of files) form.append("files", file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: form,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AiAnalysisError(payload?.error?.message || `Failed to upload images (${response.status}).`);
  }

  return Array.isArray(payload)
    ? payload.map((item: { id: number }) => Number(item?.id)).filter((id) => Number.isInteger(id) && id > 0)
    : [];
}
