"use client";
import Image from "next/image";
import { useAndroidNative } from "./components/useAndroidNative";
import ProductFeed from "./components/ProductFeed";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts } from "@/lib/features/productsSlice";
import type { ProductCardItem } from "@/services/products-service";
import {
  HomeSkeleton,
  NavbarSkeleton,
  ProductGridEmpty,
  ProductGridSkeleton,
} from "./components/Skeletons";
import { ArrowRight, Camera, Leaf, RefreshCw, Search, Shield, ShieldCheck, TrendingUp } from "lucide-react";
import FooterV2 from "./components/FooterV2";

export default function Home() {
  const { isAndroid, isReady } = useAndroidNative();
  const dispatch = useAppDispatch();
  const pageSize = 20;
  const [showBanner, setShowBanner] = useState(true);
  const [showBrowse, setShowBrowse] = useState(false);
  const products = useAppSelector((state) => state.products.items);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);
  const page = useAppSelector((state) => state.products.page);
  const hasMore = useAppSelector((state) => state.products.hasMore);

  const isLoading = status === "loading";
  const isLoadingMore = status === "loading" && products.length > 0;

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, pageSize }));
  }, [dispatch]);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    dispatch(fetchProducts({ page: nextPage, pageSize }));
  };
  if (!isReady)
    return (
      <>
        {/* <NavbarSkeleton /> */}
        <HomeSkeleton />
        <ProductGridSkeleton />
      </>
    );
  if (isAndroid) {
    return (
      <AndroidHome
        products={products}
        onLoadMore={handleLoadMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        error={error}
      />
    );
  }

  return (
    !isAndroid && (
      <div className="min-h-screen flex flex-col">
        {
          // <section className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-gray-200 overflow-hidden">
          //   <Image
          //     src="https://static.vinted.com/assets/seller-promotion/default/banner-wide-1ca50d3217a3d2402dda712a8e79af381c4bd7cd5cceb0a0b7be17ac2c7522d8.jpg"
          //     alt="Decluttering"
          //     className="w-full h-full object-cover"
          //     priority
          //     width={1920}
          //     height={600}
          //   />

          //   <div
          //     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          //               md:left-20 md:translate-x-0
          //               bg-white p-6 md:p-10 rounded-lg shadow-xl
          //               w-[90%] max-w-[350px] md:max-w-sm"
          //   >
          //     <h2 className="text-2xl md:text-3xl font-medium mb-4 md:mb-6 leading-tight">
          //       Ready to declutter your wardrobe?
          //     </h2>
          //     <Link href={`/SellNow`}>
          //       <button className="w-full bg-[#cb6f4d] hover:bg-[#005f68] transition-colors text-white py-3 rounded-md font-semibold mb-4">
          //         Sell now
          //       </button>
          //     </Link>
          //     <a
          //       href="#"
          //       className="text-[#cb6f4d] underline block text-center text-sm"
          //     >
          //       Learn how it works
          //     </a>
          //   </div>
          // </section>
          <section className="relative h-[500px] w-full overflow-hidden bg-gray-200 md:h-[600px] lg:h-[600px]">
            {/* Background Image */}
            <Image
              // src="https://static.vinted.com/assets/seller-promotion/default/banner-wide-1ca50d3217a3d2402dda712a8e79af381c4bd7cd5cceb0a0b7be17ac2c7522d8.jpg"
               src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=85"
              alt="Hero Fashion"
              className="h-full w-full object-cover"
              priority
              width={1920}
              height={700}
            />

            {/* Floating Badge (Top Right) */}
            <div className="absolute right-4 top-6 hidden items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 shadow-sm md:flex">
              <span className="h-2 w-2 rounded-full bg-[#cb6f4d]"></span>
              <span className="text-sm font-medium text-gray-700">
                50K+ items available
              </span>
            </div>

            {/* Main Content Card */}
            <div
              className="absolute bottom-10 left-1/2 w-[92%] -translate-x-1/2 rounded-2xl bg-white p-8 shadow-2xl 
                   md:bottom-auto md:left-10 md:top-1/2 md:w-full md:max-w-[420px] md:-translate-x-0 md:-translate-y-1/2 lg:left-24"
            >
              <h2 className="mb-3 font-serif text-3xl font-bold leading-[1.1] text-gray-900 md:text-4xl">
                Ready to declutter your wardrobe?
              </h2>

              <p className="mb-8 text-[15px] leading-relaxed text-gray-600">
                Buy and sell pre-loved fashion — easily, safely, sustainably.
              </p>

              <div className="flex flex-col gap-3">
                <Link href="/SellNow">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#cb6f4d] py-3.5 text-[16px] font-semibold text-white transition-opacity hover:opacity-90">
                    Sell now <span>→</span>
                  </button>
                </Link>

                <Link href="/Shop">
                  <button onClick={() => setShowBrowse(true)} className="w-full rounded-xl border border-gray-200 bg-[#fbfbfb] py-3.5 text-[16px] font-semibold text-gray-800 transition-colors hover:bg-gray-50">
                    Start Shopping
                  </button>
                </Link>
              </div>
            </div>
          </section>
        }

        <section className="max-w-7xl mx-auto w-full px-4 py-4 md:py-6">
          {/* {showBanner && (
            <div className="flex justify-between items-center border border-gray-100 rounded-sm p-3 md:p-4 mb-4 md:mb-8 bg-white shadow-sm">
              <p className="text-sm md:text-[15px] text-gray-600">
                Shipping fees will be added at checkout
              </p>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-black text-2xl font-light px-2"
              >
                ×
              </button>
            </div>
          )} */}
          <div className="flex items-end justify-between mb-6 md:mb-8 border-b border-gray-100 pb-4">
            {/* Title using Serif font to match the image style */}
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
              Just listed
            </h2>

            {/* See all Link with brand color and hover state */}
            <Link
              href="/Shop"
              className="group flex items-center gap-1 px-3 py-1 rounded-md transition-all duration-200 hover:bg-[rgb(203,111,77)]"
              style={{ color: "rgb(203, 111, 77)" }}
            >
              <span className="text-[15px] font-medium transition-colors group-hover:text-white">
                See all
              </span>
              <ArrowRight
                size={18}
                className="transition-all duration-200 group-hover:text-white group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="mt-2">
            <ProductFeed
              productList={products}
              onLoadMore={handleLoadMore}
              isLoadingMore={isLoadingMore}
              isLoading={isLoading}
              hasMore={hasMore}
            />
            {isLoading && products.length === 0 && (
              <p className="mt-4 text-center text-sm text-gray-400">
                Loading products...
              </p>
            )}
            {error && (
              <p className="mt-4 text-center text-sm text-red-500">{error}</p>
            )}
          </div>
        </section>
        {/* How Reluv Works Section */}
        <section className="bg-[#fbfbfb] py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">How Reluv works</h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              Buying and selling pre-loved fashion has never been easier — or more rewarding.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <WorkStep 
                number="01" 
                title="Snap & list" 
                desc="Take a few photos of what you want to sell, add a description and price — it takes under 2 minutes."
                icon={<Camera className="text-orange-600" size={20} />}
                iconBg="bg-orange-50"
              />
              <WorkStep 
                number="02" 
                title="Browse & buy" 
                desc="Discover thousands of pre-loved items from real people. Filter by size, brand, condition and more."
                icon={<Search className="text-green-600" size={20} />}
                iconBg="bg-green-50"
              />
              <WorkStep 
                number="03" 
                title="Pay safely" 
                desc="Checkout is secure and your money is only released to the seller once you confirm you're happy."
                icon={<ShieldCheck className="text-blue-600" size={20} />}
                iconBg="bg-blue-50"
              />
              <WorkStep 
                number="04" 
                title="Repeat the cycle" 
                desc="Give clothes a second life. Every purchase reduces waste — fashion that's good for your wallet and the planet."
                icon={<RefreshCw className="text-purple-600" size={20} />}
                iconBg="bg-purple-50"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/SellNow">
                <button className="px-8 py-3 bg-[#cb6f4d] text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
                  Start selling
                </button>
              </Link>
              <Link href="/Shop">
                <button className="px-8 py-3 bg-white border border-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                  Browse items
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dark CTA Section */}
        <section className="max-w-8xl mx-auto px-4 py-16">
          <div className="relative overflow-hidden bg-[#1a1816] rounded-[2rem] p-8 md:p-16 text-white" style={{ backgroundImage: 'radial-gradient(circle, #fff .25px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {/* Dot pattern background deco */}
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="max-w-xl">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                  Turn your closet into cash
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Listing is free and takes less than 5 minutes. Join thousands of sellers earning from their wardrobe.
                </p>
                <Link href="/SellNow">
                  <button className="px-8 py-3 bg-[#e2e8e4] text-[#1a1816] rounded-full font-bold hover:bg-white transition-colors">
                    Start Selling
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <FeatureItem icon={<Leaf size={24}/>} title="Sustainable" desc="Reduce fashion waste" />
                <FeatureItem icon={<TrendingUp size={24}/>} title="Profitable" desc="Earn from your closet" />
                <FeatureItem icon={<Shield size={24}/>} title="Protected" desc="Secure transactions" />
              </div>
            </div>
          </div>
        </section>
        {/* <FooterV2 /> */}
        <Footer />
      </div>
    )
  );
}
function WorkStep({ number, title, desc, icon, iconBg }: { number: string, title: string, desc: string, icon: React.ReactNode, iconBg: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 text-left flex flex-col h-full">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <div className="text-gray-200 font-serif text-2xl font-bold mb-2">{number}</div>
      <h3 className="text-gray-900 font-bold text-xl mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="p-3 bg-white/10 rounded-xl">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-gray-400 text-xs">{desc}</p>
      </div>
    </div>
  );
}

function AndroidHome({
  products,
  onLoadMore,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
}: {
  products: ProductCardItem[];
  onLoadMore: () => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
}) {
  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#1f2937] pb-24">
      <ProductFeed
        productList={products}
        onLoadMore={onLoadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        className="px-3 pt-3"
        gridClassName="grid grid-cols-2 gap-3"
        cardVariant="android"
      />

      {isLoading && products.length === 0 && (
        <p className="mt-2 text-center text-sm text-[#6b7280]">
          Loading products...
        </p>
      )}
      {error && (
        <p className="mt-2 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
