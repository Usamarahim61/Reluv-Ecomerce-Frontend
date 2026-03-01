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

export type ProductDetailItem = {
  id: number | string;
  title: string;
  description: string;
  brand: string;
  size: string;
  condition: string;
  price: string;
  totalPrice: string;
  likes: number;
  images: string[];
  user:any
  rating: number;
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

export const getFirstImageUrl = (images: any): string | null => {
  if (!images) return null;
  const data = images;
  if (Array.isArray(data)) {
    return data[0]?.url ?? null;
  }
  return data?.url ?? null;
};

const getImageUrls = (images: any): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .map((img) => (typeof img?.url === "string" ? img.url : null))
      .filter((url): url is string => Boolean(url));
  }
  if (typeof images?.url === "string") return [images.url];
  return [];
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

const mapProductToDetail = (entry: any): ProductDetailItem => {
  const product = entry ?? {};
  const condition = formatCondition(product.condition);
  const price = formatPrice(product.price);

  return {
    id: product.id,
    title: product.title ?? "",
    description: product.description ?? "",
    brand: product.brand ?? "",
    size: product.size ?? "",
    condition,
    price,
    totalPrice: price,
    likes: Number(product.likeCount ?? 0) || 0,
    images: getImageUrls(product.images),
    rating: Number(product.rating ?? 4) || 4.5,
    user: product.user
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

export async function fetchProductById(id: string | number): Promise<ProductDetailItem> {
  const payload = await apiRequest(`/products/getProductById/${encodeURIComponent(String(id))}`);
  return mapProductToDetail(payload?.product);
}
