import { apiRequest } from "./api";

export type ProductCardItem = {
  id: number | string;
  brand: string;
  size: string;
  condition: string;
  price: string;
  totalPrice: string;
  imageUrl?: string | null;
  likes: number;
};

export type ProductsPage = {
  items: ProductCardItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};


const formatPrice = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return "";
    if (trimmed.includes("€")) return trimmed;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return `€${numeric.toFixed(2)}`;
    return trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `€${value.toFixed(2)}`;
  }
  return "";
};

const formatCondition = (value: unknown): string => {
  if (typeof value !== "string") return "";
  switch (value) {
    case "new_with_tags":
      return "New with tags";
    case "new_without_tags":
      return "New without tags";
    case "very_good":
      return "Very good";
    case "good":
      return "Good";
    case "satisfactory":
      return "Satisfactory";
    default:
      return value;
  }
};

const getFirstImageUrl = (images: any): string | null => {
  if (!images) return null;
  const data = images;
  if (Array.isArray(data)) {
    return data[0]?.url ?? null;
  }
  return data?.url ?? null;
};

const mapProductToCard = (entry: any): ProductCardItem => {
  const attributes = entry ?? {};
  const brand = attributes.brand ?? "";
  const size = attributes.size ?? "";
  const condition = formatCondition(attributes.condition);
  const price = formatPrice(attributes.price);
  const totalPrice = price;
  const imageUrl = getFirstImageUrl(attributes.images);
  const likes = Number(attributes.likeCount ?? 0) || 0;

  return {
    id: entry.id,
    brand,
    size,
    condition,
    price,
    totalPrice,
    imageUrl,
    likes,
  };
};

export async function fetchProductsForHome(
  page = 1,
  pageSize = 20
): Promise<ProductsPage> {
  const offset = Math.max(0, (page - 1) * pageSize);
  const payload = await apiRequest(
    `/products/getProducts?offset=${offset}`
  );
  const data = Array.isArray(payload?.products)
    ? (payload.products as any[])
    : [];
  const items = data.map(mapProductToCard);

  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}
