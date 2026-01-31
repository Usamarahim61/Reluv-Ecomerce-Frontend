"use client";
import { useState } from "react";

export default function ProfileSetting() {
  const [country, setCountry] = useState("Spain");
  const [city, setCity] = useState("");
  const [showCity, setShowCity] = useState(true);
  const [language, setLanguage] = useState("English");

  const countries = ["Spain", "France", "Germany", "Netherlands"];
  const cities = ["Madrid", "Barcelona", "Valencia", "Seville"];
  const languages = ["English", "Français", "Español", "Nederlands"];

  return (
    <>
      {" "}
      {/* <--- Added Fragment Open */}
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6 space-y-6 mb-6">
        {/* Row 1: Your Photo */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Your Photo</span>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              <span>👤</span>
            </div>
            <button className="px-3 py-1.5 border border-[#007782] text-[#007782] bg-transparent rounded text-sm hover:bg-gray-50">
              Change Photo
            </button>
          </div>
        </div>

        {/* Row 2: Username */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Username</span>
          <button className="px-3 py-1.5 border border-[#007782] text-[#007782] bg-transparent rounded text-sm hover:bg-gray-50">
            Change Username
          </button>
        </div>

        {/* Row 3: About You */}
        <div className="flex items-start justify-between gap-4">
          <span className="font-medium pt-2">About You</span>
          <textarea
            className="flex-1 border border-gray-300 rounded p-2 resize-none focus:outline-none focus:border-[#007782]"
            rows={4}
            placeholder="Write something about yourself..."
          />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6  space-y-6">
        {/* My location */}
        <div className="space-y-3">
          <h3 className="text-gray-500 text-sm font-medium">My location</h3>

          {/* Country */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="font-medium">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="text-gray-700 border-none focus:ring-0"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Town/City */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="font-medium">Town/City</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-gray-700 border-none focus:ring-0"
            >
              <option value="">Select a city</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Show city toggle */}
          <div className="flex justify-between items-center pt-2">
            <span className="font-medium">Show city in profile</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCity}
                onChange={() => setShowCity(!showCity)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#007782] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white relative"></div>
            </label>
          </div>
        </div>
      </div>
      {/* Language */}
      <div className="bg-white border border-gray-200  mt-5 rounded-lg shadow p-6  space-y-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-medium">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-gray-700 border-none focus:ring-0"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Update button */}
      <div className="text-right mt-5">
        <button className="bg-[#007782] text-white px-4 py-2 rounded hover:bg-[#00656f]">
          Update profile
        </button>
      </div>
    </> // <--- Added Fragment Close
  );
}
