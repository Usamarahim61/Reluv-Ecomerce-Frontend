"use client";

import React from "react";
import { 
  Sparkles, Heart, Tag, 
  Banknote, PiggyBank, RefreshCw, 
  Globe, Cloud, Shirt 
} from "lucide-react";
import Footer from "../components/Footer";

/**
 * Rluv Sustainability Page
 * Combined Sections 1-4
 */
export default function SustainabilityPage() {
  return (
    <><Navbar />
    <div className="bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* SECTION 1: HERO & IMPACT REPORT */}
      <section className="bg-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Together, we’re making the change to second-hand
          </h1>
          <p className="text-slate-600 leading-relaxed text-[17px] md:text-[19px]">
            Second-hand is better than new for the climate, for your wardrobe, and for 
            your wallet. That’s why we want to make it first choice for everyone.
          </p>
        </div>
      </section>

      <section className="relative px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2000"
            alt="Two people wearing vibrant second-hand fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <h2 className="text-white text-5xl md:text-8xl font-bold tracking-tight text-center">
                Choosing better
              </h2>
              {/* Neon Oval Graphic */}
              <svg 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[160%] pointer-events-none"
                viewBox="0 0 400 200"
                fill="none"
              >
                <ellipse 
                  cx="200" cy="100" rx="180" ry="70" 
                  stroke="#DFFF00" 
                  strokeWidth="3" 
                  className="opacity-90"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#007782] mt-[-120px] pt-[160px] pb-20 px-4 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-[17px] md:text-[18px] leading-relaxed mb-10 opacity-95">
            Pre-loved is a big part of our members’ wardrobes and shopping habits. To 
            understand the full impact of second-hand on our community, we’ve 
            combined an independent study of our carbon emissions and survey results 
            from over 100,000 members.* We found that when you choose Rluv 
            instead of new, you join an international community changing things for the 
            better.
          </p>
          <button className="bg-white text-[#007782] px-10 py-3.5 rounded-md font-bold text-sm transition-all hover:bg-slate-50 active:scale-95 shadow-lg">
            Read our Impact Report
          </button>
        </div>
      </section>


      {/* SECTION 2: WARDROBE HABITS */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative inline-block">
              Second-hand is better for your wardrobe
              <span className="absolute -bottom-2 left-0 w-3/4 h-1.5 bg-[#DFFF00] opacity-80" />
            </h2>
            <p className="text-slate-600 leading-relaxed text-[17px]">
              We found that you've made circular shopping a regular habit because 
              you find quality items, unique styles, and great value. 65% say at 
              least ¼ of their wardrobe is second-hand. We'll keep working to 
              make pre-loved easy and affordable for everyone.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="rounded-3xl overflow-hidden aspect-[4/3] relative shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800"
                alt="Texture of second-hand clothing"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1/2 -right-4 text-[#DFFF00] animate-pulse">
                <Sparkles size={60} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-10">Key findings: Our members’ shopping habits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 bg-[#f8f5f0]">
          <FindingCard 
            icon={<Sparkles size={48} className="text-[#DFFF00]" />}
            stat="84% say the quality of second-hand is as good as new"
            desc="Or even better. New doesn't mean higher quality."
          />
          <FindingCard 
            icon={<Heart size={48} className="text-[#DFFF00]" />}
            stat="65% prefer to buy fewer, expensive items that last"
            desc="Rather than more, cheaper items that might not."
          />
          <FindingCard 
            icon={<Tag size={48} className="text-[#DFFF00]" />}
            stat="22% buy better quality new fashion"
            desc="Because it can be resold on Rluv. Many are taking better care of their pieces too."
          />
        </div>
      </section>


      {/* SECTION 3: WALLET & SAVINGS */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-20">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative inline-block">
              Second-hand is better for your wallet
              <span className="absolute -bottom-2 left-0 w-3/4 h-1.5 bg-[#DFFF00] opacity-80" />
            </h2>
            <p className="text-slate-600 leading-relaxed text-[17px]">
              48% chose to buy an item second-hand because the price was lower than new. 
              It’s not just about cost savings, though. Many of you are changing the way 
              you think about consumption and opting for a circular economy.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=800"
                alt="Browsing Rluv app"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-10">Key findings: saving and spending on Rluv</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 bg-[#f8f5f0]">
          <FindingCard 
            icon={<RefreshCw size={48} className="text-[#DFFF00]" />}
            stat="36% spend their earnings on second-hand"
            desc="Sellers become buyers, who then choose to invest in a circular economy."
          />
          <FindingCard 
            icon={<PiggyBank size={48} className="text-[#DFFF00]" />}
            stat="18% use the money for savings, 10% for other expenses"
            desc="Selling on Rluv puts extra cash in your pocket for the things you want."
          />
          <FindingCard 
            icon={<Banknote size={48} className="text-[#DFFF00]" />}
            stat="53% spend less since using Rluv"
            desc="Most buy the same amount or fewer items than before. Less spending, more conscious consumption."
          />
        </div>
      </section>


      {/* SECTION 4: CLIMATE IMPACT & PLAN */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative inline-block">
              Second-hand is better for the climate
              <span className="absolute -bottom-2 left-0 w-3/4 h-1.5 bg-[#DFFF00] opacity-80" />
            </h2>
            <p className="text-slate-600 leading-relaxed text-[17px]">
              To understand the carbon emissions avoided by shopping on Rluv instead of new, 
              we partnered with carbon tracking platform Vaayu. They calculated that you, 
              as a community, have the most impact when you replace new purchases with 
              second-hand ones.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                alt="Friends laughing"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-10">Key findings: The climate impact of second-hand</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 bg-[#f8f5f0] mb-12">
          <FindingCard 
            icon={<Globe size={48} className="text-[#DFFF00]" />}
            stat="678,691 tonnes of CO2e emissions avoided"
            desc="By shopping second-hand instead of new in 2023. Equivalent to flying London-LA 512,414 times."
          />
          <FindingCard 
            icon={<Cloud size={48} className="text-[#DFFF00]" />}
            stat="1.25kg of CO2e emissions avoided"
            desc="On average with every item you buy. Even more for popular items like jeans."
          />
          <FindingCard 
            icon={<Shirt size={48} className="text-[#DFFF00]" />}
            stat="40% of Rluv purchases replaced new ones"
            desc="This is the main way we impact emissions together by avoiding brand new production."
          />
        </div>

        <div className="flex justify-center mb-12">
          <button className="bg-[#007782] text-white px-8 py-3 rounded-md font-bold text-sm hover:opacity-90">
            Read our Impact Report
          </button>
        </div>
      </section>

      {/* PLAN FOOTER */}
      <section className="bg-[#004751] text-white py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 relative inline-block">
            Our plan to reduce emissions
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-1.5 bg-[#DFFF00] opacity-80" />
          </h2>
          <p className="text-[17px] md:text-[19px] leading-relaxed mb-10 opacity-90">
            Rluv needs to minimise the impact of its operations on climate change, too. 
            We’ve developed an action plan to reduce emissions in line with climate science. 
            Emissions from deliveries make up 98% of our total carbon footprint, so we’re 
            focussing on our logistics operations.
          </p>
          <button className="bg-white text-[#004751] px-10 py-4 rounded-md font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-xl">
            Read our Climate Action Plan
          </button>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}

/**
 * Sub-component for Statistics Cards
 */
function FindingCard({ icon, stat, desc }: { icon: React.ReactNode; stat: string; desc: string }) {
  return (
    <div className="p-12 flex flex-col items-start border-r border-white last:border-r-0 border-b md:border-b-0">
      <div className="mb-8">{icon}</div>
      <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-tight">
        {stat}
      </h4>
      <p className="text-slate-500 text-sm md:text-base leading-relaxed">
        {desc}
      </p>
    </div>
  );
}