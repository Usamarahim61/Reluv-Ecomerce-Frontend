import { BACKEND_URL } from "@/constants";

export type MarketplaceSettings = {
  commissionRate: number; // percentage, e.g. 10 = 10%
};

type Listener = (settings: MarketplaceSettings) => void;

const REFRESH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const DEFAULT_SETTINGS: MarketplaceSettings = { commissionRate: 10 };

/**
 * Single shared source of truth for marketplace settings (commissionRate),
 * used to derive the buyer protection fee anywhere in the app.
 *
 * - Fetched once, then re-fetched every 2 minutes in the background.
 * - Every component that calls subscribe()/useBuyerProtectionFee() shares
 *   the SAME cached value and the SAME polling timer — we don't spin up
 *   a new interval per ProductCard.
 * - Falls back to the last known good value (or the schema default) if a
 *   background refresh fails, so the UI never flashes to $0.
 */
class MarketplaceSettingsService {
  private settings: MarketplaceSettings = DEFAULT_SETTINGS;
  private listeners = new Set<Listener>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private inFlight: Promise<void> | null = null;

  private async fetchSettings(): Promise<void> {
    if (this.inFlight) return this.inFlight;

    this.inFlight = (async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/marketplace-settings/current`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) {
          throw new Error(
            `marketplace-settings/current responded ${res.status}`,
          );
        }

        const json = await res.json();
        const rate = Number(json?.data?.commissionRate);

        if (Number.isFinite(rate)) {
          this.settings = { commissionRate: rate };
          this.notify();
        }
      } catch (err) {
        // Keep serving the last known value; just log for visibility.
        console.error("[marketplaceSettingsService] refresh failed:", err);
      } finally {
        this.inFlight = null;
      }
    })();

    return this.inFlight;
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.settings));
  }

  private ensurePolling() {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => {
      void this.fetchSettings();
    }, REFRESH_INTERVAL_MS);
  }

  private stopPollingIfIdle() {
    if (this.listeners.size === 0 && this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /** Synchronous read of whatever is currently cached (never blocks render). */
  getSettings(): MarketplaceSettings {
    return this.settings;
  }

  /**
   * Subscribe to updates. Triggers an immediate fetch if nothing has been
   * loaded yet, and starts the 2-minute polling loop. Returns an
   * unsubscribe function — call it on unmount.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.ensurePolling();
    void this.fetchSettings();

    return () => {
      this.listeners.delete(listener);
      this.stopPollingIfIdle();
    };
  }

  /**
   * The formula: buyerProtectionFee = price * (commissionRate / 100).
   * Rounded to 2 decimals for currency display.
   */
  calculateBuyerProtectionFee(price: number): number {
    const safePrice = Number(price);
    const commissionRate = Number(this.settings?.commissionRate);

    if (!Number.isFinite(safePrice) || !Number.isFinite(commissionRate)) {
      return 0;
    }

    if (safePrice <= 0 || commissionRate < 0 || commissionRate > 100) {
      return 0;
    }

    const fee = (safePrice * commissionRate) / 100;

    if (!Number.isFinite(fee)) {
      return 0;
    }

    return Math.round((fee + Number.EPSILON) * 100) / 100;
  }
}

// Singleton — import this same instance everywhere.
export const marketplaceSettingsService = new MarketplaceSettingsService();
