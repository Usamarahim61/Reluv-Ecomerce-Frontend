import { Heart, Info, ShieldCheck, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function ProductDetail({ params }: { params: { id: string } }) {
  console.log(`Request received: GET /products/${params.id}`);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f2f2f2] min-h-screen">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#007782] mb-4">
        <span>Home</span> <ChevronRight size={12} />
        <span>Women</span> <ChevronRight size={12} />
        <span>Clothing</span> <ChevronRight size={12} />
        <span className="text-gray-400">T-shirts</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        
        {/* Left Side: Image Gallery */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative aspect-[3/4] col-span-2 lg:col-span-1">
              <Image src="/shirt-main.jpg" alt="product" className="object-cover w-full h-full" width={400} height={533} />
            </div>
            <div className="grid grid-rows-2 gap-2">
               <Image src="/shirt-front.jpg" alt="front" className="object-cover w-full h-full aspect-[3/4]" width={200} height={267} />
               <div className="relative">
                  <Image src="/shirt-back.jpg" alt="back" className="object-cover w-full h-full aspect-[3/4] opacity-50" width={200} height={267} />
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">+ 2</span>
                  <button className="absolute bottom-4 right-4 bg-black/50 p-2 rounded text-white"><Heart size={20}/></button>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Product Info Sidebar */}
        <div className="space-y-4">
          {/* Main Info Card */}
          <div className="bg-white p-6 shadow-sm rounded-sm">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-lg font-medium">Camiseta larga roja imagen chica Talla S</h1>
                  <p className="text-sm text-gray-500">S / 36 / 8 · Very good · <span className="underline cursor-pointer">Local</span></p>
               </div>
            </div>
            
            <div className="mt-4">
               <p className="text-gray-400 line-through text-sm">€8.95</p>
               <p className="text-2xl font-bold text-[#007782]">€10.10</p>
               <p className="text-[#007782] text-xs flex items-center gap-1">Includes Buyer Protection <Info size={12}/></p>
            </div>

            <div className="mt-6 space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between"><span className="text-gray-400">Brand</span><span className="text-[#007782] underline">Local</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Size</span><span>S / 36 / 8</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Condition</span><span>Very good</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Uploaded</span><span>17 min ago</span></div>
            </div>

            <div className="mt-8 space-y-3">
              <button className="w-full bg-[#007782] text-white py-2.5 rounded-md font-medium">Buy now</button>
              <button className="w-full border border-[#007782] text-[#007782] py-2.5 rounded-md font-medium">Make an offer</button>
              <button className="w-full border border-[#007782] text-[#007782] py-2.5 rounded-md font-medium">Ask seller</button>
            </div>
          </div>

          {/* Buyer Protection Fee Info */}
          <div className="bg-white p-4 shadow-sm border-l-4 border-[#007782] flex gap-3">
            <ShieldCheck className="text-[#007782] shrink-0" size={24} />
            <div>
              <p className="text-sm font-bold">Buyer Protection fee</p>
              <p className="text-xs text-gray-600">Our Buyer Protection is added for a fee to every purchase... <span className="text-[#007782] underline">Refund Policy</span>.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
