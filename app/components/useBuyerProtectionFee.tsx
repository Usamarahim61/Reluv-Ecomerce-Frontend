"use client";

import { marketplaceSettingsService } from "@/services/MarketplaceSettingsService";
import { useEffect, useState } from "react";

/**
 * Drop this into ProductCard, ProductDetailPage, cart summaries, checkout —
 * anywhere a price is shown and a buyer protection fee needs to go next to it.
 *
 * All instances share one cached commissionRate and one 2-minute polling
 * timer (owned by marketplaceSettingsService), so mounting this in 50
 * ProductCards on a grid does NOT create 50 fetches or 50 timers.
 */
export function useBuyerProtectionFee(price: any) {
  const [commissionRate, setCommissionRate] = useState(
    marketplaceSettingsService.getSettings().commissionRate,
  );

  useEffect(() => {
    const unsubscribe = marketplaceSettingsService.subscribe((settings) => {
      setCommissionRate(settings.commissionRate);
    });
    return unsubscribe;
  }, []);

  const priceString = String(price ?? "").trim();

  const priceMatch = priceString.match(/^[A-Za-z]{3}\s*([\d,]+(?:\.\d+)?)$/i);

  const priceNum = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : NaN;

  const buyerProtectionFee = Number.isFinite(priceNum)
    ? marketplaceSettingsService.calculateBuyerProtectionFee(priceNum)
    : 0;

  return {
    buyerProtectionFee,
    commissionRate: Number.isFinite(Number(commissionRate))
      ? Number(commissionRate)
      : 0,
  };
}
