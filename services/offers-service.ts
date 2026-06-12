import { API_BASE_URL } from "@/app/constants/api";

export interface MakeOfferPayload {
  productId: number;
  buyerId: number;
  sellerId: number;
  offerPrice: number;
  message?: string;
}

export interface RespondOfferPayload {
  action: "accepted" | "declined";
  sellerId: number;
  conversationId?: number;
}

export const makeOffer = async (payload: MakeOfferPayload) => {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  const res = await fetch(`${API_BASE_URL}/api/offers/make`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error?.message ?? "Failed to submit offer");
  }
  return res.json();
};

export const getOffersForSeller = async (sellerId: number) => {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  const res = await fetch(`${API_BASE_URL}/api/offers/seller/${sellerId}`, {
    headers: {
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch seller offers");
  return res.json();
};

export const getOffersForBuyer = async (buyerId: number) => {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  const res = await fetch(`${API_BASE_URL}/api/offers/buyer/${buyerId}`, {
    headers: {
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch buyer offers");
  return res.json();
};

export const respondToOffer = async (offerId: number, payload: RespondOfferPayload) => {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  const res = await fetch(`${API_BASE_URL}/api/offers/${offerId}/respond`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to respond to offer");
  return res.json();
};
