import { ShieldCheck, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import "../global.css"

export default function ReluvHowItWorks() {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-white font-sans text-[#111111]">
      
      {/* 1. HERO SECTION - Fixed alignment and background */}
{/* 1. HERO SECTION - Image as Background Illustration */}
      <section className="bg-[rgb(201,240,238)]  py-14 relative overflow-hidden">
        {/* Background Image Container */}
        <div className=" right-0 top-0 h-full w-full md:w-[60%] z-0 opacity-80 md:opacity-100">
          <Image
            src="/how-is-it-works-header.png"
            alt="Reluv Background"
            fill
            className="object-contain object-right"
            priority
          />
        </div>

        {/* Content Container */}
        <div className="max-w-[1250px] mx-auto px-6 relative z-10 pt-16 pb-24">
          <div className="md:w-[50%] text-left">
<h1 className="text-[50px] md:text-[48px] font-medium mb-6 leading-[1.3] tracking-normal text-[#111111]">
  Vinted is your platform for <br/>
  <span className="reluv-underline">
    pre-owned pieces
  </span> you’ll love
</h1>
            <p className="text-[18px] text-[#575656] max-w-[420px] mb-4 leading-relaxed font-semibold">
              One community, thousands of brands, and a whole lot of second-hand style. Ready to get started? Here’s how it works.
            </p>
          </div>
        </div>
<div className="tear-divider" />
        {/* Subtle Wave Effect Bottom */}
        {/* <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-[40px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 120 0 0C140.43 51.56 312 88.54 600 88.54 888 88.54 1059.57 51.56 1200 0z" fill="#ffffff"></path>
          </svg>
        </div> */}
      </section>

      {/* 2. SELLING SECTION - Tighter container for accuracy */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-[22px] font-bold mb-10 text-[#111111]">Selling is simple</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Step 
            number="1" 
            title="List for free" 
            desc="Download the Reluv app for free. Take photos of your item, describe it, and set your price. Tap 'Upload' and your listing is live."
            img="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
          />
          <Step 
            number="2" 
            title="Sell it, ship it" 
            desc="Sold! Box your item, print your prepaid shipping label, and pop to the drop-off point within 5 days."
            img="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600"
          />
          <Step 
            number="3" 
            title="It's payday!" 
            desc="There are zero selling fees, so what you earn is yours to keep. You’ll be paid as soon as the buyer confirms everything’s OK."
            img="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
          />
        </div>
        <div className="flex justify-center mt-12">
          <button className="border border-[#097d81] text-[#097d81] text-sm font-medium px-5 py-2 rounded-[4px] hover:bg-[#f2f9f9] transition">
            Start selling
          </button>
        </div>
      </section>

      <div className="container mx-auto px-6">
        <hr className="border-slate-100" />
      </div>

      {/* 3. SHOPPING SECTION */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-[22px] font-bold mb-10 text-[#111111]">Shop safely and securely</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Step 
            number="1" 
            title="Find it" 
            desc="Download the Reluv app for free. Browse millions of unique items, search thousands of brands, and find your favourites."
            img="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"
          />
          <Step 
            number="2" 
            title="Buy it" 
            desc="Ask the seller any questions, then buy with the tap of a button. Pay securely via PayPal, bank card, Apple Pay or your Reluv Balance."
            img="https://images.unsplash.com/photo-1601924990367-3660d456592a?w=600"
          />
          <Step 
            number="3" 
            title="Get it" 
            desc="You’ll see your item’s estimated delivery date at checkout, and we’ll let you know when it’s in the post. In a few days, it’ll be with you."
            img="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600"
          />
        </div>
        <div className="flex justify-center mt-12">
          <button className="border border-[#097d81] text-[#097d81] text-sm font-medium px-5 py-2 rounded-[4px] hover:bg-[#f2f9f9] transition">
            Start shopping
          </button>
        </div>
      </section>

      {/* 4. SAFETY SECTION - Simplified and spaced */}
      <section className="py-16 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <h2 className="text-[24px] font-bold mb-10">You're safe with us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-[#097d81] shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-[20px] mb-2">Shop with peace of mind</h4>
                <p className="text-[18px] text-[#666666] leading-relaxed">
                  As a buyer, you pay a Buyer Protection fee on each transaction when using the "Buy now" button. This helps safeguard your money. The cost is 5% of the item price plus 0,70 €.
                </p>
                <a href="#" className="text-[#08787c] text-sm mt-3 inline-block hover:underline">Learn more</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <RotateCcw className="w-8 h-8 text-[#097d81] shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-[20px] mb-2">Reliable refund policy</h4>
                <p className="text-[18px] text-[#666666] leading-relaxed">
                  Your order is protected when you pay through Reluv. You'll get a refund if your item doesn't arrive, was damaged in transit, or is significantly not as described.
                </p>
                <a href="#" className="text-[#08787c] text-sm mt-3 inline-block hover:underline">Learn more</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CTA */}
      {/* <section className="bg-[#097d81] py-16 text-center text-white">
        <h2 className="text-[50px] font-medium mb-10">Ready to go?</h2>
        <div className="flex justify-center gap-4">
          <button className="bg-transparent border border-white px-6 py-2 rounded-[4px] hover:bg-white/10 transition text-sm">
            Start shopping
          </button>
          <button className="bg-white text-[#097d81] px-6 py-2 rounded-[4px] hover:bg-slate-100 transition font-medium text-sm">
            Start selling
          </button>
        </div>
      </section> */}
      {/* 5. FOOTER CTA - With Background SVG */}
<section className="bg-[#097d81] py-34 text-center text-white relative overflow-hidden">
  
  {/* The "Tear" effect at the top of the footer */}
  <div className="tear-divider top-[-1px] rotate-180 bg-[#097d81] z-20" />

  {/* Background Image */}
  <div className="absolute inset-0 z-0">
    <Image
      src="https://marketplace-web-assets.vinted.com/assets/how-it-works/get-started-background.svg"
      alt="Get Started Background"
      fill
      className="object-cover opacity-40 md:opacity-100 color-sa" 
      priority
    />
  </div>

  {/* Content Container */}
  <div className="relative z-10 max-w-[1050px] mx-auto px-6">
    <h2 className="text-[36px] md:text-[50px] font-medium mb-10 leading-tight">
      Ready to go?
    </h2>
    <div className="flex flex-col md:flex-row justify-center items-center gap-4">
      <button className="w-full md:w-auto bg-transparent border border-white px-8 py-2.5 rounded-[4px] hover:bg-white/10 transition text-sm font-medium">
        Start shopping
      </button>
      <button className="w-full md:w-auto bg-white text-[#097d81] px-8 py-2.5 rounded-[4px] hover:bg-slate-100 transition font-medium text-sm">
        Start selling
      </button>
    </div>
  </div>
</section>
    </div>
    <Footer/>
    </>

  );
}

function Step({ number, title, desc, img }: { number: string, title: string, desc: string, img: string }) {
  return (
    <div className="flex flex-col">
      {/* Aspect ratio fixed to match screenshot */}
      <div className="mb-5 rounded-[4px] overflow-hidden aspect-[1.6/1] w-full relative">
        <img src={img} alt={title} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-[24px] font-bold mb-2">{number}. {title}</h3>
      <p className="text-[18px] text-[#666666] leading-[1.5] mb-3">
        {desc}
      </p>
      <a href="#" className="text-[#08787c] text-sm font-normal underline hover:no-underline">Learn more</a>
    </div>
  );
}