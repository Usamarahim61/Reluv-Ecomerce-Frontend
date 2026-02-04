"use client";
import React, { useState } from "react";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Mail,
  PlusSquare,
  ChevronDown,
  Heart,
} from "lucide-react";
import { items } from "@/app/dataCenter";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/navbar";
import ProductCard from "@/app/components/ProductCard";
import Footer from "@/app/components/Footer";

const ProfilePage = ({ showNavbar = true }: { showNavbar?: boolean }) => {
  const params = useParams();
  const sellerId = params.id;
  const [activeTab, setActiveTab] = useState("Listings");

  // Find the seller and their products
  const sellerProducts = items.filter((item) => item.seller.id === sellerId);
  const seller = sellerProducts[0]?.seller;

  const mockReviews = [
    {
      id: 1,
      reviewer: "Alice",
      rating: 5,
      comment: "Great seller, fast shipping!",
      date: "2023-10-01",
    },
    {
      id: 2,
      reviewer: "Bob",
      rating: 4,
      comment: "Item as described, good quality.",
      date: "2023-09-28",
    },
    {
      id: 3,
      reviewer: "Charlie",
      rating: 5,
      comment: "Highly recommend!",
      date: "2023-09-25",
    },
  ];
  return (
    <>
      {showNavbar && <Navbar />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-800">
        {/* --- Profile Header Section --- */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Profile Image */}
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
              alt="Profile"
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-sm"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold">
                  {seller?.name || "Seller"}
                </h1>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex text-yellow-400">
                    {[...Array(Math.floor(Number(seller?.rating ?? 5)))].map(
                      (_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ),
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {seller?.reviews || 0} reviews
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-[#007782] text-white px-8 py-2 rounded-md font-medium hover:bg-[#005f68] transition-colors">
                  Follow
                </button>
                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                  <span className="text-xl font-bold">···</span>
                </button>
              </div>
            </div>

            {/* Badge */}
            <div className="mt-4 flex items-center gap-3">
              <div className="bg-[#e6f7f6] p-1.5 rounded-md">
                <PlusSquare className="text-[#007782]" size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {seller?.badge || "Seller"}
                </p>
                <p className="text-gray-500 text-xs">
                  {seller?.badge === "Frequent Uploads"
                    ? "Regularly lists 5 or more items."
                    : "Active seller on the platform."}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 max-w-2xl">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                  About:
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />{" "}
                    {seller?.location || "Location"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />{" "}
                    {seller?.lastSeen || "Last seen"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>
                      <b className="text-gray-800 underline">
                        {seller?.followers || 0}
                      </b>{" "}
                      followers,{" "}
                      <b className="text-gray-800 underline">
                        {seller?.following || 0}
                      </b>{" "}
                      following
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                  Verified info:
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" /> Email
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Tabs Section --- */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("Listings")}
              className={`pb-4 px-2 font-semibold text-sm ${activeTab === "Listings" ? "border-b-2 border-[#007782]" : "text-gray-400 font-medium hover:text-gray-600 transition-colors"}`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab("Reviews")}
              className={`pb-4 px-2 font-semibold text-sm ${activeTab === "Reviews" ? "border-b-2 border-[#007782]" : "text-gray-400 font-medium hover:text-gray-600 transition-colors"}`}
            >
              Reviews
            </button>
          </div>
        </div>

        {activeTab === "Listings" && (
          <>
            {/* --- Filter Bar --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-lg font-semibold">
                {sellerProducts.length} items
              </h2>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 cursor-pointer text-gray-600">
                  Category{" "}
                  <span className="font-semibold text-gray-800">All</span>{" "}
                  <ChevronDown size={16} />
                </div>
                <div className="flex items-center gap-2 cursor-pointer text-gray-600">
                  Sort by{" "}
                  <span className="font-semibold text-gray-800">Relevance</span>{" "}
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* --- Product Grid --- */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sellerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  likes={Number(product.likes)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "Reviews" && (
          <>
            {/* --- Reviews Section --- */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">
                {mockReviews.length} reviews
              </h2>
              {mockReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {review.reviewer} - {review.date}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
