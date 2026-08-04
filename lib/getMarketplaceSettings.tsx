import { BACKEND_URL } from "@/constants";

export interface MarketplaceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
}

export async function getMarketplaceSettings(): Promise<MarketplaceSettings> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/marketplace-settings`, {
      // maintenance mode needs to reflect immediately — no stale cache
      cache: "no-store",
    });

    if (!res.ok) {
      return { maintenanceMode: false, maintenanceMessage: null };
    }

    const json = await res.json();
    // Strapi v5 collection response: { data: [ {..attrs flattened..} ] }
    const entry = Array.isArray(json?.data) ? json.data[0] : json?.data;

    if (!entry) {
      return { maintenanceMode: false, maintenanceMessage: null };
    }

    return {
      maintenanceMode: Boolean(entry.maintenanceMode),
      maintenanceMessage: entry.maintenanceMessage ?? null,
    };
  } catch (err) {
    console.error("Failed to fetch marketplace settings:", err);
    // fail-open — don't lock out the whole site if the settings call errors
    return { maintenanceMode: false, maintenanceMessage: null };
  }
}