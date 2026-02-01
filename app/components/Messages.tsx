"use client";
import React, { JSX } from "react";
import { Mail } from "lucide-react";

export default function Messages(): JSX.Element {
  return (
    <div className="flex flex-col h-[88vh] max-w-7xl mx-auto  bg-white font-sans text-[#111111] border border-gray-300">
      <div className="flex flex-1 overflow-hidden border-t border-gray-200">
        
        {/* Sidebar - Message List */}
        <aside className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Inbox</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Thread list would go here */}
            <div className="p-8 text-center text-gray-400 text-sm">
              No conversations yet.
            </div>
          </div>
        </aside>

        {/* Main Content - Message View */}
        <main className="hidden md:flex flex-1 flex-col items-center justify-center bg-white p-4 text-center">
          <div className="max-w-md space-y-4">
            {/* Custom Styled Envelope Icon */}
            <div className="relative inline-block">
              <div className="p-6 rounded-full bg-teal-50/50">
                <Mail className="w-16 h-16 text-[#007782] stroke-[1.25]" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">No messages yet</h3>
            <p className="text-gray-500 text-[15px]">
              When someone sends a message to you, it will appear here
            </p>
          </div>
        </main>

      </div>

      {/* Footer Links */}
      <footer className="p-4 border-t border-gray-100 bg-white">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 max-w-6xl mx-auto">
          <a href="#" className="hover:underline transition-all">Privacy Centre</a>
          <a href="#" className="hover:underline transition-all">Cookie Policy</a>
          <a href="#" className="font-semibold text-gray-700 hover:underline transition-all">Cookie Settings</a>
          <a href="#" className="hover:underline transition-all">Terms & Conditions</a>
          <a href="#" className="hover:underline transition-all">Our Platform</a>
        </nav>
      </footer>
    </div>
  );
}