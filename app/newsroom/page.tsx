"use client";

import React from "react";
import RluvGroupNavbar from "../components/Rluv-Group-Navbar";
import RluvGroupFooter from "../components/Rluv-Group-Footer";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

interface NewsItem {
  id: string;
  date: string;
  title: string;
  imageUrl: string;
  category?: string;
}

const NEWS_DATA: NewsItem[] = [
  // Row 1
  {
    id: "1",
    date: "September 16, 2025",
    title: "Rluv partners with Oxfam and Jameela Jamil to put second-hand fashion on the main stage",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
  },
  {
    id: "2",
    date: "April 29, 2025",
    title: "Rluv launches Rluv Ventures to accelerate the next generation of re-commerce start ups",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400",
  },
  {
    id: "3",
    date: "April 29, 2025",
    title: "Rluv delivers strong, profitable growth, while investing in Rluv Go and Rluv Pay",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
  },
  // Row 2
  {
    id: "4",
    date: "April 22, 2025",
    title: "Shop Alexa Chung's wardrobe on Rluv UK",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
  },
  {
    id: "5",
    date: "April 10, 2025",
    title: "Rluv Go launches in Spain and Portugal",
    imageUrl: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?w=400",
  },
  {
    id: "6",
    date: "March 25, 2025",
    title: "Rluv Launches 'House of Rluv' Luxury Fashion Wardrobe Online",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b830c6050?w=400",
  },
  // Row 3
  {
    id: "7",
    date: "February 18, 2025",
    title: "Rluv Launches New Brand Platform 'New Again' with Its First Campaign",
    imageUrl: "https://images.unsplash.com/photo-1529392266961-9cc3830da2fc?w=400",
  },
  {
    id: "8",
    date: "February 3, 2025",
    title: "Rluv Introduces 'Re-invinted', a Data-Powered Campaign that Reveals the Culture",
    imageUrl: "https://images.unsplash.com/photo-1512428559083-a401c33c2b65?w=400",
  },
  {
    id: "9",
    date: "October 24, 2024",
    title: "Rluv Secures TPG-Led Secondary Investment at Valuation of €5B",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
  },
];
const newsroom = () => {
  return (
    <>
    <Navbar />
    <div className="bg-white font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        
        {/* Featured Story (Hero) */}
        <section className="flex flex-col md:flex-row gap-8 mb-16 items-center">
          <div className="flex-1 order-2 md:order-1">
            <p className="text-sm text-slate-500 mb-2">January 22, 2026</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Rluv has landed in New York
            </h1>
            <button className="bg-[#007782] text-white px-6 py-2 rounded font-medium hover:bg-[#005f68] transition-colors">
              Read more
            </button>
          </div>
          <div className="flex-1 order-1 md:order-2 w-full">
            <img 
              src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800" 
              alt="Vinted in NYC" 
              className="rounded-lg w-full h-[300px] md:h-[400px] object-cover shadow-sm"
            />
          </div>
        </section>

        <hr className="border-slate-100 mb-16" />

        {/* Primary News Grid (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {NEWS_DATA.slice(0, 2).map((item) => (
            <article key={item.id} className="group cursor-pointer">
              <div className="aspect-[16/10] overflow-hidden rounded-lg mb-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-[#007782] transition-colors">
                {item.title}
              </h2>
              <p className="text-sm text-slate-500">{item.date}</p>
            </article>
          ))}
        </div>

        {/* Secondary News Grid (3 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {NEWS_DATA.slice(2).map((item) => (
            <article key={item.id} className="group cursor-pointer">
              <div className="aspect-square overflow-hidden rounded-lg mb-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold mb-2 leading-tight group-hover:text-[#007782] transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500">{item.date}</p>
            </article>
          ))}
        </div>

        {/* Show More Button */}
        <div className="flex justify-center mb-24">
          <button className="bg-[#007782] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#005f68] transition-colors shadow-md">
            Show more
          </button>
        </div>

        {/* Press Inquiries Footer */}
        <section className="bg-slate-50 rounded-3xl p-10 md:p-20 text-center border border-slate-100">
          <h2 className="text-3xl font-bold mb-6">Press inquiries</h2>
          <p className="text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
            For more Rluv information, news and announcements, or editorial requests, 
            please contact our press office. We’d love to talk to you!
          </p>
          <button className="bg-[#007782] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#005f68] transition-colors shadow-md">
            Contact us
          </button>
        </section>

      </div>
    </div>
    <Footer />
    </>
  );
};

export default newsroom;