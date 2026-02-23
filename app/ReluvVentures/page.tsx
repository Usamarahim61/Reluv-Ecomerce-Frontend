import React from 'react';
import Image from 'next/image';

const offers = [
  {
    title: 'Funding growth',
    description: 'Focus on your long-term growth with our financial support. Our goal is to empower you on your mission with funding ranging from €0.5M–€10M.',
    icon: '/icons/funding-growth.svg', // Replace with your illustration path
  },
  {
    title: 'Expert advisory',
    description: 'Get access to insights from experienced executives at Vinted. They can offer personalised guidance and practical expertise to help you navigate challenges and opportunities.',
    icon: '/icons/expert-advisory.svg', // Replace with your illustration path
  },
];

const ReluvVentures = () => {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* What We Offer Heading */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-gray-900 mb-12">
          What we offer
        </h2>

        {/* Offer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {offers.map((offer, index) => (
            <div 
              key={index} 
              className="bg-[#F9F9F9] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm border border-gray-100/50"
            >
              <div className="relative w-32 h-32 mb-6">
                <Image
                  src={offer.icon}
                  alt={offer.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{offer.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                {offer.description}
              </p>
            </div>
          ))}
        </div>

        {/* Who We Invest In Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
            Who we invest in
          </h2>
          <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
            <p>
              We support technology companies who tackle challenges in recommerce. 
              Whether you&apos;re building a marketplace, developing cutting-edge solutions 
              in logistics and payments, or changing the way people consume – we want to hear from you.
            </p>
            <p className="font-medium">
              Bold visions need strong foundations: we back Series A, B, and C 
              companies around the world that demonstrate strong potential for growth and results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReluvVentures;