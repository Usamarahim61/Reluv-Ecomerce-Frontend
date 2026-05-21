import Link from "next/link";
import { Heart } from "lucide-react";
import { API_BASE_URL } from "../constants/api";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

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
  isLiked: isLikedProp = false,
  onFavChange,
}: any) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(isLikedProp);
  const [likesCount, setLikesCount] = useState(Number(likes || 0));

  const safeImageUrl = toImageUrl(imageUrl ?? images?.[0]);
  const productId = encodeURIComponent(String(id ?? "").trim() || "0");
  const productDocumentId = encodeURIComponent(
    String(documentId ?? "").trim() || "0"
  );

  const nameText = toDisplayText(title);
  const brandText = toDisplayText(brand);
  const sizeText = toDisplayText(size);
  const conditionText = toDisplayText(condition);
  const priceValue = toDisplayText(price);

  // Sync when parent prop changes (initial fav load)
  useEffect(() => {
    setIsLiked(isLikedProp);
  }, [isLikedProp]);

  const AddLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nowLiked = !isLiked;
    const newCount = nowLiked ? likesCount + 1 : likesCount - 1;

    // Optimistic UI update
    setIsLiked(nowLiked);
    setLikesCount(newCount);
    onFavChange?.(Number(id), nowLiked); // notify parent immediately

    try {
      // 1. Update product likeCount
      const res = await fetch(
        `${API_BASE_URL}/api/products/${productDocumentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: { likeCount: newCount },
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update product likes");

      // 2. Update user fav_products using connect/disconnect (Strapi v4/v5)
      const userRes = await fetch(`${API_BASE_URL}/api/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fav_products: nowLiked
            ? { connect: [Number(id)] }
            : { disconnect: [Number(id)] },
        }),
      });

      if (!userRes.ok) throw new Error("Failed to update user fav products");
    } catch (error) {
      console.error(error);
      // Rollback optimistic update
      setIsLiked(!nowLiked);
      setLikesCount(likesCount);
      onFavChange?.(Number(id), !nowLiked); // rollback parent too
    }
  };

  return (
    <Link href={`/products/${productId}`}>
      <div className="group flex cursor-pointer flex-col max-w-[300px]">
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#f5f5f5]">
          {safeImageUrl ? (
            <img
              src={`${safeImageUrl}`}
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
            className={`absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
              isLiked
                ? "bg-[#cb6f4d] text-white shadow-lg"
                : "bg-white/90 backdrop-blur-sm text-[#888] hover:bg-white hover:text-[#cb6f4d]"
            }`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
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