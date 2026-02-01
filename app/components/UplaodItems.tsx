"use client";
import  { useState, useRef, ChangeEvent, JSX } from "react";
import { Plus, Camera, X } from "lucide-react";

export default function UploadItem(): JSX.Element {
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useState<string>("");

  // Trigger the hidden file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and create preview URLs
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  // Remove an image from the preview list
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 bg-gray-50 min-h-screen pb-20">
      
      {/* Photo Upload Section */}
      <div className="bg-white border border-gray-200 rounded-sm p-6 border-dashed border-2 min-h-[250px]">
        {/* Hidden File Input */}
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center py-6">
          {/* Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full">
              {images.map((src, index) => (
                <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                  <img src={src} alt={`Upload ${index}`} className="object-cover w-full h-full" />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-6 py-2 border border-[#007782] text-[#007782] rounded-md font-semibold hover:bg-teal-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Upload photos</span>
          </button>
        </div>
        
        {/* Quality Tip */}
        <div className="mt-4 w-full bg-[#f0f9f9] border border-[#d0f0f0] rounded-md p-3 flex items-center gap-3">
          <div className="p-1 bg-white rounded border border-[#b0e0e0]">
            <Camera className="w-5 h-5 text-[#007782]" />
          </div>
          <p className="text-sm text-gray-700">
            Catch your buyers' eye — use quality photos.{" "}
            <a href="#" className="text-[#007782] underline font-medium">Learn how</a>
          </p>
        </div>
      </div>

      {/* Title & Description Section */}
      <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-gray-100 pb-6">
          <label className="font-semibold text-gray-900 min-w-[150px]">Title</label>
          <input
            type="text"
            placeholder="Tell buyers what you're selling"
            className="flex-1 focus:outline-none text-gray-800 placeholder-gray-300"
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <label className="font-semibold text-gray-900 min-w-[150px]">Describe your item</label>
          <textarea
            placeholder="Tell buyers more about it"
            rows={4}
            className="flex-1 focus:outline-none text-gray-800 placeholder-gray-300 resize-none"
          />
        </div>
      </div>
      {/* Price Section */}
      <div className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <label className="font-semibold text-gray-900 min-w-[150px] w-full md:w-auto">Price</label>
        <div className="flex-1 w-full">
          <div className="flex items-center border-b border-gray-100 py-1">
            <span className="text-gray-900">€</span>
            <input
              type="text"
              placeholder="0.00"
              className="w-full ml-1 focus:outline-none text-gray-800 placeholder-gray-300"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white border border-gray-200 rounded-sm p-6 flex justify-between items-center">
        <span className="text-gray-600">What do you think of our upload process?</span>
        <button className="px-4 py-2 border border-[#007782] text-[#007782] rounded-md text-sm font-semibold hover:bg-teal-50">
          Give feedback
        </button>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-6">
        <button className="px-6 py-2 border border-[#007782] text-[#007782] rounded-md font-semibold hover:bg-teal-50">
          Save draft
        </button>
        <button className="px-8 py-2 bg-[#007782] text-white rounded-md font-semibold hover:bg-[#005f68]">
          Upload
        </button>
      </div>
    </div>
  );
}