"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Mail,
  PlusSquare,
  ChevronDown,
} from "lucide-react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/navbar";
import ProductCard from "@/app/components/ProductCard";
import Footer from "@/app/components/Footer";
import { getUser } from "@/services/auth-service";
import { useAuth } from "@/context/AuthContext";

const ProfilePage = ({ showNavbar = true }: { showNavbar?: boolean }) => {
  const params = useParams();
  const sellerId = params?.id;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Listings");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeAgo = (dateString: string | undefined) => {
    if (!dateString) return "recientemente";
    const now = new Date().getTime();
    const past = new Date(dateString).getTime();
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return "just hour";
    if (seconds < 3600) return ` ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;

    return new Date(dateString).toLocaleDateString("es-ES");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!sellerId) return;

      try {
        setLoading(true);
        const data = await getUser(Number(sellerId));
        setUserData(data);
      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007782]"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "User not found"}
      </div>
    );
  }

  const listings = userData.products || [];
  const reviews = userData.received_reviews || [];
  const ratingAvg = userData.rating_avg || 5;
  const followers = userData.followers?.length || 0;
  const following = userData.following?.length || 0;

  /* ✅ SAFE IMAGE FIX (only change) */
  const avatarSrc =
    userData.avatar?.url && userData.avatar.url.trim() !== ""
      ? userData.avatar.url
      : null;

  return (
    <>
      {showNavbar && <Navbar />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 font-sans text-gray-800">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start mb-10">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-48 md:h-48 rounded-full overflow-hidden shadow-sm border border-gray-100">
              <Image
                src={
                  avatarSrc ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
                }
                alt={userData.username || "User"}
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{userData.username}</h1>
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={
                          i < Math.floor(ratingAvg) ? "currentColor" : "none"
                        }
                        className={
                          i < Math.floor(ratingAvg) ? "" : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {reviews.length} reviews
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {user?.id !== userData?.id && (
                  <button className="flex-1 sm:flex-none bg-[#007782] text-white px-8 py-2 rounded-md font-medium hover:bg-[#005f68] transition-colors">
                    Follow
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full border sm:border-none">
                  <span className="text-xl font-bold leading-none">···</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center sm:justify-start gap-3 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
              <div className="bg-[#e6f7f6] p-1.5 rounded-md shrink-0">
                <PlusSquare className="text-[#007782]" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">
                  {userData.is_pro ? "Reluv Pro" : "Active Seller"}
                </p>
                <p className="text-gray-500 text-xs">
                  {listings.length > 5
                    ? "Regularly lists items."
                    : "Verified member."}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 max-w-2xl text-center sm:text-left">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
                  About:
                </p>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {userData.country || "Spain"}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Clock size={16} className="text-gray-400" />
                    Last seen {timeAgo(userData?.updatedAt)}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>
                      <b className="text-gray-800 underline">{followers}</b>{" "}
                      followers,{" "}
                      <b className="text-gray-800 underline">{following}</b>{" "}
                      following
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
                  Verified info:
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                  <Mail
                    size={16}
                    className={
                      userData.confirmed ? "text-green-500" : "text-gray-400"
                    }
                  />
                  {userData.confirmed ? "Email Verified" : "Email Not Verified"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content unchanged */}
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;
