"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { fetchConversations } from "@/lib/features/messagesSlice";
import { createConversationForProduct } from "@/services/messages-service";
import ImageCarousel from "@/app/components/ImageCarousel";
import ImageZoom from "@/app/components/ImageZoom";
import MobileImageCarousel from "@/app/components/MobileImageCarousel";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import MakeOfferModal from "@/app/components/MakeOfferModal";
import { API_BASE_URL } from "@/app/constants/api";
import { CATEGORY_TREE_ENDPOINT, CategoryNode } from "@/lib/categoryUtils";
import {
  fetchProductById,
  fetchProductsForHome,
  fetchProductsByUserId,
  fetchFilteredProducts,
  ProductCardItem,
  ProductDetailItem,
} from "@/services/products-service";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Flag,
  Heart,
  Info,
  MapPin,
  MessageCircle,
  PlusSquare,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ProductDetailSkeleton, ProductErrorScreen } from "@/app/components/Skeletons";
import { getUserFav_Products } from "@/services/auth-service";

type BreadcrumbItem = { label: string; slug: string };

const toText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

const findCategoryPath = (
  nodes: CategoryNode[],
  targetName: string,
): CategoryNode[] | null => {
  for (const node of nodes) {
    if (node.name.toLowerCase() === targetName.toLowerCase()) return [node];
    const childPath = findCategoryPath(node.categories || [], targetName);
    if (childPath) return [node, ...childPath];
  }
  return null;
};

function getPriceValue(priceString: string) {
  const match = priceString.match(/([\d.]+)/);
  return match ? match[1] : null;
}

function getCurrencyCode(priceString: string) {
  const curMatch = priceString.match(/[^\d.\s]+/);
  return curMatch ? curMatch[0] : null;
}

const toRelativeUploadTime = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0)
    return "18 min ago";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "18 min ago";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  return `${Math.floor(diffHours / 24)} d ago`;
};

const toAbsoluteImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

/* ─── component ───────────────────────────────────────────── */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = String(idParam ?? "").trim();

  const [product, setProduct] = useState<ProductDetailItem | null>(null);
  const [memberItems, setMemberItems] = useState<ProductCardItem[]>([]);
  const [similarItems, setSimilarItems] = useState<ProductCardItem[]>([]);
  const [categoryTrail, setCategoryTrail] = useState<BreadcrumbItem[]>([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);

  const [isProductLoading, setIsProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // ── fav state ──────────────────────────────────────────────────────────────
  const [favIds, setFavIds] = useState<number[]>([]);

  // ── derived wishlist state for main product ────────────────────────────────
  const isWishlisted = product?.id ? favIds.includes(Number(product.id)) : false;

  // ── fetch fav products once on mount ──────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    getUserFav_Products(Number(user.id))
      .then((data) => {
        if (!isMounted) return;
        const ids: number[] =
          data?.fav_products?.map((p: any) =>
            typeof p === "object" ? Number(p.id) : Number(p)
          ) ?? [];
        setFavIds(ids);
      })
      .catch((err) => console.error("Failed to fetch fav products", err));

    return () => { isMounted = false; };
  }, [user?.id]);

  // ── sync fav state after like/unlike from any card ─────────────────────────
  const handleFavChange = (productId: number, liked: boolean) => {
    setFavIds((prev) =>
      liked
        ? [...new Set([...prev, productId])]
        : prev.filter((id) => id !== productId)
    );
  };

  /* ── 1. load product ── */
  useEffect(() => {
    if (!id) {
      setIsProductLoading(false);
      setProductError("Invalid product id.");
      return;
    }
    let isMounted = true;
    setIsProductLoading(true);
    setProductError(null);

    fetchProductById(id)
      .then((result) => {
        if (isMounted) setProduct(result);
      })
      .catch((err) => {
        if (isMounted)
          setProductError(
            err instanceof Error ? err.message : "Failed to load product.",
          );
      })
      .finally(() => {
        if (isMounted) setIsProductLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  /* ── 2. load related items ── */
  useEffect(() => {
    if (!product?.id) return;
    let isMounted = true;

    const loadRelated = async () => {
      setIsFeedLoading(true);
      setFeedError(null);

      try {
        const [sellerResult, brandResult] = await Promise.allSettled([
          product.user?.id
            ? fetchProductsByUserId(product.user.id)
            : Promise.reject("no seller"),
          toText(product.brand).trim()
            ? fetchFilteredProducts({ brand: toText(product.brand).trim(), pageSize: 40 })
            : Promise.reject("no brand"),
        ]);

        if (!isMounted) return;

        let memberMatches: ProductCardItem[] = [];
        if (sellerResult.status === "fulfilled") {
          memberMatches = sellerResult.value
            .filter((item) => String(item.id) !== String(product.id))
            .slice(0, 20);
        }

        let similarMatches: ProductCardItem[] = [];
        if (brandResult.status === "fulfilled") {
          similarMatches = brandResult.value.items
            .filter((item) => String(item.id) !== String(product.id))
            .slice(0, 20);
        }

        if (!memberMatches.length && !similarMatches.length) {
          const feed = await fetchProductsForHome(1, 40);
          if (!isMounted) return;
          const others = feed.items.filter((item) => String(item.id) !== String(product.id));
          memberMatches = others.slice(0, 20);
          similarMatches = others.slice(20, 40);
        } else if (!memberMatches.length) {
          memberMatches = similarMatches.slice(0, 20);
        } else if (!similarMatches.length) {
          similarMatches = memberMatches.slice(0, 20);
        }

        setMemberItems(memberMatches);
        setSimilarItems(similarMatches);
      } catch {
        if (!isMounted) return;
        setFeedError("Could not load related items.");
        setMemberItems([]);
        setSimilarItems([]);
      } finally {
        if (isMounted) setIsFeedLoading(false);
      }
    };

    loadRelated();
    return () => { isMounted = false; };
  }, [product]);

  /* ── 3. category breadcrumbs ── */
  useEffect(() => {
    const categoryName = toText(product?.category, "");
    if (!categoryName) { setCategoryTrail([]); return; }
    let isMounted = true;

    fetch(CATEGORY_TREE_ENDPOINT)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((payload: { data?: CategoryNode[] }) => {
        if (!isMounted) return;
        const tree = Array.isArray(payload?.data) ? payload.data : [];
        const pathNodes = findCategoryPath(tree, categoryName);
        setCategoryTrail(
          pathNodes?.length
            ? pathNodes.map((n) => ({ label: n.name, slug: n.slug || n.name }))
            : [{ label: categoryName, slug: categoryName }],
        );
      })
      .catch(() => {
        if (isMounted) setCategoryTrail([{ label: categoryName, slug: categoryName }]);
      });

    return () => { isMounted = false; };
  }, [product?.category]);

  /* ── derived values ── */
  const productImages = useMemo(
    () => (product?.images ?? []).map(toAbsoluteImageUrl).filter(Boolean) as string[],
    [product],
  );

  const visibleLimit = productImages.length >= 5 ? 5 : 4;
  const visibleImages = productImages.slice(0, visibleLimit);
  const imageCount = visibleImages.length;
  const lastVisibleIndex = Math.max(0, visibleImages.length - 1);

  const name = toText(product?.title, "Product title");
  const brand = toText(product?.brand, "No brand");
  // const size = toText(product?.size, "One size");
  const condition = toText(product?.condition, "Good");
  const price = toText(product?.price, "TBH 0.00");
  const description = toText(product?.description, "Product details are not available.");
  const color = toText(product?.color, "N/A");
  const uploadedAt = toRelativeUploadTime(product?.uploadedAt);
  const shippingFromPrice = toText(product?.shippingFromPrice, "TBH 100");
  const seller = product?.user ?? {};
  const isOwnProduct =
    user?.id && product?.user?.id && Number(user.id) === Number(product.user.id);

  const galleryGridClass =
    imageCount >= 4
      ? "min-h-[540px] grid-cols-1 sm:grid-cols-4"
      : imageCount === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : imageCount === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1";

  const getGalleryItemClass = (index: number) => {
    if (imageCount >= 4) return index === 0 ? "sm:col-span-2 sm:row-span-2" : "sm:col-span-1";
    if (imageCount === 3) return index === 0 ? "sm:col-span-2" : "sm:col-span-1";
    return "sm:col-span-1";
  };

  const productInfo = {
    productId: product?.id,
    documentId: product?.documentId,
    title: name,
    brand,
    // size,
    price: getPriceValue(price) || 0,
    currency: getCurrencyCode(price) || "TBH",
    imageUrl: productImages,
    buyerProtectionFee: 100.0,
    shippingFee: getPriceValue(shippingFromPrice) || 0,
    sellerId: seller?.id,
  };

  const handleAskSeller = async () => {
    if (!product?.id || !product.user?.id) {
      alert("Seller information not available");
      return;
    }
    try {
      const conversation = await createConversationForProduct({
        productId: Number(product.id),
        otherUserId: Number(product.user.id),
      });
      if (conversation?.id) {
        dispatch(fetchConversations());
        router.push(`/Messages?conversationId=${conversation.id}`);
      }
    } catch {
      alert("Failed to start conversation. Please try again.");
    }
  };

  // ── wishlist handler for main product heart button ─────────────────────────
  const handleWishlist = async () => {
    if (!product?.id || !user?.id) return;
    const nowLiked = !isWishlisted;
    handleFavChange(Number(product.id), nowLiked); // optimistic

    try {
      await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fav_products: nowLiked
            ? { connect: [Number(product.id)] }
            : { disconnect: [Number(product.id)] },
        }),
      });
    } catch (err) {
      console.error(err);
      handleFavChange(Number(product.id), !nowLiked); // rollback
    }
  };

  /* ─── LOADING / ERROR SCREENS ── */
  if (isProductLoading) return <ProductDetailSkeleton />;
  if (productError) return (
    <ProductErrorScreen message={productError} onRetry={() => window.location.reload()} />
  );

  /* ─── MAIN RENDER ── */
  return (
    <>
      <style>{`
        .pdp-root {
          background: #f7f4f0;
          min-height: 100vh;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .pdp-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          font-family: system-ui, sans-serif;
          letter-spacing: 0.02em;
          border: 1px solid #ddd;
          background: #fff;
          color: #444;
        }
        .pdp-tag.condition {
          background: #edf7ed;
          border-color: #b8deb8;
          color: #2d6a2d;
        }
        .pdp-btn-primary {
          width: 100%;
          padding: 13px 20px;
          border-radius: 999px;
          background: #c0613a;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          font-family: system-ui, sans-serif;
          border: none;
          cursor: pointer;
          transition: background 0.18s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .pdp-btn-primary:hover { background: #a8502e; transform: translateY(-1px); }
        .pdp-btn-primary:active { transform: translateY(0); }
        .pdp-btn-primary:disabled {
          background: #e0d8d2;
          color: #aaa;
          cursor: not-allowed;
          transform: none;
        }
        .pdp-btn-secondary {
          width: 100%;
          padding: 12px 20px;
          border-radius: 999px;
          background: transparent;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          font-family: system-ui, sans-serif;
          border: 1.5px solid #ccc;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          letter-spacing: 0.01em;
        }
        .pdp-btn-secondary:hover {
          border-color: #888;
          background: #f0ece8;
          transform: translateY(-1px);
        }
        .pdp-btn-secondary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }
        .pdp-trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #888;
          font-family: system-ui, sans-serif;
        }
        .pdp-trust-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #efe9e3;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pdp-seller-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          background: #e0d8d2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #fff;
          flex-shrink: 0;
        }
        .pdp-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid #ede8e3;
          font-size: 12px;
          font-family: system-ui, sans-serif;
        }
        .pdp-detail-row:last-child { border-bottom: none; }
        .pdp-section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          font-family: system-ui, sans-serif;
          margin-bottom: 14px;
          letter-spacing: -0.01em;
        }
        .pdp-skeleton-card {
          animation: pdp-pulse 1.4s ease-in-out infinite;
        }
        @keyframes pdp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pdp-wishlist-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid #ddd;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .pdp-wishlist-btn:hover { border-color: #c0613a; background: #fdf5f2; }
        .pdp-share-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid #ddd;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .pdp-share-btn:hover { border-color: #888; background: #f5f2ee; }
        .pdp-image-main {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .pdp-image-main:hover { transform: scale(1.02); }
      `}</style>

      <main className="pdp-root pb-16 pt-0">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

          {/* ── Top nav bar ── */}
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[13px] text-[#555] hover:text-[#222] transition-colors font-sans"
            >
              <ArrowLeft size={15} />
              Back
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#999] font-sans">
              <Link href="/" className="hover:text-[#c0613a] transition-colors">Home</Link>
              {categoryTrail.map((crumb, index) => (
                <span key={`${crumb.slug}-${index}`} className="contents">
                  <ChevronRight size={10} className="text-[#ccc]" />
                  <Link
                    href={`/Shop?category=${encodeURIComponent(crumb.slug)}`}
                    className="hover:text-[#c0613a] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                </span>
              ))}
              <ChevronRight size={10} className="text-[#ccc]" />
              <span className="text-[#555] truncate max-w-[140px]">{name}</span>
            </nav>

            <div className="flex items-center gap-2">
              {/* reserved for share/flag buttons */}
            </div>
          </div>

          {/* ── Main two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 lg:gap-12 items-start">

            {/* ── LEFT: Images ── */}
            <section>
              {/* Mobile carousel */}
              <div className="sm:hidden rounded-2xl overflow-hidden">
                <MobileImageCarousel images={productImages} title={name} />
              </div>

              {/* Desktop gallery */}
              <div className="hidden sm:block">
                <div className={`grid gap-2 rounded-2xl overflow-hidden ${galleryGridClass}`}>
                  {visibleImages.map((img, index) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden bg-[#ede8e2] ${getGalleryItemClass(index)}`}
                      style={{ minHeight: index === 0 && imageCount >= 2 ? 480 : 200 }}
                    >
                      {index === lastVisibleIndex && productImages.length > visibleImages.length ? (
                        <div
                          className="relative h-full w-full cursor-pointer"
                          onClick={() => {
                            setCarouselStartIndex(index);
                            setShowCarousel(true);
                          }}
                        >
                          <img src={img} alt={`${name} ${index + 1}`} className="pdp-image-main" style={{ minHeight: 200 }} />
                          <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white">
                            <div className="text-center">
                              <p className="text-2xl font-bold">+{productImages.length - visibleImages.length}</p>
                              <p className="text-xs mt-1 opacity-80 font-sans">View all</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="relative h-full w-full cursor-pointer"
                          onClick={() => {
                            const actualIndex = productImages.indexOf(img);
                            setCarouselStartIndex(actualIndex);
                            setShowCarousel(true);
                          }}
                        >
                          <img src={img} alt={`${name} ${index + 1}`} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Member items (below image on desktop) ── */}
              {!isOwnProduct && (
                <div className="mt-10 space-y-10">

                  {/* More from this seller */}
                  <section>
                    <p className="pdp-section-title">More from this seller</p>
                    {isFeedLoading ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="pdp-skeleton-card">
                            <div className="mb-2 aspect-[3/4] w-full rounded-xl bg-[#e5dfd8]" />
                            <div className="mb-1.5 h-2.5 w-3/4 rounded bg-[#e5dfd8]" />
                            <div className="h-2.5 w-1/2 rounded bg-[#e5dfd8]" />
                          </div>
                        ))}
                      </div>
                    ) : feedError ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-8 text-center">
                        <span className="mb-2 text-3xl">😕</span>
                        <p className="text-[13px] text-red-400 font-sans">{feedError}</p>
                      </div>
                    ) : memberItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                        <span className="mb-2 text-3xl">🛍️</span>
                        <p className="text-[13px] text-[#aaa] font-sans">No items found from this seller.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {memberItems.map((item) => (
                          <ProductCard
                            key={`member-${item.id}`}
                            {...item}
                            isLiked={favIds.includes(Number(item.id))}
                            onFavChange={handleFavChange}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* You might also like */}
                  <section>
                    <p className="pdp-section-title">You might also like</p>
                    {isFeedLoading ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="pdp-skeleton-card">
                            <div className="mb-2 aspect-[3/4] w-full rounded-xl bg-[#e5dfd8]" />
                            <div className="mb-1.5 h-2.5 w-3/4 rounded bg-[#e5dfd8]" />
                            <div className="h-2.5 w-1/2 rounded bg-[#e5dfd8]" />
                          </div>
                        ))}
                      </div>
                    ) : feedError ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-8 text-center">
                        <span className="mb-2 text-3xl">😕</span>
                        <p className="text-[13px] text-red-400 font-sans">{feedError}</p>
                      </div>
                    ) : similarItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                        <span className="mb-2 text-3xl">🛍️</span>
                        <p className="text-[13px] text-[#aaa] font-sans">No similar items found.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {similarItems.map((item) => (
                          <ProductCard
                            key={`similar-${item.id}`}
                            {...item}
                            isLiked={favIds.includes(Number(item.id))}
                            onFavChange={handleFavChange}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                </div>
              )}
            </section>

            {/* ── RIGHT: Product info ── */}
            <aside className="space-y-5 lg:sticky lg:top-6">

              {/* Brand + title + wishlist */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold tracking-widest text-[#c0613a] uppercase font-sans mb-1">
                      {brand}
                    </p>
                    <h1 className="text-[22px] font-bold leading-tight text-[#1a1a1a]" style={{ fontFamily: 'Georgia, serif' }}>
                      {name}
                    </h1>
                  </div>

                  {/* ── Main product wishlist button ── */}
                  <button
                    className="pdp-wishlist-btn mt-1"
                    onClick={handleWishlist}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={16}
                      className={isWishlisted ? "fill-[#c0613a] text-[#c0613a]" : "text-[#aaa]"}
                    />
                  </button>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[28px] font-bold text-[#c0613a]" style={{ fontFamily: 'Georgia, serif' }}>
                    {price}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#888] font-sans">
                  <ShieldCheck size={11} className="text-[#c0613a]" />
                  Includes Buyer Protection
                </p>
              </div>

              {/* Attribute pills */}
              <div className="flex flex-wrap gap-2">
                <span className="pdp-tag condition">{condition}</span>
                {/* <span className="pdp-tag">Size: {size}</span> */}
                <span className="pdp-tag">{color}</span>
              </div>

              {/* Description */}
              <p className="text-[13px] leading-relaxed text-[#666] font-sans">
                {description}
              </p>

              {/* Seller row */}
              <Link
                href={`/member/${seller?.id}`}
                className="flex items-center justify-between rounded-2xl border border-[#e8e2db] bg-white px-4 py-3 hover:border-[#c0613a] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {seller?.avatar ? (
                    <img
                      src={toAbsoluteImageUrl(seller.avatar)}
                      alt={toText(seller?.username, "Seller")}
                      className="pdp-seller-avatar"
                    />
                  ) : (
                    <div
                      className="pdp-seller-avatar"
                      style={{ background: "#c0613a" }}
                    >
                      {toText(seller?.username, "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1a1a] truncate font-sans">
                      {toText(seller?.username, "Seller")}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex text-[#f0a500]">
                        {[...Array(Math.min(5, Math.floor(seller?.rating_avg || 0)))].map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#999] font-sans">
                        {toText(seller?.reviews, "0")} reviews
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {seller?.city && (
                        <span className="flex items-center gap-1 text-[10px] text-[#aaa] font-sans">
                          <MapPin size={9} />
                          {toText(seller?.city)}, {toText(seller?.country)}
                        </span>
                      )}
                      {seller?.lastSeen && (
                        <span className="flex items-center gap-1 text-[10px] text-[#aaa] font-sans">
                          <Clock size={9} />
                          {toText(seller?.lastSeen)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#ccc] group-hover:text-[#c0613a] transition-colors flex-shrink-0" />
              </Link>

              {/* CTA Buttons */}
              <div className="space-y-2.5">
                {isOwnProduct ? (
                  <div className="w-full p-3 text-center text-[13px] text-[#aaa] bg-[#f0ece8] rounded-2xl font-sans">
                    You cannot buy your own product.
                  </div>
                ) : (
                  <Link href={{ pathname: "/CheckOut", query: productInfo }}>
                    <button className="pdp-btn-primary">
                      Buy Now
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleAskSeller}
                  disabled={!!isOwnProduct}
                  className="pdp-btn-secondary"
                >
                  <MessageCircle size={14} />
                  {isOwnProduct ? "Your product" : "Ask seller"}
                </button>
                {!isOwnProduct && product?.user?.id && (
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="pdp-btn-secondary"
                  >
                    <Tag size={14} />
                    Make an Offer
                  </button>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-around py-3 border-t border-b border-[#ede8e3]">
                <div className="pdp-trust-item">
                  <div className="pdp-trust-icon">
                    <ShieldCheck size={15} className="text-[#c0613a]" />
                  </div>
                  <span>Buyer Protection</span>
                </div>
                <div className="pdp-trust-item">
                  <div className="pdp-trust-icon">
                    <Truck size={15} className="text-[#c0613a]" />
                  </div>
                  <span>Fast Shipping</span>
                </div>
                <div className="pdp-trust-item">
                  <div className="pdp-trust-icon">
                    <RotateCcw size={15} className="text-[#c0613a]" />
                  </div>
                  <span>Easy Returns</span>
                </div>
              </div>

              {/* Product details table */}
              <div className="rounded-2xl border border-[#e8e2db] bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-[#ede8e3]">
                  <p className="text-[12px] font-semibold text-[#1a1a1a] font-sans tracking-wide uppercase">
                    Product details
                  </p>
                </div>
                <div className="px-4 py-1">
                  <div className="pdp-detail-row">
                    <span className="text-[#888]">Brand</span>
                    <span className="font-medium text-[#333]">{brand}</span>
                  </div>
                  {/* <div className="pdp-detail-row">
                    <span className="text-[#888]">Size</span>
                    <span className="font-medium text-[#333]">{size}</span>
                  </div> */}
                  <div className="pdp-detail-row">
                    <span className="text-[#888]">Condition</span>
                    <span className="font-medium text-[#333]">{condition}</span>
                  </div>
                  <div className="pdp-detail-row">
                    <span className="text-[#888]">Colour</span>
                    <span className="font-medium text-[#333]">{color}</span>
                  </div>

                  {/* Dynamic attributes */}
                  {product?.attributes
                    ?.filter((attr) => {
                      const skipCodes = new Set(["brand", "size", "condition", "colour", "color"]);
                      return attr.name && attr.value && !skipCodes.has(attr.code?.toLowerCase() ?? "");
                    })
                    .map((attr, index) => (
                      <div key={attr.id ?? index} className="pdp-detail-row">
                        <span className="text-[#888]">{attr.name}</span>
                        <span className="font-medium text-[#333]">{attr.value}</span>
                      </div>
                    ))}

                  <div className="pdp-detail-row">
                    <span className="text-[#888]">Shipping</span>
                    <span className="font-medium text-[#333]">from {shippingFromPrice}</span>
                  </div>
                  <div className="pdp-detail-row">
                    <span className="text-[#888]">Listed</span>
                    <span className="font-medium text-[#333]">{uploadedAt}</span>
                  </div>
                </div>
              </div>

              {/* Demand signal */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-[#fdf5f0] border border-[#f0ddd3] px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-[#c0613a] animate-pulse flex-shrink-0" />
                <p className="text-[12px] text-[#a04828] font-sans font-medium">
                  In demand — 3 buyers recently sent offers
                </p>
              </div>

              {/* Seller badge */}
              <div className="flex gap-3 rounded-2xl border border-[#e8e2db] bg-white p-4">
                <div className="rounded-xl bg-[#fdf0ea] p-2 self-start">
                  <PlusSquare className="text-[#c0613a]" size={16} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#1a1a1a] font-sans">
                    {toText(seller?.badge, "Frequent uploads")}
                  </p>
                  <p className="text-[11px] text-[#888] mt-0.5 font-sans leading-relaxed">
                    Regularly lists 5 or more items here.
                  </p>
                </div>
              </div>

            </aside>
          </div>
        </div>

        {/* Image carousel modal */}
        <ImageCarousel
          images={productImages}
          initialIndex={carouselStartIndex}
          isOpen={showCarousel}
          onClose={() => setShowCarousel(false)}
        />

        <div className="hidden md:block mt-16">
          <Footer />
        </div>
      </main>

      {/* Make Offer Modal */}
      {product && user && (
        <MakeOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          productId={Number(product.id)}
          productDocumentId={String(product.documentId)}
          productTitle={name}
          originalPrice={parseFloat(getPriceValue(price) || "0")}
          currency={getCurrencyCode(price) || "TBH"}
          sellerId={Number(product.user?.id)}
          buyerId={Number(user.id)}
        />
      )}
    </>
  );
}