"use client";
import { useState } from "react";

export default function AccountSetting() {
  const [fullName, setFullName] = useState("Raja Abad");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [holidayMode, setHolidayMode] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 bg-gray-50">
      {/* Email & Phone Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-gray-900">rajaabad335@gmail.com</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              Verified <span>✓</span>
            </p>
          </div>
          <button className="px-4 py-1 border border-[#007782] text-[#007782] rounded-md text-sm font-medium hover:bg-gray-50">
            Change
          </button>
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <span className="font-medium text-gray-900">Phone number</span>
          <button className="px-4 py-1 border border-[#007782] text-[#007782] rounded-md text-sm font-medium hover:bg-gray-50">
            Verify
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Your phone number will only be used to help you log in. It won't be made public, or used for marketing purposes.
        </p>
      </div>

      {/* Personal Info Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b pb-4">
          <label className="font-medium text-gray-700">Full name</label>
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-gray-50 p-3 focus:outline-none text-gray-600"
          />
        </div>

        <div className="flex justify-between items-center border-b pb-4">
          <label className="font-medium text-gray-700">Gender</label>
          <select 
            value={gender} 
            onChange={(e) => setGender(e.target.value)}
            className="text-gray-500 bg-transparent focus:outline-none"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">Birthday</label>
          <input 
            type="date" 
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="text-gray-500 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Holiday Mode */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-center shadow-sm">
        <span className="font-medium text-gray-900">Holiday mode</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={holidayMode}
            onChange={() => setHolidayMode(!holidayMode)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#007782] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>

      {/* Linked Accounts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b pb-4">
          <span className="font-medium text-gray-900">Facebook</span>
          <button className="px-4 py-1 border border-[#007782] text-[#007782] rounded-md text-sm font-medium">Link</button>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">Google</span>
          <button className="px-4 py-1 border border-gray-300 text-gray-500 rounded-md text-sm font-medium" disabled>Linked</button>
        </div>
        <p className="text-xs text-gray-500">Link to your other accounts to become a trusted, verified member.</p>
      </div>

      {/* Security & Actions */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-center shadow-sm">
          <span className="font-medium text-gray-900">Change password</span>
          <button className="px-4 py-1 border border-[#007782] text-[#007782] rounded-md text-sm font-medium">Change</button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-center shadow-sm cursor-pointer hover:bg-gray-50">
          <span className="font-medium text-gray-900">Delete my account</span>
          <span className="text-gray-400">›</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button className="bg-[#007782] text-white px-8 py-2 rounded font-medium hover:bg-[#005f68] transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}