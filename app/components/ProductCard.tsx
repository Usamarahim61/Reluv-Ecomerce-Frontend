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

export default function ProductCard({
  id,
  documentId,
  brand,
  title,
  size,
  condition,
  price,
  totalPrice,
  imageUrl,
  likes,
  variant = "default",
}: ProductProps) {
  const { user } = useAuth();
  const safeImageUrl = toImageUrl(imageUrl);
  const productId = encodeURIComponent(String(id ?? "").trim() || "0");
  const nameText = toDisplayText(title);
  const productDocumentId = encodeURIComponent(
    String(documentId ?? "").trim() || "0",
  );
  const brandText = toDisplayText(brand);
  const sizeText = toDisplayText(size);
  const conditionText = toDisplayText(condition);
  const priceText = toDisplayText(price);
  const totalPriceText = toDisplayText(totalPrice);
  const showInDemand = Number(likes || 0) >= 50;
  const isAndroid = variant === "android";

  const AddLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // 🔹 1. Update product likes
      const res = await fetch(
        `${API_BASE_URL}/api/products/${productDocumentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            //  Authorization: `Bearer ${token}`, // if needed
          },
          body: JSON.stringify({
            data: {
              likeCount: Number(likes || 0) + 1,
            },
          }),
        },
      );
      const result = await res.json();

      if (!res.ok) {
        console.error(result?.error?.message || "Failed to like product");
        return;
      }
      // 🔹 2. Add product to user favorites
      await fetch(`${API_BASE_URL}/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          //  Authorization: `Bearer ${token}`, // if needed
        },
        body: JSON.stringify({
          fav_products: [Number(productDocumentId)],
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Link href={`/products/${productId}`}>
      <div
        className={
          isAndroid
            ? "group flex cursor-pointer flex-col rounded-[14px] bg-white p-2 shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
            : "group flex cursor-pointer flex-col"
        }
      >
        <div
          className={
            isAndroid
              ? "relative aspect-[3/4] w-full overflow-hidden rounded-[10px] bg-[#f2f4f7]"
              : "relative aspect-[3/4] w-full overflow-hidden rounded-[8px] bg-[#efefec]"
          }
        >
          {safeImageUrl ? (
            <img
              src={`${API_BASE_URL}${safeImageUrl}`}
              alt={brandText || "Product image"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className={
                isAndroid
                  ? "h-full w-full bg-[#f2f4f7]"
                  : "h-full w-full bg-[#efefec]"
              }
            />
          )}

          {showInDemand ? (
            <div
              className={
                isAndroid
                  ? "absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#3c3c3c] shadow-sm"
                  : "absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#404040] shadow-sm"
              }
            >
              In demand
            </div>
          ) : null}

          <button
            className={
              isAndroid
                ? "absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-[#e3e6ea] bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#4f4f4f] shadow-sm"
                : "absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-[#d7d7d7] bg-white px-2.5 py-1 text-[11px] font-medium text-[#5e5e5e] shadow-sm"
            }
          >
            <Heart
              onClick={AddLike}
              size={13}
              className={isAndroid ? "text-[#6b7280]" : "text-[#6e6e6e]"}
            />{" "}
            {likes}
          </button>
        </div>

        <div
          className={
            isAndroid ? "space-y-0.5 pt-2 text-[#1f2937]" : "space-y-0.5 pt-2"
          }
        >
          <p
            className={
              isAndroid
                ? "truncate text-[14px] leading-[1.2] text-[#374151]"
                : "truncate text-[15px] leading-[1.2] text-[#4b4b4b]"
            }
          >
            {nameText} · {brandText}
          </p>
          <p
            className={
              isAndroid
                ? "truncate text-[12px] leading-[1.2] text-[#6b7280]"
                : "truncate text-[13px] leading-[1.2] text-[#5f5f5f]"
            }
          >
            {sizeText} · {conditionText}
          </p>
          <p
            className={
              isAndroid
                ? "pt-1 text-[13px] font-medium leading-tight text-[#111827]"
                : "pt-1 text-[13px] font-medium leading-tight text-[#2f2f2f]"
            }
          >
            {priceText}
          </p>
          <div
            className={
              isAndroid
                ? "flex items-center gap-1 text-[12px] leading-tight text-[#0f766e]"
                : "flex items-center gap-1 text-[13px] leading-tight text-[#007782]"
            }
          >
            <span>{totalPriceText} incl.</span>
            <ShieldCheck size={11} />
          </div>
        </div>
      </div>
    </Link>
  );
}
