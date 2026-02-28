'use client'; // Required for the close button functionality
import ProductCard from '@/app/components/ProductCard';
import { ChevronDown } from 'lucide-react';

export default function ProductFeed({
  isProductDetail,
  productList,
  onLoadMore,
  isLoadingMore,
  hasMore,
}: {
  isProductDetail?: boolean;
  productList: Array<any>;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}) {


  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      
      <div className={`grid grid-cols-2 md:grid-cols-3 ${isProductDetail ? "lg:grid-cols-3":"lg:grid-cols-5"} gap-x-4 gap-y-10`}>
        {(productList || [])?.map((item, index) => (
          <ProductCard key={index} {...item} />
        ))}
      </div>

      {onLoadMore && hasMore !== false && (
        <div className="flex items-center justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex justify-center items-center cursor-pointer gap-1 text-white bg-[#007782] border border-gray-300 rounded-sm px-3 py-2 mt-4 disabled:opacity-60"
          >
            {isLoadingMore ? "Loading..." : "See More"}
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
