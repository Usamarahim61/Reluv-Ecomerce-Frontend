"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  analyzeListingImages,
  rescopeSuggestion,
  uploadImagesToStrapi,
  RateLimitedError,
  AiAnalysisError,
} from "../api/listingAi";
import type { AnalyzeListingResult } from "../ai/types";

const PROGRESS_STAGES = [
  "Uploading images...",
  "Analyzing images...",
  "Detecting category and brand...",
  "Detecting colors and material...",
  "Generating title and description...",
] as const;

export interface UseAiListingAnalysisResult {
  /** Kicks off upload (if needed) + analysis for the given files. */
  analyze: (params: { files: File[]; existingImageIds?: number[]; categoryId?: number | null }) => void;
  /** Re-checks a previous result against a newly chosen category, without a new Gemini call. */
  rescope: (categoryId: number) => void;
  cancel: () => void;
  reset: () => void;
  isAnalyzing: boolean;
  progressMessage: string | null;
  result: AnalyzeListingResult | null;
  error: string | null;
  /** True when the error was a rate limit - callers can show a friendlier "please wait" message. */
  isRateLimited: boolean;
  uploadedImageIds: number[] | null;
}

export function useAiListingAnalysis(): UseAiListingAnalysisResult {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [progressStageIndex, setProgressStageIndex] = useState<number>(-1);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [uploadedImageIds, setUploadedImageIds] = useState<number[] | null>(null);
  const lastRequestIdRef = useRef<string | null>(null);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    setProgressStageIndex(0);
    progressTimerRef.current = setInterval(() => {
      setProgressStageIndex((prev) => Math.min(prev + 1, PROGRESS_STAGES.length - 1));
    }, 1400);
  }, []);

  const analyzeMutation = useMutation({
    mutationFn: async (params: { files: File[]; existingImageIds?: number[]; categoryId?: number | null }) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      startProgressTimer();

      const imageIds =
        params.existingImageIds && params.existingImageIds.length > 0
          ? params.existingImageIds
          : await uploadImagesToStrapi(params.files);

      setUploadedImageIds(imageIds);

      const result = await analyzeListingImages({
        imageIds,
        categoryId: params.categoryId ?? null,
        signal: controller.signal,
      });

      lastRequestIdRef.current = result.requestId;
      return result;
    },
    onSettled: () => {
      stopProgressTimer();
      setProgressStageIndex(-1);
    },
  });

  const rescopeMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const requestId = lastRequestIdRef.current;
      if (!requestId) {
        throw new AiAnalysisError("No prior analysis to re-check against this category.");
      }
      return rescopeSuggestion({ requestId, categoryId });
    },
  });

  const analyze = useCallback(
    (params: { files: File[]; existingImageIds?: number[]; categoryId?: number | null }) => {
      analyzeMutation.mutate(params);
    },
    [analyzeMutation],
  );

  const rescope = useCallback(
    (categoryId: number) => {
      rescopeMutation.mutate(categoryId);
    },
    [rescopeMutation],
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    stopProgressTimer();
    setProgressStageIndex(-1);
    analyzeMutation.reset();
  }, [analyzeMutation, stopProgressTimer]);

  const reset = useCallback(() => {
    analyzeMutation.reset();
    rescopeMutation.reset();
    lastRequestIdRef.current = null;
    setUploadedImageIds(null);
  }, [analyzeMutation, rescopeMutation]);

  const activeMutation = rescopeMutation.isPending || rescopeMutation.isSuccess ? rescopeMutation : analyzeMutation;

  const progressMessage = analyzeMutation.isPending
    ? PROGRESS_STAGES[Math.max(0, progressStageIndex)]
    : null;

  const error = activeMutation.isError
    ? activeMutation.error instanceof Error
      ? activeMutation.error.message
      : "Something went wrong analyzing these images."
    : null;

  const isRateLimited = activeMutation.error instanceof RateLimitedError;

  return useMemo(
    () => ({
      analyze,
      rescope,
      cancel,
      reset,
      isAnalyzing: analyzeMutation.isPending,
      progressMessage,
      result: (activeMutation.data as AnalyzeListingResult | undefined) ?? null,
      error,
      isRateLimited,
      uploadedImageIds,
    }),
    [analyze, rescope, cancel, reset, analyzeMutation.isPending, progressMessage, activeMutation.data, error, isRateLimited, uploadedImageIds],
  );
}
