'use client'; // Required for the close button functionality

import { useState } from 'react';
import ProductCard from '@/app/components/ProductCard';
import { Search, Camera, ChevronDown } from 'lucide-react';

export default function ProductFeed() {
  const [showBanner, setShowBanner] = useState(true);

  const items = [
    { id: '1', brand: 'H&M', size: 'S / 36 / 8', condition: 'Very good', price: '€10.00', totalPrice: '€11.20', imageUrl: '/hm-dress.jpg', likes: 25 },
    { id: '2', brand: 'Pandora', size: 'One size', condition: 'Very good', price: '€14.00', totalPrice: '€15.40', imageUrl: '/charm.jpg', likes: 60 },
    { id: '3', brand: 'adidas', size: 'XL', condition: 'Very good', price: '€22.55', totalPrice: '€24.38', imageUrl: '/jacket.jpg', likes: 47 },
    { id: '4', brand: 'Sassyclassy', size: 'XXXL / 46', condition: 'Very good', price: '€16.00', totalPrice: '€17.50', imageUrl: '/pink-top.jpg', likes: 33 },
    { id: '5', brand: 'EGO', size: 'M / 38', condition: 'New with tags', price: '€12.00', totalPrice: '€13.30', imageUrl: '/ego-dress.jpg', likes: 20 },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      
      {/* 1. Corrected Shipping Banner (Not an input) */}
      {showBanner && (
        <div className="flex justify-between items-center border border-gray-100 rounded-sm p-4 mb-8 bg-white shadow-sm">
          <p className="text-[15px] text-gray-600">
            Shipping fees will be added at checkout
          </p>
          <button 
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-black text-2xl font-light leading-none px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Search Input (Integrated like the Vinted Header) */}


      {/* 3. Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10">
        {items.map((item, index) => (
          <ProductCard key={index} {...item} />
        ))}
      </div>

      <div className='flex items-center justify-center'>
        <button  className="flex justify-center items-center cursor-pointer gap-1 text-white bg-[#007782] border border-gray-300 rounded-sm px-3 py-2 mt-4 ">
          See More
          <ChevronDown size={16} />
        </button>
      </div>
    </section>
  );
}