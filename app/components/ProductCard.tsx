// components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Info } from 'lucide-react';

interface ProductProps {
  id: string;
  brand: string;
  size: string;
  condition: string;
  price: string;
  totalPrice: string;
  imageUrl: string;
  likes: number;
}

export default function ProductCard({ id, brand, size, condition, price, totalPrice, imageUrl, likes }: ProductProps) {
  return (
    <Link href={`/products/${id}`}>
      <div className="flex flex-col group cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-3/4 w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={brand}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Like Button Overlay */}
          {/* <button className="absolute bottom-2 right-2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-sm flex items-center gap-1 text-xs">
            <Heart size={14} />
            <span>{likes}</span>
          </button> */}
                            <button className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-xs font-bold border border-gray-200">
                     <Heart size={12} className="text-gray-400" /> {likes}
                  </button>
        </div>

        {/* Product Details */}
        <div className="py-2 space-y-0.5">
          <p className="text-xs text-gray-500 truncate">
            {brand} · {size} · {condition}
          </p>
          <p className="text-sm font-semibold">{price}</p>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>{totalPrice} incl.</span>
            <Info size={10} />
          </div>
        </div>
      </div>
    </Link>
  );
}
