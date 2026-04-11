'use client';
import Image from "next/image";
import AndroidChrome from "./components/AndroidChrome";
import { useAndroidNative } from "./components/useAndroidNative";
import Navbar from "./components/navbar";
import ProductFeed from "./components/ProductFeed";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts } from "@/lib/features/productsSlice";
import type { ProductCardItem } from "@/services/products-service";



export default function Home() {
  const { isAndroid, isReady } = useAndroidNative();
  const dispatch = useAppDispatch(); 
  const pageSize = 20;
  const [showBanner, setShowBanner] = useState(true);
  const [openInBox, setOpenInBox] = useState(false);
  
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

  if (!isReady) {
    return (
      <div className="min-h-screen reluv-loading-screen flex items-center justify-center">
        <div className="reluv-loading reluv-loading-text">Reluv</div>
      </div>
    );
  }

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
      {!openInBox && <Navbar />}
      
      {!openInBox && (
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-gray-200 overflow-hidden">
          <Image
            src="https://static.vinted.com/assets/seller-promotion/default/banner-wide-1ca50d3217a3d2402dda712a8e79af381c4bd7cd5cceb0a0b7be17ac2c7522d8.jpg"
            alt="Decluttering"
            className="w-full h-full object-cover"
            priority
            width={1920}
            height={600}
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        md:left-20 md:translate-x-0 
                        bg-white p-6 md:p-10 rounded-lg shadow-xl 
                        w-[90%] max-w-[350px] md:max-w-sm">
            <h2 className="text-2xl md:text-3xl font-medium mb-4 md:mb-6 leading-tight">
              Ready to declutter your wardrobe?
            </h2>
            <Link href={`/SellNow`}>
            <button className="w-full bg-[#007782] hover:bg-[#005f68] transition-colors text-white py-3 rounded-md font-semibold mb-4">
              Sell now
            </button>
            </Link>
            <a
              href="#"
              className="text-[#007782] underline block text-center text-sm"
            >
              Learn how it works
            </a>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto w-full px-4 py-4 md:py-6">
        {showBanner && (
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
        )}
        
        <div className="mt-2">
          <ProductFeed
            productList={products}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}            
            isLoading={isLoading}
            hasMore={hasMore}

          />
          {isLoading && products.length === 0 && (
            <p className="mt-4 text-center text-sm text-gray-400">Loading products...</p>
          )}
          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
)
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
      <AndroidChrome />
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
        <p className="mt-2 text-center text-sm text-[#6b7280]">Loading products...</p>
      )}
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

    </div>
  );
}
