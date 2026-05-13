"use client";
import { Plus, Info, Home, MapPin, ChevronDown } from "lucide-react";

export default function Postage() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 bg-white">
      {/* Your Address Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Your address</h2>
        <button className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-gray-700">Add your address</span>
          <Plus className="w-5 h-5 text-gray-400" />
        </button>
        <p className="text-sm text-gray-500">
          Where couriers will collect or deliver orders, and what we'll use to process returns.
        </p>
      </div>

      {/* Warning/Info Box */}
      <div className="flex gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
        <div className="mt-0.5">
          <Info className="w-5 h-5 text-[#cb6f4d]" />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Disabling shipping options may reduce sales. If a member can only buy from you with a 
          disabled option, we may still offer it.{" "}
          <a href="#" className="text-[#cb6f4d] underline hover:text-[#005f68]">
            Learn more about disabled options.
          </a>
        </p>
      </div>

      {/* Shipping as a seller */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Shipping as a seller</h2>
          <p className="text-sm text-gray-500">
            Choose which options you'd like to use for each shipping type.
          </p>
        </div>

        {/* Option 1: From your address */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-gray-50 rounded-full">
              <Home className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">From your address</p>
              <p className="text-sm text-gray-500">A courier collects the order from you.</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>

        {/* Option 2: From a drop-off point */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-gray-50 rounded-full">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">From a drop-off point</p>
              <p className="text-sm text-gray-500">You take the order to a location like a locker or parcel shop.</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Footer Info */}
      <div className="space-y-4 pt-4">
        <p className="text-xs text-gray-500">
          Some shipping options are enabled for all sellers on our platform and can't be turned off.
        </p>
        <a href="#" className="inline-block text-xs text-[#cb6f4d] underline hover:text-[#005f68]">
          See compensation information
        </a>
        <span className="text-xs text-gray-500"> for sellers using integrated shipping.</span>
      </div>
    </div>
  );
}