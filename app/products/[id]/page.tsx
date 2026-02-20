"use client";
import ImageZoom from "@/app/components/ImageZoom";
import ImageCarousel from "@/app/components/ImageCarousel";
import { items } from "@/app/dataCenter";
import {
  Heart,
  Info,
  ShieldCheck,
  ChevronRight,
  Flag,
  Share2,
  Star,
  MapPin,
  Clock,
  PlusSquare,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Navbar from "@/app/components/navbar";
import ProductFeed from "@/app/Shop/page";
import Link from "next/link";
import Footer from "@/app/components/Footer";

const defaultProduct = {
  id: "",
  name: "Vintage Carhartt WIP Heart Hoodie - Black Edition",
  brand: "Carhartt",
  size: "L",
  condition: "Very good",
  color: "Black",
  price: "€53.15",
  totalPrice: "€53.15",
  imageUrl: "/product1.webp",
  images: [
    "/product1.webp",
    "/product2.webp",
    "/product3.webp",
    "/product4.webp",
    "/product1.webp",
    "/product2.webp",
    "/product3.webp",
    "/product4.webp",
  ],
  uploaded: "an hour ago",
  seller: {
    id: "1",
    name: "manueli11",
    location: "Granada, Spain",
    lastSeen: "Last seen 10 minutes ago",
    rating: 5,
    reviews: 437,
    badge: "Frequent Uploads",
  },
};

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  console.log(`Request received: GET /products/${id}`);

  const [products, setProducts] = useState(() => {
    const existing = items.find((p) => p.id === id);
    if (!existing) {
      const newProduct = { ...defaultProduct, id };
      return [...items, newProduct];
    }
    return items;
  });

  const product = products.find((p) => p.id === id) || defaultProduct;
  const productImages = (product as any).images || defaultProduct.images;

  const [showCarousel, setShowCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <>
      <Navbar />
      <div className="bg-[#f2f2f2] min-h-screen pb-12 mt-5">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-[#007782] mb-4">
            <span>Home</span>{" "}
            <ChevronRight size={12} className="text-gray-400" />
            <span>Men</span>{" "}
            <ChevronRight size={12} className="text-gray-400" />
            <span>Clothing</span>{" "}
            <ChevronRight size={12} className="text-gray-400" />
            <span className="text-gray-400">Carhartt Hoodies & sweaters</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_620px] gap-9 items-start">
            {/* LEFT: Image Gallery */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {productImages.slice(0, 4).map((img: string, index: number) => (
                  <div
                    key={index}
                    className={` bg-white ${index === 0 ? "col-span-2 lg:col-span-1" : ""}`}
                  >
                    {index === 3 && productImages.length > 4 ? (
                      <div className="relative">
                        <ImageZoom src={img} alt={`Product ${index + 1}`} />
                        <div
                          className="absolute inset-0 flex items-center justify-center font-semibold text-lg text-white bg-black bg-opacity-50 cursor-pointer"
                          onClick={() => setShowCarousel(true)}
                        >
                          + {productImages.length - 4}
                        </div>
                        <button className="absolute bottom-2 right-2 bg-white p-1.5 rounded-sm shadow-sm">
                          <Heart size={18} className="text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <ImageZoom src={img} alt={`Product ${index + 1}`} />
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
                <ProductFeed isProductDetail={true} productList={[...items]} />
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="space-y-4 sticky top-4">
              <div className="bg-white p-5 shadow-sm rounded-sm">
                <h1 className="text-lg font-normal">
                  {(product as any).name || defaultProduct.name}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                  {product.size} · {product.condition} ·{" "}
                  <span className="text-[#007782] underline">
                    {product.brand}
                  </span>
                </p>

                <div className="border-t pt-4">
                  <p className="text-gray-400 line-through text-sm">€49.95</p>
                  <p className="text-2xl font-bold text-[#007782]">
                    {product.price}
                  </p>
                  <p className="text-[#007782] text-[14px] flex items-center gap-1 mt-1 font-medium">
                    Includes Buyer Protection <Info size={12} />
                  </p>
                </div>

                <div className="mt-6 space-y-2 text-[13px] border-b pb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Brand</span>
                    <span className="text-[#007782] underline">
                      {product.brand}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size</span>
                    <span>{product.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Condition</span>
                    <span>{product.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Colour</span>
                    <span>{(product as any).color || "Black"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uploaded</span>
                    <span>
                      {(product as any).uploaded || defaultProduct.uploaded}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button className="w-full bg-[#007782] text-white py-2.5 rounded-[4px] font-semibold">
                    Buy now
                  </button>
                  <button className="w-full border border-[#007782] text-[#007782] py-2.5 rounded-[4px] font-semibold">
                    Make an offer
                  </button>
                  <button className="w-full border border-[#007782] text-[#007782] py-2.5 rounded-[4px] font-semibold">
                    Ask seller
                  </button>
                </div>
              </div>

              {/* Buyer Protection Card */}
              <div className="bg-white p-4 shadow-sm border-l-[3px] border-[#007782] flex gap-3">
                <ShieldCheck className="text-[#007782] shrink-0" size={20} />
                <div className="text-[12px] text-gray-700">
                  <p className="font-bold mb-1">Buyer Protection fee</p>
                  <p>
                    Added for a fee to every purchase...{" "}
                    <span className="text-[#007782] underline">
                      Refund Policy
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex justify-center min-h-screen">
                <div className="w-full  border border-gray-200 rounded-md bg-white shadow-sm h-fit">
                  {/* Header Section: User Info */}
                  <Link
                    href={`/member/${1 || product.seller?.id || defaultProduct.seller.id}`}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
                          alt={`${product.seller?.name || defaultProduct.seller.name} profile`}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-gray-100"
                        />
                      </div>
                      <div className="min-w-0">
                        {" "}
                        {/* min-w-0 prevents text overflow in flex */}
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                          {product.seller?.name || defaultProduct.seller.name}
                        </h2>
                        <div className="flex items-center gap-1">
                          <div className="flex text-yellow-400">
                            {[
                              ...Array(
                                Math.floor(
                                  Number(
                                    product.seller?.rating ??
                                      defaultProduct.seller.rating,
                                  ),
                                ),
                              ),
                            ].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill="currentColor"
                                className="sm:w-4 sm:h-4"
                              />
                            ))}
                          </div>
                          <span className="text-gray-500 text-xs sm:text-sm font-medium">
                            {product.seller?.reviews ||
                              defaultProduct.seller.reviews}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-gray-400 shrink-0"
                    />
                  </Link>

                  <hr className="border-gray-100" />

                  {/* Badge Section: Seller Badge */}
                  <div className="p-4 flex items-center gap-4">
                    <div className="bg-[#e6f7f6] p-2 rounded-lg shrink-0">
                      <PlusSquare className="text-[#00a09a]" size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm sm:text-base">
                        {product.seller?.badge || defaultProduct.seller.badge}
                      </p>
                      <p className="text-gray-500 text-xs sm:text-sm leading-snug">
                        {product.seller?.badge === "Frequent Uploads"
                          ? "Regularly lists 5 or more items."
                          : "New seller on the platform."}
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Info Section: Location & Status */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin size={18} className="text-gray-400 shrink-0" />
                      <span className="text-sm sm:text-base truncate">
                        {product.seller?.location ||
                          defaultProduct.seller.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock size={18} className="text-gray-400 shrink-0" />
                      <span className="text-sm sm:text-base">
                        {product.seller?.lastSeen ||
                          defaultProduct.seller.lastSeen}
                      </span>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Legal/Footer Section */}
                  <div className="p-4 bg-white">
                    <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed">
                      Consumer protection laws do not apply to your purchases
                      from other consumers. More specifically, the right of
                      withdrawal of{" "}
                      <span className="text-teal-600 underline cursor-pointer">
                        Articles 68 and following
                      </span>
                      ... Every purchase you make is covered by our{" "}
                      <span className="text-teal-600 underline cursor-pointer">
                        Buyer Protection
                      </span>{" "}
                      service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ImageCarousel
          images={productImages}
          initialIndex={0}
          isOpen={showCarousel}
          onClose={() => setShowCarousel(false)}
        />

         <div className="hidden md:block">
        <Footer />
      </div>
      </div>
    </>
  );
}
