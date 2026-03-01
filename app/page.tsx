'use client';
import Image from "next/image";
import Navbar from "./components/navbar";
import ProductFeed from "./Shop/page";
import Footer from "./components/Footer";
import { items } from "./dataCenter";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProductsForHome, ProductCardItem } from "@/services/products-service";

export default function Home() {
  const pageSize = 20;
  const [showBanner, setShowBanner] = useState(true);
  const [openInBox, setOpenInBox] = useState(false);
  const [products, setProducts] = useState<ProductCardItem[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await fetchProductsForHome(1, pageSize);
        if (!isMounted) return;
        if (result.items.length > 0) {
          setProducts(result.items || []);
        }
        setPage(result.page);
        setHasMore(result.hasMore);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load products");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setLoadError(null);
    try {
      const nextPage = page + 1;
      const result = await fetchProductsForHome(nextPage, pageSize);
      setProducts((prev:any) => [...prev, ...result.items]);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!openInBox && <Navbar />}
      
      {!openInBox && (
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-gray-200 overflow-hidden">
          {/* Background Image */}
          <Image
            src="https://static.vinted.com/assets/seller-promotion/default/banner-wide-1ca50d3217a3d2402dda712a8e79af381c4bd7cd5cceb0a0b7be17ac2c7522d8.jpg"
            alt="Decluttering"
            className="w-full h-full object-cover"
            priority // Added priority for LCP
            width={1920}
            height={600}
          />

          {/* Responsive CTA Box */}
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
        
        {/* Product Feed wrapper to ensure padding on mobile */}
        <div className="mt-2">
          <ProductFeed
            productList={products || []}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
          />
          {isLoading && (
            <p className="mt-4 text-center text-sm text-gray-400">Loading products...</p>
          )}
          {loadError && (
            <p className="mt-4 text-center text-sm text-red-500">{loadError}</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
