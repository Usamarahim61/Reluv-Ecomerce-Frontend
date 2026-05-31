'use client';
import { ChevronDown } from 'lucide-react';
import type { ProductCardItem } from '@/services/products-service';
import { ProductGridError, ProductGridSkeleton, ProductGridEmpty } from "../components/Skeletons";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserFav_Products } from '@/services/auth-service';
import ProductCard from './ProductCard';

export default function ProductFeed({
  productList,
  onLoadMore,
  isLoadingMore,
  isLoading,
  hasMore,
  className = '',
  gridClassName = '',
  cardVariant = 'default',
  error,
  onRetry,
}: {
  productList: ProductCardItem[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  isLoading?: boolean;
  hasMore?: boolean;
  className?: string;
  gridClassName?: string;
  cardVariant?: 'default' | 'android';
  error?: string | null;
  onRetry?: () => void;
}) {
  const { user } = useAuth();
  const [favIds, setFavIds] = useState<number[]>([]);

  // ── Single fetch for all fav products ─────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const fetchFavs = async () => {
      try {
        const data = await getUserFav_Products(Number(user.id));
        const ids: number[] =
          data?.fav_products?.map((p: any) =>
            typeof p === "object" ? Number(p.id) : Number(p)
          ) ?? [];
        setFavIds(ids);
      } catch (err) {
        console.error("Failed to fetch fav products", err);
      }
    };

    fetchFavs();
  }, [user?.id]);

  // callback so cards can update the shared favIds state after like/unlike
  const handleFavChange = (productId: number, liked: boolean) => {
    setFavIds((prev) =>
      liked
        ? [...new Set([...prev, productId])]
        : prev.filter((id) => id !== productId)
    );
  };

  const wrapper = className || 'max-w-7xl mx-auto px-4 py-6';
  const grid = gridClassName || 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10';

  if (error && !isLoading) {
    return <ProductGridError wrapper={wrapper} error={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return <ProductGridSkeleton wrapper={wrapper} grid={grid} />;
  }

  if (!productList || productList.length === 0) {
    return <ProductGridEmpty wrapper={wrapper} />;
  }

  return (
    <section className={wrapper}>
      <div className={grid}>
        {productList.map((item, index) => (
          <ProductCard
            key={index}
            {...item}
            variant={cardVariant}
            isLiked={favIds.includes(Number(item.id))}   // ✅ passed from parent
            onFavChange={handleFavChange}                  // ✅ sync back to parent
          />
        ))}
      </div>

      {onLoadMore && hasMore !== false && (
        <div className="flex items-center justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="mt-4 flex cursor-pointer items-center justify-center gap-1 rounded-sm border border-gray-300 bg-[#cb6f4d] px-3 py-2 text-white disabled:opacity-60"
          >
            {isLoadingMore ? 'Loading...' : 'See More'}
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </section>
  );
}