'use client';
import ProductCard from '@/app/components/ProductCard';
import { ChevronDown } from 'lucide-react';
import type { ProductCardItem } from '@/services/products-service';

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

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !isLoading) {
    return (
      <section className={wrapper}>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 py-14 text-center">
          <span className="mb-3 text-5xl">😕</span>
          <h2 className="mb-1 text-[18px] font-semibold text-red-700">Something went wrong</h2>
          <p className="mb-5 max-w-sm text-[14px] text-red-500">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-full bg-[#007782] px-6 py-2 text-[14px] font-medium text-white transition hover:bg-[#005f6a]"
            >
              Try again
            </button>
          )}
        </div>
      </section>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section className={wrapper}>
        <div className={grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 aspect-[3/4] w-full rounded-xl bg-gray-200" />
              <div className="mb-1.5 h-3 w-3/4 rounded bg-gray-200" />
              <div className="mb-1 h-3 w-1/2 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!productList || productList.length === 0) {
    return (
      <section className={wrapper}>
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <span className="mb-4 text-6xl">🛍️</span>
          <h2 className="mb-2 text-[20px] font-semibold text-[#1d1d1d]">No items found</h2>
          <p className="max-w-sm text-[14px] text-[#6f6f6f]">
            We couldn&apos;t find anything matching your filters. Try adjusting or clearing them to see more results.
          </p>
        </div>
      </section>
    );
  }

  // ── Products ───────────────────────────────────────────────────────────────
  return (
    <section className={wrapper}>
      <div className={grid}>
        {productList.map((item, index) => (
          <ProductCard key={index} {...item} variant={cardVariant} />
        ))}
      </div>

      {onLoadMore && hasMore !== false && (
        <div className="flex items-center justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="mt-4 flex cursor-pointer items-center justify-center gap-1 rounded-sm border border-gray-300 bg-[#007782] px-3 py-2 text-white disabled:opacity-60"
          >
            {isLoadingMore ? 'Loading...' : 'See More'}
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </section>
  );
}