"use client";

import ImageCarousel from "@/app/components/ImageCarousel";
import ImageZoom from "@/app/components/ImageZoom";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/navbar";
import ProductFeed from "@/app/Shop/page";
// import { items } from "@/app/dataCenter";
import { API_BASE_URL } from "@/app/constants/api";
import { fetchProductById, ProductDetailItem } from "@/services/products-service";
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

// const defaultProduct = {
//   name: "Vintage Carhartt WIP Heart Hoodie - Black Edition",
//   brand: "Carhartt",
//   size: "L",
//   condition: "Very good",
//   color: "Black",
//   price: "EUR 53.15",
//   totalPrice: "EUR 53.15",
//   description: "Product details are not available.",
//   images: ["/product1.webp", "/product2.webp", "/product3.webp", "/product4.webp"],
// };

// const Seller = {
//   id: "1",
//   name: "manueli11",
//   location: "Granada, Spain",
//   lastSeen: "Last seen 10 minutes ago",
//   rating: 5,
//   reviews: 437,
//   badge: "Frequent Uploads",
// };

const toAbsoluteImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = String(idParam ?? "").trim();

  const [product, setProduct] = useState<any>(null);
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

  const productImages = useMemo(() => {
    const images = product?.images ?? [];
    // if (images.length === 0) return defaultProduct.images;
    return images.map(toAbsoluteImageUrl).filter(Boolean);
  }, [product]);

  const name = product?.title
  const brand = product?.brand
  const size = product?.size
  const condition = product?.condition
  const price = product?.price
  const totalPrice = product?.totalPrice
  const description = product?.description
  const color = product?.color ?? "";
  const likes = product?.likes ?? 0;
  const Seller = product?.user ?? {};

  return (
    <>
      <Navbar />
      <div className="mt-5 min-h-screen bg-[#f2f2f2] pb-12">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-4 flex items-center gap-2 text-xs text-[#007782]">
            <span>Home</span>
            <ChevronRight size={12} className="text-gray-400" />
            <span>Shop</span>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="text-gray-400">{name}</span>
          </nav>

          {isLoading && <p className="mb-4 text-sm text-gray-500">Loading product...</p>}
          {loadError && <p className="mb-4 text-sm text-red-500">{loadError}</p>}

          <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[1fr_620px]">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {productImages.slice(0, 4).map((img:any, index:any) => (
                  <div key={index} className={`bg-white ${index === 0 ? "col-span-2 lg:col-span-1" : ""}`}>
                    {index === 3 && productImages.length > 4 ? (
                      <div className="relative">
                        <ImageZoom src={img} alt={`${name} ${index + 1}`} />
                        <div
                          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-lg font-semibold text-white"
                          onClick={() => setShowCarousel(true)}
                        >
                          + {productImages.length - 4}
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

              <div className="flex justify-between text-gray-400">
                <Flag size={18} className="cursor-pointer" />
                <Share2 size={18} className="cursor-pointer" />
              </div>

              <div>
                <h2>Member Items</h2>
                {/* <ProductFeed isProductDetail={true} productList={[...items]} /> */}
              </div>
            </div>

            <div className="sticky top-4 space-y-4">
              <div className="rounded-sm bg-white p-5 shadow-sm">
                <h1 className="text-lg font-normal">{name}</h1>
                <p className="mb-2 text-sm text-gray-500">
                  {size} - {condition} - <span className="text-[#007782] underline">{brand}</span>
                </p>
                <p className="mb-4 text-sm text-gray-600">{description}</p>

                <div className="border-t pt-4">
                  <p className="text-2xl font-bold text-[#007782]">{price}</p>
                  <p className="mt-1 flex items-center gap-1 text-[14px] font-medium text-[#007782]">
                    Includes Buyer Protection <Info size={12} />
                  </p>
                </div>

                <div className="mt-6 space-y-2 border-b pb-6 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Brand</span>
                    <span className="text-[#007782] underline">{brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size</span>
                    <span>{size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Condition</span>
                    <span>{condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Colour</span>
                    <span>{color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span>{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Likes</span>
                    <span>{likes}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button className="w-full rounded-[4px] bg-[#007782] py-2.5 font-semibold text-white">Buy now</button>
                  <button className="w-full rounded-[4px] border border-[#007782] py-2.5 font-semibold text-[#007782]">
                    Make an offer
                  </button>
                  <button className="w-full rounded-[4px] border border-[#007782] py-2.5 font-semibold text-[#007782]">
                    Ask seller
                  </button>
                </div>
              </div>

              <div className="flex gap-3 border-l-[3px] border-[#007782] bg-white p-4 shadow-sm">
                <ShieldCheck className="shrink-0 text-[#007782]" size={20} />
                <div className="text-[12px] text-gray-700">
                  <p className="mb-1 font-bold">Buyer Protection fee</p>
                  <p>
                    Added for a fee to every purchase... <span className="text-[#007782] underline">Refund Policy</span>.
                  </p>
                </div>
              </div>

              <div className="flex min-h-screen justify-center">
                <div className="h-fit w-full rounded-md border border-gray-200 bg-white shadow-sm">
                  <Link
                    href={`/member/${Seller?.id}`}
                    className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
                          alt={`${Seller?.username} profile`}
                          className="h-14 w-14 rounded-full border border-gray-100 object-cover sm:h-16 sm:w-16"
                        />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-gray-800 sm:text-xl">{Seller?.username}</h2>
                        <div className="flex items-center gap-1">
                          <div className="flex text-yellow-400">
                            {[...Array(Math.floor(Seller?.rating_avg || []))].map((_, i) => (
                              <Star key={i} size={14} fill="currentColor" className="sm:h-4 sm:w-4" />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-gray-500 sm:text-sm">{Seller?.reviews}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="shrink-0 text-gray-400" />
                  </Link>

                  <hr className="border-gray-100" />

                  <div className="flex items-center gap-4 p-4">
                    <div className="shrink-0 rounded-lg bg-[#e6f7f6] p-2">
                      <PlusSquare className="text-[#00a09a]" size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 sm:text-base">{Seller?.badge}</p>
                      <p className="text-xs leading-snug text-gray-500 sm:text-sm">Regularly lists 5 or more items.</p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-3 p-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin size={18} className="shrink-0 text-gray-400" />
                      <span className="truncate text-sm sm:text-base">{Seller?.city}, {Seller?.country}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock size={18} className="shrink-0 text-gray-400" />
                      <span className="text-sm sm:text-base">{Seller?.lastSeen || "10 min ago, Last Seen"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ImageCarousel images={productImages} initialIndex={0} isOpen={showCarousel} onClose={() => setShowCarousel(false)} />

        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    </>
  );
}
