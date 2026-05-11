'use client';
import ProductCard from '@/app/components/ProductCard';
import { ChevronDown } from 'lucide-react';
import type { ProductCardItem } from '@/services/products-service';
import { ProductGridError, ProductGridSkeleton, ProductGridEmpty } from "../components/Skeletons";
import ProductCardV2 from './ProductCardV2';

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

  // ── Products ───────────────────────────────────────────────────────────────
  return (
    <section className={wrapper}>
      <div className={grid}>
        {productList.map((item, index) => (
          <ProductCardV2 key={index} {...item} variant={cardVariant} />
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