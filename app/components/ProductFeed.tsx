'use client';
import ProductCard from '@/app/components/ProductCard';
import { ChevronDown } from 'lucide-react';
import type { ProductCardItem } from '@/services/products-service';

export default function ProductFeed({
  productList,
  onLoadMore,
  isLoadingMore,
  hasMore,
  className = '',
  gridClassName = '',
}: {
  productList: ProductCardItem[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  className?: string;
  gridClassName?: string;
}) {
  return (
    <section className={className || 'max-w-7xl mx-auto px-4 py-6'}>
      <div className={gridClassName || 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10'}>
        {(productList || []).map((item, index) => (
          <ProductCard key={index} {...item} />
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
