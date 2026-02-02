'use client'; 
import Image from "next/image";
import Navbar from "./components/navbar";
import ProductFeed from "./Shop/page";
import Footer from "./components/Footer";
import { items } from "./dataCenter";
import { useState } from "react";

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);
  const [openInBox, setOpenInBox] =useState(false);
  return (
    <div className="">
      {!openInBox && <Navbar />}
      {!openInBox && <section className="relative h-150 w-full bg-gray-200">
        {/* Background Image */}
        <Image
          src="https://static.vinted.com/assets/seller-promotion/default/banner-wide-1ca50d3217a3d2402dda712a8e79af381c4bd7cd5cceb0a0b7be17ac2c7522d8.jpg"
          alt="Decluttering"
          className="w-full h-full object-cover"
          width={1920}
          height={600}
        />

        <div className="absolute top-1/2 left-70 -translate-y-1/2 bg-white p-10 rounded-lg shadow-xl max-w-sm">
          <h2 className="text-3xl font-medium mb-6">
            Ready to declutter your wardrobe?
          </h2>
          <button className="w-full bg-[#007782] text-white py-3 rounded-md font-semibold mb-4">
            Sell now
          </button>
          <a
            href="#"
            className="text-[#007782] underline block text-center text-sm"
          >
            Learn how it works
          </a>
        </div>
      </section>}
    <section className="max-w-7xl mx-auto px-4 py-6">
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
      </section>
      <ProductFeed productList={[...items]} />
      <Footer />
    </div>
  );
}
