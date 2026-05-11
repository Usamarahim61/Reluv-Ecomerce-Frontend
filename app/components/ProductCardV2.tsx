import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../constants/api";
import { useAuth } from "@/context/AuthContext";

interface ProductProps {
  id: string | number;
  documentId?: string | number;
  brand: unknown;
  title: unknown;
  size: unknown;
  condition: unknown;
  price: unknown;
  totalPrice: unknown;
  imageUrl?: unknown;
  likes: number;
  variant?: "default" | "android";
}

const toDisplayText = (value: unknown): string => {
  if (value == null) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const candidates = [obj.title, obj.name, obj.label, obj.slug, obj.value];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0)
        return candidate;
      if (typeof candidate === "number") return String(candidate);
    }
  }
  return "";
};

const toImageUrl = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const direct = obj.url;
    if (typeof direct === "string" && direct.trim().length > 0) return direct;
    const data = obj.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    const nested = attrs?.url;
    if (typeof nested === "string" && nested.trim().length > 0) return nested;
  }
  return null;
};

export default function ProductCardV2({
  id,
  documentId,
  brand,
  title,
  size,
  condition,
  price,
  totalPrice,
  imageUrl,
  images,
  likes,
  variant = "default",
}: any) {
  const { user } = useAuth();
  const safeImageUrl = toImageUrl(imageUrl ?? images?.[0]);
  const productId = encodeURIComponent(String(id ?? "").trim() || "0");
  const nameText = toDisplayText(title);
  const productDocumentId = encodeURIComponent(
    String(documentId ?? "").trim() || "0",
  );

  const brandText = toDisplayText(brand);
  const sizeText = toDisplayText(size);
  const conditionText = toDisplayText(condition);
  const priceValue = toDisplayText(price);
  const totalPriceValue = toDisplayText(totalPrice);

  const isAndroid = variant === "android";

  const AddLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`${API_BASE_URL}/api/products/${productDocumentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { likeCount: Number(likes || 0) + 1 },
        }),
      });
      await fetch(`${API_BASE_URL}/api/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fav_products: {id: Number(productId)},
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Link href={`/products/${productId}`}>
      <div className="group flex cursor-pointer flex-col max-w-[300px]">
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#f5f5f5]">
          {safeImageUrl ? (
            <img
              src={`${API_BASE_URL}${safeImageUrl}`}
              alt={nameText}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}

          {/* Condition Tag */}
          <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-gray-800 transition-colors duration-300 hover:bg-[rgb(203,111,77)] hover:text-white">
            {conditionText || "New with tags"}
          </div>

          {/* Like Button */}
          <button
            onClick={AddLike}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 transition-colors hover:bg-white"
          >
            <Heart size={16} />
          </button>
        </div>

        {/* Content Section */}
        <div className="mt-3 px-1">
          <div className="flex items-start justify-between">
            <h3 className="truncate text-[15px] font-normal text-gray-900">
              {nameText}
            </h3>
            <span
              className="text-[15px] font-semibold"
              style={{ color: "rgb(203, 111, 77)" }}
            >
              {priceValue}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <p className="text-[13px] text-gray-500">
              {brandText} <span className="mx-1">·</span> {sizeText}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
