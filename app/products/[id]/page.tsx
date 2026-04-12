"use client";

import ImageCarousel from "@/app/components/ImageCarousel";
import ImageZoom from "@/app/components/ImageZoom";
import Footer from "@/app/components/Footer";

import ProductCard from "@/app/components/ProductCard";
import { API_BASE_URL } from "@/app/constants/api";
import { CATEGORY_TREE_ENDPOINT, CategoryNode } from "@/lib/categoryUtils";
import {
  fetchProductById,
  fetchProductsForHome,
  ProductCardItem,
  ProductDetailItem,
} from "@/services/products-service";
import {
  ChevronRight,
  Clock,
  Flag,
  Heart,
  Info,
  MapPin,
  PlusSquare,
  Share2,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const toAbsoluteImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

const toText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

type BreadcrumbItem = { label: string; slug: string };

const findCategoryPath = (nodes: CategoryNode[], targetName: string): CategoryNode[] | null => {
  for (const node of nodes) {
    if (node.name.toLowerCase() === targetName.toLowerCase()) {
      return [node];
    }
    const childPath = findCategoryPath(node.categories || [], targetName);
    if (childPath) {
      return [node, ...childPath];
    }
  }
  return null;
};

const toRelativeUploadTime = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) return "18 min ago";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "18 min ago";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d ago`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = String(idParam ?? "").trim();

  const [product, setProduct] = useState<ProductDetailItem | null>(null);
  const [memberItems, setMemberItems] = useState<ProductCardItem[]>([]);
  const [similarItems, setSimilarItems] = useState<ProductCardItem[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [categoryTrail, setCategoryTrail] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setIsLoading(false);
      setLoadError("Invalid product id.");
      return;
    }

    const loadProduct = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await fetchProductById(id);
        if (!isMounted) return;
        setProduct(result);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load product.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const loadRelatedItems = async () => {
      if (!product?.id) return;
      setIsFeedLoading(true);
      try {
        const feed = await fetchProductsForHome(1, 60);
        if (!isMounted) return;

        const others = feed.items.filter((item) => String(item.id) !== String(product.id));
        const memberMatches = others.filter((item) => {
          if (!item.userId || !product?.user?.id) return false;
          return String(item.userId) === String(product.user.id);
        });
        const similarMatches = others.filter((item) => {
          const currentBrand = toText(product.brand).toLowerCase();
          return currentBrand.length > 0 && toText(item.brand).toLowerCase() === currentBrand;
        });

        const fallbackMember = others.slice(0, 20);
        const fallbackSimilar = others.filter(
          (item) => !fallbackMember.some((memberItem) => memberItem.id === item.id),
        );

        setMemberItems((memberMatches.length ? memberMatches : fallbackMember).slice(0, 20));
        setSimilarItems((similarMatches.length ? similarMatches : fallbackSimilar).slice(0, 20));
      } catch {
        if (!isMounted) return;
        setMemberItems([]);
        setSimilarItems([]);
      } finally {
        if (!isMounted) return;
        setIsFeedLoading(false);
      }
    };

    loadRelatedItems();

    return () => {
      isMounted = false;
    };
  }, [product]);

  const productImages = useMemo(() => {
    const images = product?.images ?? [];
    return images.map(toAbsoluteImageUrl).filter(Boolean) as string[];
  }, [product]);
  const visibleLimit = productImages.length >= 5 ? 5 : 4;
  const visibleImages = productImages.slice(0, visibleLimit);
  const imageCount = visibleImages.length;
  const lastVisibleIndex = Math.max(0, visibleImages.length - 1);

  const name = toText(product?.title, "Product title");
  const brand = toText(product?.brand, "No brand");
  const size = toText(product?.size, "One size");
  const condition = toText(product?.condition, "Good");
  const material = toText(product?.material, "Not specified");
  const price = toText(product?.price, "EUR 0.00");
  const description = toText(product?.description, "Product details are not available.");
  const color = toText(product?.color, "N/A");
  const uploadedAt = toRelativeUploadTime(product?.uploadedAt);
  const shippingFromPrice = toText(product?.shippingFromPrice, "EUR 2.95");
  const seller = product?.user ?? {};
  const categoryName = toText(product?.category, "");
  const galleryGridClass =
    imageCount >= 4
      ? "min-h-[540px] grid-cols-1 sm:grid-cols-4"
      : imageCount === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : imageCount === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1";

  const getGalleryItemClass = (index: number): string => {
    if (imageCount >= 4) return index === 0 ? "sm:col-span-2 sm:row-span-2" : "sm:col-span-1";
    if (imageCount === 3) return index === 0 ? "sm:col-span-2" : "sm:col-span-1";
    return "sm:col-span-1";
  };

  useEffect(() => {
    let isMounted = true;

    const resolveCategoryTrail = async () => {
      if (!categoryName) {
        setCategoryTrail([]);
        return;
      }

      try {
        const response = await fetch(CATEGORY_TREE_ENDPOINT);
        if (!response.ok) throw new Error("Failed to load category tree");
        const payload = (await response.json()) as { data?: CategoryNode[] };
        const tree = Array.isArray(payload?.data) ? payload.data : [];
        const pathNodes = findCategoryPath(tree, categoryName);

        if (!isMounted) return;

        if (pathNodes && pathNodes.length > 0) {
          setCategoryTrail(
            pathNodes.map((node) => ({
              label: node.name,
              slug: node.slug || node.name,
            })),
          );
          return;
        }

        setCategoryTrail([{ label: categoryName, slug: categoryName }]);
      } catch {
        if (!isMounted) return;
        setCategoryTrail([{ label: categoryName, slug: categoryName }]);
      }
    };

    resolveCategoryTrail();

    return () => {
      isMounted = false;
    };
  }, [categoryName]);

  return (
    <>
      {/* < /> */}
      <main className="min-h-screen bg-[#f3f3f3] pb-14 pt-4">
        <div className="mx-auto w-full max-w-320 px-4">
          <nav className="mb-3 flex items-center gap-2 text-[11px] text-[#6f6f6f]">
            <Link href="/" className="hover:text-[#007782] hover:underline">
              Home
            </Link>
            {categoryTrail.map((crumb, index) => (
              <span key={`${crumb.slug}-${index}`} className="contents">
                <ChevronRight size={11} className="text-[#9f9f9f]" />
                <Link
                  href={`/Shop?category=${encodeURIComponent(crumb.slug)}`}
                  className="hover:text-[#007782] hover:underline"
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
            <ChevronRight size={11} className="text-[#9f9f9f]" />
            <span>{name}</span>
          </nav>

          {isLoading && <p className="mb-4 text-sm text-gray-500">Loading product...</p>}
          {loadError && <p className="mb-4 text-sm text-red-500">{loadError}</p>}

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-3">
              <div className="rounded-sm bg-white p-2">
                <div className={`grid gap-2 ${galleryGridClass}`}>
                  {visibleImages.map((img, index) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden bg-[#f5f5f5] ${getGalleryItemClass(index)}`}
                    >
                      {index === lastVisibleIndex && productImages.length > visibleImages.length ? (
                        <div className="relative h-full" onClick={() => setShowCarousel(true)}>
                          <ImageZoom src={img} alt={`${name} ${index + 1}`} />
                          <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-lg font-semibold text-white">
                            + {productImages.length - visibleImages.length}
                          </div>
                          <button className="absolute bottom-2 right-2 rounded-sm bg-white p-1.5 shadow-sm">
                            <Heart size={18} className="text-gray-400" />
                          </button>
                        </div>
                      ) : (
                        <ImageZoom src={img} alt={`${name} ${index + 1}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pr-1 text-[#8a8a8a]">
                <Flag size={15} className="cursor-pointer" />
                <Share2 size={15} className="cursor-pointer" />
              </div>

              <section className="space-y-3 pt-1">
                <h2 className="text-sm font-semibold text-[#222]">Member items</h2>
                {isFeedLoading ? <p className="text-sm text-gray-500">Loading items...</p> : null}
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 lg:grid-cols-5">
                  {memberItems.map((item) => (
                    <ProductCard key={`member-${item.id}`} {...item} />
                  ))}
                </div>
              </section>

              <section className="space-y-3 pt-4">
                <h2 className="text-sm font-semibold text-[#222]">Similar items</h2>
                {isFeedLoading ? null : (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 lg:grid-cols-5">
                    {similarItems.map((item) => (
                      <ProductCard key={`similar-${item.id}`} {...item} />
                    ))}
                  </div>
                )}
              </section>
            </section>

            <aside className="space-y-3">
              <div className="rounded-sm border border-[#e3e3e3] bg-white p-4">
                <h1 className="text-[13px] font-medium leading-[1.3] text-[#333]">{name}</h1>
                <p className="mt-1 text-[12px] text-[#666]">
                  {size} / {condition} / <span className="text-[#007782]">{brand}</span>
                </p>
                <p className="mt-2 text-[12px] leading-[1.35] text-[#666]">{description}</p>

                <div className="mt-4 space-y-0.5 border-b border-[#ececec] pb-3">
                  <p className="text-[22px] font-semibold leading-none text-[#111]">{price}</p>
                  <p className="flex items-center gap-1 text-[12px] font-medium text-[#007782]">
                    Includes Buyer Protection <Info size={12} />
                  </p>
                </div>

                <div className="mt-3 rounded-sm bg-[#f7f7f7] p-2 text-[11px] text-[#666]">
                  <p className="mb-1 text-[#222]">In demand: 3 buyers recently sent offers</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span>Brand</span>
                    <span className="text-[#333]">{brand}</span>
                    <span>Size</span>
                    <span className="text-[#333]">{size}</span>
                    <span>Condition</span>
                    <span className="text-[#333]">{condition}</span>
                    <span>Material</span>
                    <span className="text-[#333]">{material}</span>
                    <span>Colour</span>
                    <span className="text-[#333]">{color}</span>
                    <span>Uploaded</span>
                    <span className="text-[#333]">{uploadedAt}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-b border-[#ececec] pb-3 text-[12px] text-[#666]">
                  <span>Shipping</span>
                  <span>from {shippingFromPrice}</span>
                </div>

                <div className="mt-3 space-y-2">
                  <button className="w-full rounded-[4px] bg-[#007782] py-2 text-[13px] font-semibold text-white">
                    Buy now
                  </button>
                  <button className="w-full rounded-[4px] border border-[#007782] py-2 text-[13px] font-semibold text-[#007782]">
                    Make an offer
                  </button>
                  <button className="w-full rounded-[4px] border border-[#007782] py-2 text-[13px] font-semibold text-[#007782]">
                    Ask seller
                  </button>
                </div>
              </div>

              <div className="flex gap-3 rounded-sm border border-[#e3e3e3] bg-white p-3">
                <ShieldCheck className="shrink-0 text-[#007782]" size={18} />
                <div className="text-[11px] leading-[1.35] text-[#666]">
                  <p className="mb-1 font-semibold text-[#222]">Buyer Protection fee</p>
                  <p>
                    Added to every purchase. <span className="text-[#007782] underline">Refund Policy</span> applies.
                  </p>
                </div>
              </div>

              <div className="rounded-sm border border-[#e3e3e3] bg-white">
                <Link href={`/member/${seller?.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
                      alt={`${toText(seller?.username, "Seller")} profile`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-[14px] font-semibold text-[#222]">{toText(seller?.username, "Seller")}</h2>
                      <div className="flex items-center gap-1">
                        <div className="flex text-yellow-400">
                          {[...Array(Math.floor(seller?.rating_avg || 0))].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#666]">{toText(seller?.reviews, "0")}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#999]" />
                </Link>

                <div className="border-y border-[#f0f0f0] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-md bg-[#e8f7f6] p-2">
                      <PlusSquare className="text-[#00a09a]" size={14} />
                    </div>
                    <p className="text-[12px] font-semibold text-[#222]">{toText(seller?.badge, "Frequent uploads")}</p>
                  </div>
                  <p className="text-[11px] text-[#666]">Regularly lists 5 or more items here.</p>
                </div>

                <div className="space-y-2 p-3 text-[12px] text-[#666]">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#8b8b8b]" />
                    <span>
                      {toText(seller?.city, "Unknown city")}, {toText(seller?.country, "Unknown country")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#8b8b8b]" />
                    <span>{toText(seller?.lastSeen, "Last seen 10 min ago")}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <ImageCarousel images={productImages} initialIndex={0} isOpen={showCarousel} onClose={() => setShowCarousel(false)} />

        <div className="hidden md:block">
          <Footer />
        </div>
      </main>
    </>
  );
}
