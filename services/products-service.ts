import { apiRequest } from "./api";

export type ProductCardItem = {
  id: number | string;
  brand: string;
  category?: string;
  subCategory?: string;
  item?: string;
  color?: string;
  material?: string;
  size: string;
  condition: string;
  price: string;
  totalPrice: string;
  imageUrl?: string | null;
  likes: number;
  userId?: number | string | null;
};
export type MemebersCardItem = {
  id: number | string;
  username: string | null;
  fullName: string | null;
  country: string | null;
  city: string | null;
  avatar?: string | null; 
};

export type ProductsPage = {
  items: ProductCardItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type ProductFilterParams = {
  page?: number;
  pageSize?: number;
  category?: string;
  subCategory?: string;
  item?: string;
  brand?: string;
  size?: string;
  condition?: string;
  colour?: string;
  material?: string;
  sortBy?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
};

export type ProductFilterOptions = {
  brand: string[];
  size: string[];
  condition: string[];
  colour: string[];
  material: string[];
  sortBy: string[];
};

export type ProductDetailItem = {
  id: number | string;
  title: string;
  description: string;
  brand: string;
  category?: unknown;
  subCategory?: unknown;
  size: string;
  condition: string;
  material?: string;
  color?: string;
  uploadedAt?: string;
  shippingFromPrice?: string;
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
  const category = attributes.category ?? "";
  const subCategory = attributes.subCategory ?? attributes.subcategory ?? "";
  const item = attributes.item ?? "";
  const color = attributes.color ?? attributes.colour ?? "";
  const material = attributes.material ?? "";
  const size = attributes.size ?? "";
  const condition = formatCondition(attributes.condition);
  const price = formatPrice(attributes.price);
  const totalPrice = price;
  const imageUrl = getFirstImageUrl(attributes.images);
  const likes = Number(attributes.likeCount ?? attributes.likes ?? 0) || 0;
  const userId = attributes.user?.id ?? entry?.user?.id ?? null;

  return {
    id: entry.id,
    brand,
    category,
    subCategory,
    item,
    color,
    material,
    size,
    condition,
    price,
    totalPrice,
    imageUrl,
    likes,
    userId,
  };
};

const mapProductToDetail = (entry: any): ProductDetailItem => {
  const product = entry ?? {};
  const condition = formatCondition(product.condition);
  const price = formatPrice(product.price);
  const uploadedAt = product.updatedAt ?? product.createdAt ?? "";
  const shippingFromPrice = formatPrice(product.shippingFromPrice ?? product.shipping_price ?? 2.95);

  return {
    id: product.id,
    title: product.title ?? "",
    description: product.description ?? "",
    brand: product.brand ?? "",
    category: product.category ?? product.categoryId ?? "",
    subCategory: product.subCategory ?? product.subcategory ?? "",
    size: product.size ?? "",
    condition,
    material: product.material ?? product.fabric ?? "",
    color: product.color ?? "",
    uploadedAt,
    shippingFromPrice,
    price,
    totalPrice: price,
    likes: Number(product.likeCount ?? 0) || 0,
    images: getImageUrls(product.images),
    rating: Number(product.rating ?? 4) || 4.5,
    user: product.user
  };
};

const mapProductToDetail = (entry: any): ProductDetailItem => {
  const product = entry ?? {};
  const condition = formatCondition(product.condition);
  const price = formatPrice(product.price);
  const uploadedAt = product.updatedAt ?? product.createdAt ?? "";
  const shippingFromPrice = formatPrice(product.shippingFromPrice ?? product.shipping_price ?? 2.95);

  return {
    id: product.id,
    title: product.title ?? "",
    description: product.description ?? "",
    brand: product.brand ?? "",
    category: product.category ?? product.categoryId ?? "",
    subCategory: product.subCategory ?? product.subcategory ?? "",
    size: product.size ?? "",
    condition,
    material: product.material ?? product.fabric ?? "",
    color: product.color ?? "",
    uploadedAt,
    shippingFromPrice,
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

export async function fetchFilteredProducts(
  params: ProductFilterParams = {},
): Promise<ProductsPage> {
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = Math.max(1, Number(params.pageSize ?? 40));
  const offset = Math.max(0, (page - 1) * pageSize);
  const search = new URLSearchParams();
  search.set("offset", String(offset));
  search.set("pageSize", String(pageSize));

  const addIfValue = (key: string, value: unknown) => {
    if (value == null) return;
    const text = String(value).trim();
    if (!text) return;
    search.set(key, text);
  };

  addIfValue("category", params.category);
  addIfValue("subCategory", params.subCategory);
  addIfValue("item", params.item);
  addIfValue("brand", params.brand);
  addIfValue("size", params.size);
  addIfValue("condition", params.condition);
  addIfValue("colour", params.colour);
  addIfValue("material", params.material);
  addIfValue("sortBy", params.sortBy);
  if (params.minPrice != null) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) search.set("maxPrice", String(params.maxPrice));

  const payload = await apiRequest(`/products/filter?${search.toString()}`);
  const data = Array.isArray(payload?.products) ? payload.products : [];
  const items = data.map(mapProductToCard);
  const hasMore = Boolean(payload?.pagination?.hasMore);

  return {
    items,
    page,
    pageSize,
    hasMore,
  };
}

export async function searchProducts(
  query: string,
  pageSize = 5,
): Promise<ProductsPage> {
  const trimmedQuery = query.trim();
  const safePageSize = Math.max(1, Math.min(20, Number(pageSize) || 5));

  if (trimmedQuery.length < 2) {
    return {
      items: [],
      page: 1,
      pageSize: safePageSize,
      hasMore: false,
    };
  }

  const search = new URLSearchParams();
  search.set("q", trimmedQuery);
  search.set("pageSize", String(safePageSize));

  const payload = await apiRequest(`/products/search?${search.toString()}`);
  const data = Array.isArray(payload?.products) ? payload.products : [];

  return {
    items: data.map(mapProductToCard),
    page: 1,
    pageSize: safePageSize,
    hasMore: Boolean(payload?.pagination?.hasMore),
  };
}
export async function searchMemebers(
  query: string,
  pageSize = 5,
): Promise<any> {
  const trimmedQuery = query.trim();
  const safePageSize = Math.max(1, Math.min(20, Number(pageSize) || 5));

  if (trimmedQuery.length < 2) {
    return {
      items: [],
      page: 1,
      pageSize: safePageSize,
      hasMore: false,
    };
  }

  const search = new URLSearchParams();
  search.set("q", trimmedQuery);
  search.set("pageSize", String(safePageSize));

  const payload = await apiRequest(`/products/searchMembers?${search.toString()}`);
  const data = Array.isArray(payload?.members) ? payload.members : [];

  return {
    items: data,
    page: 1,
    pageSize: safePageSize,
    hasMore: Boolean(payload?.pagination?.hasMore),
  };
}

export async function fetchProductFilterOptions(params: {
  category?: string;
  subCategory?: string;
  item?: string;
} = {}): Promise<ProductFilterOptions> {
  const search = new URLSearchParams();
  const addIfValue = (key: string, value: unknown) => {
    if (value == null) return;
    const text = String(value).trim();
    if (!text) return;
    search.set(key, text);
  };

  addIfValue("category", params.category);
  addIfValue("subCategory", params.subCategory);
  addIfValue("item", params.item);

  const query = search.toString();
  const payload = await apiRequest(`/products/filter-options${query ? `?${query}` : ""}`);
  const options = payload?.options ?? {};

  return {
    brand: Array.isArray(options.brand) ? options.brand : [],
    size: Array.isArray(options.size) ? options.size : [],
    condition: Array.isArray(options.condition) ? options.condition : [],
    colour: Array.isArray(options.colour) ? options.colour : [],
    material: Array.isArray(options.material) ? options.material : [],
    sortBy: Array.isArray(options.sortBy) ? options.sortBy : ['Newest', 'Price: Low to high', 'Price: High to low'],
  };
}

export async function fetchProductById(id: string | number): Promise<ProductDetailItem> {
  const payload = await apiRequest(`/products/getProductById/${encodeURIComponent(String(id))}`);
  return mapProductToDetail(payload?.product);
}

export async function fetchProductsByUserId(userId: number | string): Promise<ProductCardItem[]> {
  const payload = await apiRequest(`/products/user/${encodeURIComponent(String(userId))}`);
  const data = Array.isArray(payload?.products) ? payload.products : [];
  return data.map(mapProductToCard);
}
