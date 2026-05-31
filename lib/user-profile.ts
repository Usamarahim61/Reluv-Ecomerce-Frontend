import { API_BASE_URL } from "@/app/constants/api";

export type GoogleAddress = {
  formatted?: string;
  street_address?: string;
  locality?: string;
  region?: string;
  postal_code?: string;
  country?: string;
} | null;

export function toAbsoluteImageUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

export function getUserAvatarUrl(user?: any) {
  const avatar = user?.avatar;

  if (typeof avatar === "string") return toAbsoluteImageUrl(avatar);
  if (avatar?.url) return toAbsoluteImageUrl(avatar.url);
  if (avatar?.data?.attributes?.url) {
    return toAbsoluteImageUrl(avatar.data.attributes.url);
  }

  return user?.googlePicture || user?.googleProfile?.picture || "";
}

export function getGoogleAddress(user?: any): GoogleAddress {
  return user?.googleAddress || user?.googleProfile?.address || null;
}

export function formatUserAddress(user?: any) {
  const googleAddress = getGoogleAddress(user);
  const formattedGoogleAddress = googleAddress?.formatted?.trim();

  if (formattedGoogleAddress) return formattedGoogleAddress;

  const cityCountry = [user?.city, user?.country]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");

  if (cityCountry) return cityCountry;

  return [
    googleAddress?.street_address,
    googleAddress?.locality,
    googleAddress?.region,
    googleAddress?.postal_code,
    googleAddress?.country,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
}

