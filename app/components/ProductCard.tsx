import Image from "next/image";
import Link from "next/link";
import { Heart, Info } from "lucide-react";
import { API_BASE_URL } from "../constants/api";

interface ProductProps {
  id: string | number;
  brand: unknown;
  size: unknown;
  condition: unknown;
  price: unknown;
  totalPrice: unknown;
  imageUrl?: unknown;
  likes: number;
}

const toDisplayText = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const candidates = [obj.title, obj.name, obj.label, obj.slug, obj.value];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0) return candidate;
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

export default function ProductCard({
  id,
  brand,
  size,
  condition,
  price,
  totalPrice,
  imageUrl,
  likes,
}: ProductProps) {
  const safeImageUrl = toImageUrl(imageUrl);
  const productId = encodeURIComponent(String(id ?? "").trim() || "0");
  const brandText = toDisplayText(brand);
  const sizeText = toDisplayText(size);
  const conditionText = toDisplayText(condition);
  const priceText = toDisplayText(price);
  const totalPriceText = toDisplayText(totalPrice);

  return (
    <Link href={`/products/${productId}`}>
      <div className="flex cursor-pointer flex-col group">
        <div className="relative w-full overflow-hidden bg-gray-100 aspect-3/4">
          {safeImageUrl ? (
            <img
              src={`${API_BASE_URL}${safeImageUrl}`}
              alt={brandText || "Product image"}
              
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gray-100" />
          )}

          <button className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-2 py-1 text-xs font-bold">
            <Heart size={12} className="text-gray-400" /> {likes}
          </button>
        </div>

        <div className="space-y-0.5 py-2">
          <p className="truncate text-xs text-gray-500">
            {brandText} · {sizeText} · {conditionText}
          </p>
          <p className="text-sm font-semibold">{priceText}</p>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>{totalPriceText} incl.</span>
            <Info size={10} />
          </div>
        </div>
      </div>
    </Link>
  );
}
