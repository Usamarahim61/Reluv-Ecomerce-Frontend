import Image from "next/image";
import Navbar from "./components/navbar";
import ProductFeed from "./Shop/page";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="">
      {/* <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start"> */}
<Navbar/>
<Hero />
      {/* </main> */}
    </div>
  );
}
// components/Hero.tsx
function Hero() {
  return (
    <>
    <section className="relative h-150 w-full bg-gray-200">
      {/* Background Image */}
      <Image 
        src="https://static.vinted.com/assets/seller-promotion/default/banner-wide-1ca50d3217a3d2402dda712a8e79af381c4bd7cd5cceb0a0b7be17ac2c7522d8.jpg" 
        alt="Decluttering" 
        className="w-full h-full object-cover"
        width={1920}
        height={600}
      />

      {/* Floating CTA Card */}
      <div className="absolute top-1/2 left-70 -translate-y-1/2 bg-white p-10 rounded-lg shadow-xl max-w-sm">
        <h2 className="text-3xl font-medium mb-6">Ready to declutter your wardrobe?</h2>
        <button className="w-full bg-[#007782] text-white py-3 rounded-md font-semibold mb-4">
          Sell now
        </button>
        <a href="#" className="text-[#007782] underline block text-center text-sm">
          Learn how it works
        </a>
      </div>
    </section>
    <ProductFeed />
    <Footer/>
    </>
  );
}