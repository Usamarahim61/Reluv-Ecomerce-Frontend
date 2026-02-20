"use client";
import React, { useState } from "react";
import { Info, CheckCircle2 } from "lucide-react";
import Navbar from "../components/navbar";

// 1. Define the dynamic data
const MESSAGES_DATA = [
  {
    id: 1,
    sender: "Reluv",
    avatar: "R",
    isVerified: true,
    heading: "Shop tech for less 🤖",
    timestamp: "1 day ago",
    image: "https://static.vinted.com/assets/news/en/electronics_verification-286d9a139a099493540134421b089c1e7a6f233f813959959e1903698886227b.png",
    content: "Electronics are now trending at Rulv! We've extended free shipping on all tech items through 15 March. Don't miss out on these deals.",
    isPromo: true
  },
  {
    id: 2,
    sender: "Sarah Miller",
    avatar: "S",
    isVerified: false,
    heading: "Inquiry about Vintage Jacket",
    timestamp: "2 hours ago",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop",
    content: "Hi! I saw your vintage denim jacket. Is the price negotiable? I'm really interested in buying it today.",
    isPromo: false
  },
  {
    id: 3,
    sender: "Alex Chen",
    avatar: "A",
    isVerified: false,
    heading: "Shipping Update",
    timestamp: "5 mins ago",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop",
    content: "Hey, I just dropped off the sneakers at the post office. You should receive a tracking number in the app shortly!",
    isPromo: false
  }
];

export default function Messages() {
  const [viewMessage, setViewMessage] = useState(false);
  const [selectedId, setSelectedId] = useState(1);

  // Find the currently selected message data
  const activeMessage = MESSAGES_DATA.find((m) => m.id === selectedId) || MESSAGES_DATA[0];

  return (
    <>
      <Navbar />
      <div className="md:mt-5 flex flex-col h-[calc(100vh-70px)] md:h-[85vh] max-w-7xl mx-auto bg-white font-sans text-[#111111] md:border md:border-gray-300 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex border-b border-gray-200 text-sm font-medium">
          <div className={`w-full md:w-80 p-4 border-r border-gray-200 ${viewMessage ? 'hidden md:block' : 'block'}`}>
            Inbox
          </div>
          <div className={`flex-1 p-4 flex justify-between items-center bg-white ${!viewMessage ? 'hidden md:flex' : 'flex'}`}>
            <button onClick={() => setViewMessage(false)} className="md:hidden text-[#007782] font-medium">
              ← Back
            </button>
            <div className="flex items-center gap-1 mx-auto md:mx-0">
              <span className="font-semibold text-lg">{activeMessage.sender}</span>
              {activeMessage.isVerified && (
                <CheckCircle2 size={16} className="text-[#007782] fill-current text-white" />
              )}
            </div>
            <Info size={20} className="text-gray-400 cursor-pointer" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Dynamic List */}
          <aside className={`w-full md:w-80 border-r border-gray-200 flex flex-col bg-white ${viewMessage ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto">
              {MESSAGES_DATA.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => {
                    setSelectedId(msg.id);
                    setViewMessage(true);
                  }}
                  className={`flex items-start gap-3 p-4 cursor-pointer border-b border-gray-50 transition-colors
                    ${selectedId === msg.id ? 'bg-[#f2f2f2] border-l-4 border-[#007782]' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                >
                  <div className="relative w-12 h-12 bg-[#007782] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {msg.avatar}
                    {msg.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                         <CheckCircle2 size={14} className="text-[#007782]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className={`text-[15px] ${selectedId === msg.id ? 'font-bold' : 'font-medium'}`}>
                        {msg.sender}
                      </span>
                      <span className="text-gray-500 text-xs">{msg.timestamp}</span>
                    </div>
                    <p className="text-gray-600 text-[14px] truncate">{msg.heading}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content - Dynamic Message View */}
          <main className={`flex-1 flex-col bg-[#f5f5f5] md:bg-white overflow-y-auto ${!viewMessage ? 'hidden md:flex' : 'flex'}`}>
            <div className="max-w-2xl w-full mx-auto p-4">
              <div className="text-center text-xs text-gray-500 my-4 uppercase tracking-wider">
                {activeMessage.timestamp}
              </div>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#007782] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {activeMessage.avatar}
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm w-full max-w-lg">
                  <img 
                    src={activeMessage.image} 
                    alt={activeMessage.sender}
                    className="w-full h-48 object-cover border-b border-gray-100"
                  />
                  
                  <div className="p-5 space-y-4 text-[15px] leading-relaxed text-gray-800">
                    <h2 className="text-lg font-bold">{activeMessage.heading}</h2>
                    <p>{activeMessage.content}</p>
                    
                    {activeMessage.isPromo && (
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <p className="font-semibold mb-2">Exclusive Offer for You:</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="text-[#007782]">•</span> Free Shipping on all electronics
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#007782]">•</span> 24/7 Support Included
                          </li>
                        </ul>
                      </div>
                    )}

                    <button className="w-full py-2 border border-[#007782] text-[#007782] font-semibold rounded-md hover:bg-teal-50 transition-colors">
                      View Item Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}