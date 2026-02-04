"use client";
import { X, Search } from "lucide-react";
import { JSX } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

export default function HelpComp(): JSX.Element{
  return (
      <><Navbar /><div
      className="relative w-full mx-auto max-w-7xl border border-gray-300 bg-white rounded-xl p-6   mt-10 mb-10"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      <div className="flex gap-6">
        {/* Left Side */}
        <div className="flex-1">
          <ul className="space-y-8 text-gray-700">
            <li className="cursor-pointer hover:underline">
              <h2 className="text-xl font-semibold  mb-6">Centre d'aide</h2>
            </li>
            <li className="cursor-pointer hover:underline">Page d’accueil</li>
            <li className="cursor-pointer hover:underline">Vendre</li>
            <li className="cursor-pointer hover:underline">Acheter</li>
            <li className="cursor-pointer hover:underline">
              Mon compte et paramètres
            </li>
          </ul>
        </div>

        {/* Right Side */}
        <div className="flex-1  flex flex-col gap-3">
          <h3 className="font-semibold mb-3">
            Comment pouvons-nous t'aider ?
          </h3>
          <p className="text-gray-600 mb-2">Tu as une question générale</p>

          {/* Search Bar */}
          <div className="hidden sm:flex flex-1 items-center bg-gray-100 rounded-md px-3 py-2 border border-gray-200 sm:ml-2">
            <Search className="text-[#007782] w-5 h-5" />
            <input
              type="text"
              placeholder="Search for items"
              className="bg-transparent outline-none flex-1 px-2" />
          </div>
          <div className="text-gray-600 mb-2 font-bold">Thèmes généraux</div>

          {/* Card with boxes */}
          <div className="bg-white border flex justify-center items-center border-gray-200 rounded shadow-sm divide-x divide-gray-200">
            {/* Vendre */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 cursor-pointer hover:bg-gray-50">
              <div className="mb-2">{/* SVG goes here */}</div>
              <span>Vendre</span>
            </div>

            {/* Acheter */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 cursor-pointer hover:bg-gray-50">
              <div className="mb-2">{/* SVG goes here */}</div>
              <span>Acheter</span>
            </div>

            {/* Mon compte et paramètres */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 cursor-pointer hover:bg-gray-50">
              <div className="mb-2">{/* SVG goes here */}</div>
              <span>Mon compte et paramètres</span>
            </div>
          </div>
        </div>
      </div>
    </div><Footer/></>
  );
}
