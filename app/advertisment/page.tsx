"use client";
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Footer from '../components/Footer';

const ReluvAdForm = () => {
  const [openSections, setOpenSections] = useState({ 1: true, 2: true, 3: true });
  const [charCount, setCharCount] = useState(300);

  const toggleSection = (id:any) => {
    setOpenSections((prev:any) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
    <div className="min-h-screen bg-[#F2F2F2] font-sans">
      {/* Hero Header */}
      <header className="bg-[#007782] text-white pt-24 pb-24 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[56%] lg:w-[60%] pointer-events-none">
          <Image
            src="https://static-assets.vinted.com/images/landing/advertising/hero-web.png"
            alt="Advertising header illustration"
            fill
            className="object-contain object-right"
            priority
          />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="md:w-1/2">
            <h1 className="text-4xl font-bold mb-6">Advertise with Reluv</h1>
            <p className="text-lg opacity-90 mb-4 leading-relaxed">
              Reluv is the largest online C2C marketplace in Europe dedicated to second-hand fashion, 
              with over 80 million members — and we're growing.
            </p>
            <p className="text-lg opacity-90">
              Want to work with us? Tell us more in the form below.
            </p>
          </div>
        </div>
        {/* Wave Divider Effect */}
        <div className="absolute bottom-0 w-full h-12 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 85% 60%, 70% 0, 55% 60%, 40% 0, 25% 60%, 10% 0, 0 60%)' }}></div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl mx-auto px-4 -mt-12 pb-20 relative z-20">
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-[#111] mb-2">Submit a request</h2>
          <p className="text-sm text-gray-500 mb-10">Complete each section in English.</p>

          <form className="space-y-0">
            {/* Section 1: Contact Info */}
            <FormSection 
              num="1" 
              title="Contact information" 
              isOpen={openSections[1]} 
              onToggle={() => toggleSection(1)}
              isLast={false}
            >
              <InputRow label="First name" placeholder="Enter your first name(s)" />
              <InputRow label="Last name" placeholder="Enter your last name(s)" />
              <InputRow label="Email address" placeholder="Enter your email" type="email" />
              <InputRow label="Phone number (optional)" placeholder="Enter your phone number" />
            </FormSection>

            {/* Section 2: Company Info */}
            <FormSection 
              num="2" 
              title="Company information" 
              isOpen={openSections[2]} 
              onToggle={() => toggleSection(2)}
              isLast={false}
            >
              <SelectRow label="Company type" options={['Agency', 'Brand', 'Other']} />
              <InputRow label="Company name" placeholder="Enter company name" />
            </FormSection>

            {/* Section 3: Additional Info */}
            <FormSection 
              num="3" 
              title="Additional information" 
              isOpen={openSections[3]} 
              onToggle={() => toggleSection(3)}
              isLast
            >
              <SelectRow label="Estimated budget (€)" options={['< 5,000', '5,000 - 20,000', '20,000+']} />
              <SelectRow label="Where are you located?" options={['United Kingdom', 'France', 'Germany', 'Spain']} />
              <SelectRow label="Type of request" options={['Display Advertising', 'Influencer Campaign']} />
              <div className="py-6">
                <div className="flex flex-col md:flex-row md:items-start">
                  <label className="md:w-1/3 text-[15px] font-medium text-gray-700 pt-2 pr-4">
                    Share any other relevant information. <span className="text-gray-400 font-normal">Please write in English.</span>
                  </label>
                  <div className="md:w-2/3">
                    <textarea 
                      onChange={(e) => setCharCount(300 - e.target.value.length)}
                      maxLength={300}
                      className="w-full border-b border-gray-200 focus:border-[#007782] outline-none py-2 resize-none h-32 text-gray-800 transition-colors"
                    />
                    <div className="text-xs text-gray-400 mt-2">{charCount} characters left</div>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Footer and Submit */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[13px] text-gray-500">
                For more information on how we process your personal data, read our <a href="#" className="underline text-[#007782]">Privacy Policy</a>.
              </p>
              <button 
                type="submit"
                className="bg-[#007782] text-white px-8 py-2.5 rounded-md font-medium hover:bg-[#005f69] transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
    <Footer/>
    </>
  );
};

// --- Helper Components for Clean Code ---

const FormSection = ({ num, title, children, isOpen, onToggle, isLast }:{num:any,title:any, children:any, isOpen:any, onToggle:any, isLast:any}) => (
  <div className={`border-t border-gray-100 ${isLast ? 'border-b' : ''}`}>
    <button 
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-6 group"
    >
      <div className="flex items-center gap-4">
        <span className="w-6 h-6 bg-[#007782] text-white rounded-full flex items-center justify-center text-xs font-bold">
          {num}
        </span>
        <h3 className="text-[17px] font-semibold text-gray-800">{title}</h3>
      </div>
      {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
    </button>
    <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
);

const InputRow = ({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) => (
  <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-50 last:border-0">
    <label className="md:w-1/3 text-[15px] font-medium text-gray-700 mb-1 md:mb-0">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder}
      className="md:w-2/3 border-b border-gray-200 focus:border-[#007782] outline-none py-2 text-gray-800 placeholder-gray-300 transition-colors"
    />
  </div>
);

const SelectRow = ({ label, options }: { label: string; options: string[] }) => (
  <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-50 last:border-0">
    <label className="md:w-1/3 text-[15px] font-medium text-gray-700 mb-1 md:mb-0">{label}</label>
    <select className="md:w-2/3 border-b border-gray-200 focus:border-[#007782] outline-none py-2 bg-transparent text-gray-800 appearance-none cursor-pointer">
      <option value="">Please select</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ReluvAdForm;
