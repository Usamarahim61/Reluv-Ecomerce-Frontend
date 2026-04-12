"use client";
import { X, Search, Tag, ShoppingBag, User } from "lucide-react";
import { JSX, useState } from "react";

import Footer from "../components/Footer";

// Define the available tabs
type TabType = "home" | "selling" | "buying" | "account";

export default function HelpComp(): JSX.Element {
  // State to manage the active tab
  const [activeTab, setActiveTab] = useState<TabType>("home");

  // Helper function to render the right-side content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="flex flex-col gap-3 animate-in fade-in duration-300">
            <h3 className="font-semibold mb-3 text-lg">Comment pouvons-nous t'aider ?</h3>
            <p className="text-gray-600 mb-2">Tu as une question générale</p>

            {/* Search Bar */}
            <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 border border-gray-200">
              <Search className="text-[#007782] w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des articles"
                className="bg-transparent outline-none flex-1 px-2 text-sm md:text-base"
              />
            </div>

            <div className="text-gray-600 mt-6 mb-2 font-bold">Thèmes généraux</div>

            {/* Card with boxes - Responsive grid */}
            <div className="bg-white border flex flex-col sm:flex-row justify-center items-stretch border-gray-200 rounded sm:divide-x divide-y sm:divide-y-0 divide-gray-200 overflow-hidden">
              <div 
                onClick={() => setActiveTab("selling")}
                className="flex-1 flex flex-col items-center justify-center px-4 py-8 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Tag className="w-8 h-8 text-[#007782] mb-2" />
                <span className="text-sm font-medium">Vendre</span>
              </div>

              <div 
                onClick={() => setActiveTab("buying")}
                className="flex-1 flex flex-col items-center justify-center px-4 py-8 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="w-8 h-8 text-[#007782] mb-2" />
                <span className="text-sm font-medium">Acheter</span>
              </div>

              <div 
                onClick={() => setActiveTab("account")}
                className="flex-1 flex flex-col items-center justify-center px-4 py-8 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <User className="w-8 h-8 text-[#007782] mb-2" />
                <span className="text-sm font-medium text-center leading-tight">Mon compte et paramètres</span>
              </div>
            </div>
          </div>
        );
      case "selling":
        return <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">Contenu pour Vendre (Design à venir...)</div>;
      case "buying":
        return <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">Contenu pour Acheter (Design à venir...)</div>;
      case "account":
        return <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">Contenu pour Mon compte (Design à venir...)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-50">
      {/* < /> */}
      
      <div className="flex-grow w-full mx-auto max-w-5xl md:bg-white md:rounded-xl md:p-8 md:mt-10 md:mb-10 md:shadow-sm px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Left Side Navigation */}
          <div className="w-full md:w-1/4">
            <h2 className="text-2xl font-bold mb-6 md:mb-8 text-slate-800">Centre d'aide</h2>
            
            {/* Nav list - Scrollable on mobile if items grow */}
            <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-6 md:gap-4 text-gray-700 border-b md:border-none pb-4 md:pb-0 no-scrollbar">
              <li 
                onClick={() => setActiveTab("home")}
                className={`cursor-pointer whitespace-nowrap hover:text-[#007782] transition-colors ${activeTab === 'home' ? 'font-bold text-[#007782] md:border-l-2 md:pl-3 md:-ml-3 md:border-[#007782]' : ''}`}
              >
                Page d’accueil
              </li>
              <li 
                onClick={() => setActiveTab("selling")}
                className={`cursor-pointer whitespace-nowrap hover:text-[#007782] transition-colors ${activeTab === 'selling' ? 'font-bold text-[#007782] md:border-l-2 md:pl-3 md:-ml-3 md:border-[#007782]' : ''}`}
              >
                Vendre
              </li>
              <li 
                onClick={() => setActiveTab("buying")}
                className={`cursor-pointer whitespace-nowrap hover:text-[#007782] transition-colors ${activeTab === 'buying' ? 'font-bold text-[#007782] md:border-l-2 md:pl-3 md:-ml-3 md:border-[#007782]' : ''}`}
              >
                Acheter
              </li>
              <li 
                onClick={() => setActiveTab("account")}
                className={`cursor-pointer whitespace-nowrap hover:text-[#007782] transition-colors ${activeTab === 'account' ? 'font-bold text-[#007782] md:border-l-2 md:pl-3 md:-ml-3 md:border-[#007782]' : ''}`}
              >
                Paramètres
              </li>
            </ul>
          </div>

          {/* Right Side Content Area */}
          <div className="flex-1 mt-4 md:mt-0">
            {renderContent()}
          </div>

        </div>
      </div>

      {/* Hide footer on mobile, show on medium screens and up */}
      <footer className="hidden md:block">
        <Footer />
      </footer>
    </div>
  );
}