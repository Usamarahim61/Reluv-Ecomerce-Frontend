import Image from 'next/image';
import Footer from '../components/Footer';
import "../global.css"

export default function ItemVerificationPage() {
  return (
    <>
    <div className="min-h-screen bg-white font-sans text-[#111111]">
      
      {/* 1. HERO SECTION */}
      <section className=" pt-16 pb-0 relative overflow-hidden">
        <div className="max-w-[850px] mx-auto px-6 text-center mb-12">
          <h1 className="text-[36px] md:text-[48px] font-bold mb-6 leading-tight text-[#111111]">
            Item Verification: <br /> 
            <span className="reluv-underline">Shop with confidence</span>
          </h1>
          <p className="text-[20px] text-[#444444] max-w-[1200px] mx-auto mb-8 leading-relaxed">
            Our Item Verification service lets you have selected second-hand designer pieces checked for authenticity by our team of experts. They’ll personally verify your item to make sure you’re spending your money on the real thing.
          </p>
          <button className="bg-[#097d81] text-white px-8 py-3 rounded-[4px] font-medium hover:bg-[#086a6e] transition">
            Find out more
          </button>
        </div>

        {/* Hero Image - Placed in a centered container */}
        <div className=" mx-auto">
          <div className="relative aspect-[16/8] w-full rounded-t-xl overflow-hidden shadow-lg border-x border-t border-gray-100">
            <Image 
              src="https://static-assets.vinted.com/images/landing/item-verification/hero-image-tablets-up.png" 
              alt="Item Verification Experts" 
              fill 
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. OUR EXPERTS SECTION */}
      <section className="py-24 max-w-[1200px] mx-auto px-6">
        <div className="md:w-[65%]">
          <h2 className="text-[50px] font-bold mb-6">Our experts</h2>
          <p className="text-[#444444] text-[22px] leading-relaxed">
            Need a second opinion? Our team of fashion experts has checked hundreds of thousands of items. 
            They have years of experience and deep knowledge of luxury brands, so they know exactly what 
            details to look for when they’re checking your item.
          </p>
        </div>
      </section>

      {/* 3. BENEFIT CARDS (The Beige Cards) */}
      <section className="pb-24 max-w-[1200px] mx-auto px-6">
        <h2 className="text-[45px] font-bold mb-10">Why shop with Item Verification?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BenefitCard 
            title="Enjoy peace of mind"
            desc="Shop with confidence knowing your designer items are physically checked by our experts."
            icon="https://static-assets.vinted.com/images/landing/item-verification/illustration-1.png"
          />
          <BenefitCard 
            title="Choose affordable luxury"
            desc="Find unique designer pieces at second-hand prices, all verified for authenticity."
            icon="https://static-assets.vinted.com/images/landing/item-verification/illustration-2.png"
          />
          <BenefitCard 
            title="Get the brands you love"
            desc="Shop a growing list of hundreds of designer brands, from Balenciaga to Prada."
            icon="https://static-assets.vinted.com/images/landing/item-verification/illustration-3.png"
          />
        </div>
      </section>

      {/* 4. HOW DOES IT WORK? (The Grid) */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <h2 className="text-[45px] font-bold mb-12">How does it work?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-16">
            <StepItem 
              num={1}
              title="Choose your designer item"
              desc="Look for the 'Item Verification' badge on the listing. When you buy, select the service for just 10 €."
              img="https://static-assets.vinted.com/images/landing/item-verification/step-1-tablets-up@2x.png"
            />
            <StepItem 
              num={2}
              title="Ship to our verification hub"
              desc="The seller sends the item to our experts first. We'll let you know once it arrives."
              img="https://static-assets.vinted.com/images/landing/item-verification/step-2-tablets-up@2x.png"
            />
            <StepItem 
              num={3}
              title="Our experts check it"
              desc="Our experts check the item's authenticity. If it passes, we'll send it straight to you."
              img="https://static-assets.vinted.com/images/landing/item-verification/step-3-tablets-up@2x.png"
            />
            <StepItem 
              num={4}
              title="Enjoy your purchase"
              desc="The item is yours! Your money stays safe with us until the item arrives and you're happy."
              img="https://static-assets.vinted.com/images/landing/item-verification/step-4-tablets-up@2x.png"
            />
          </div>
        </div>
      </section>

      {/* 5. FOOTER CTA */}
      <section className="bg-[#004e51] py-24 text-center text-white relative overflow-hidden">
        {/* Torn top edge */}
        <div className="tear-divider top-[-1px] rotate-180 bg-[#004e51] z-20" />
        
        {/* Background illustration */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://marketplace-web-assets.vinted.com/assets/how-it-works/get-started-background.svg"
            alt="Illustration background"
            fill
            className="object-cover opacity-30"
          />
        </div>

        <div className="relative z-10 max-w-[700px] mx-auto px-6">
          <h2 className="text-[36px] md:text-[44px] font-medium mb-6">
            Shop your favourite designers pre-loved
          </h2>
          <p className="mb-10 text-white/90 text-[17px]">
            Experience the fashion hub from the home out of buying and selling designer pieces. 
            Authentication is now at your fingertips.
          </p>
          <button className="bg-white text-[#004e51] px-10 py-3 rounded-[4px] font-medium hover:bg-gray-100 transition">
            Shop designer items
          </button>
        </div>
      </section>
    </div>
    <Footer/>
    </>
  );
}

// --- SUB-COMPONENTS ---

function BenefitCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="bg-[#f1eae1] p-10 rounded-2xl flex flex-col items-center text-center">
      <div className="h-50 w-50 relative">
        <Image src={icon} alt={title} fill className="object-contain"  style={{ top: "-60px" }} />
      </div>
      <h3 className="text-[20px] font-bold mb-4">{title}</h3>
      <p className="text-[15px] text-[#444444] leading-relaxed mb-6">{desc}</p>
      <button className="text-[15px] font-bold underline decoration-[#097d81] underline-offset-8 decoration-2">
        Find out more
      </button>
    </div>
  );
}

function StepItem({ num, title, desc, img }: { num: number; title: string; desc: string; img: string }) {
  return (
    <div className="space-y-6 p-9">
      {/* Container with a fixed height instead of aspect-ratio */}
      <div className="relative w-full h-[250px] md:h-[420px] rounded-2xl overflow-hidden shadow-md">
        <Image 
          src={img} 
          alt={title} 
          fill 
          className="object-cover" 
        />
      </div>
      
      <div className="flex gap-5">
        {/* Number Circle */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center text-[18px] font-bold text-[#111111]">
          {num}
        </div>
        
        {/* Text Content */}
        <div>
          <h3 className="font-bold text-[24px] mb-2">{title}</h3>
          <p className="text-[18px] text-[#666666] leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}