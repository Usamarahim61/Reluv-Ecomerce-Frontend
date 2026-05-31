import Link from "next/link";
import { Heart, ShieldCheck, Flame } from "lucide-react";
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
  images,
  likes,
  variant = "default",
  isLiked: isLikedProp = false,
  onFavChange,                    // ✅ from parent
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
  const priceText = toDisplayText(price);
  const totalPriceText = toDisplayText(totalPrice);
  const showTrending = Number(likes || 0) >= 50;

  // Sync when parent prop updates (after initial fav fetch completes)
  useEffect(() => {
    setIsLiked(isLikedProp);
  }, [isLikedProp]);

  const AddLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nowLiked = !isLiked;
    const newCount = nowLiked ? likesCount + 1 : likesCount - 1;

    // Optimistic update
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
      // Rollback
      setIsLiked(!nowLiked);
      setLikesCount(likesCount);
      onFavChange?.(Number(id), !nowLiked); // rollback parent too
    }
  };

  return (
    <Link href={`/products/${productId}`}>
      <div className="group flex cursor-pointer flex-col h-full rounded-2xl overflow-hidden bg-white border border-[#f0ede8] hover:border-[#e0ddd8] transition-all duration-300 hover:shadow-lg hover:shadow-[rgba(203,111,77,0.12)]">

        {/* Image Container */}
        <div className="relative aspect-3/4 w-full overflow-hidden bg-linear-to-br from-[#faf9f7] to-[#f0ede8]">
          {safeImageUrl ? (
            <img
              src={`${API_BASE_URL}${safeImageUrl}`}
              alt={brandText || nameText || "Product"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-[#faf9f7] to-[#f0ede8] flex items-center justify-center">
              <div className="text-[#ddd] text-4xl">📦</div>
            </div>
          )}

          {/* Trending Badge */}
          {showTrending && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-linear-to-r from-[#cb6f4d] to-[#b85f3d] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
              <Flame size={14} />
              Trending
            </div>
          )}

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

          {/* Condition Badge */}
          {/* <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-[#1a1a1a] shadow-md">
            {conditionText || "New"}
          </div> */}

          {/* Likes Counter */}
          {likesCount > 0 && (
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-[#1a1a1a] shadow-md flex items-center gap-1">
              <Heart size={12} className="text-[#cb6f4d]" fill="currentColor" />
              {likesCount}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-4">

          {/* Brand */}
          <p className="text-xs font-bold uppercase tracking-widest text-[#cb6f4d] mb-2">
            {brandText || "Brand"}
          </p>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-[#1a1a1a] line-clamp-2 mb-3 leading-tight">
            {nameText}
          </h3>

          {/* Product Details */}
          <div className="flex items-center gap-2 text-xs text-[#888] mb-4">
            {sizeText && (
              <>
                <span className="bg-[#f5f5f5] px-2 py-0.5 rounded-md font-medium">{sizeText}</span>
                <span>•</span>
              </>
            )}
            <span className="rounded-full border border-[#cb6f4d] text-[#cb6f4d] px-3 py-1 text-[11px] font-medium transition-colors duration-300 hover:bg-[rgb(203,111,77)] hover:text-white">{conditionText || "Good"}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price Section */}
          <div className="space-y-2 pt-3 border-t border-[#f0ede8]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#aaa]">Price</span>
              <span className="text-lg font-bold text-[#cb6f4d]">{priceText}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#aaa]">buyer protection Incl.</span>
              <div className="flex items-center gap-1 text-[#1a1a1a] font-semibold">
                <span>100 TBH</span>
                <ShieldCheck size={12} className="text-[#cb6f4d]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}