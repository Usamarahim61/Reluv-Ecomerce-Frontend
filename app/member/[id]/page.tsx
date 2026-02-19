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
  const sellerId = params?.id; // Matches the folder [id]
   const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Listings");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeAgo = (dateString: string | undefined) => {
  if (!dateString) return "recientemente";

  // FIX: Convert dates to numbers using .getTime() to avoid TS(2363)
  const now = new Date().getTime();
  const past = new Date(dateString).getTime();
  const seconds = Math.floor((now - past) / 1000);
  
  if (seconds < 60) return "just hour";
  if (seconds < 3600) return ` ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
  
  return new Date(dateString).toLocaleDateString('es-ES');
};

  useEffect(() => {
    const fetchData = async () => {
      if (!sellerId) return;
      
      try {
        setLoading(true);
        // Ensure your getUser function handles the Strapi /users/:id endpoint
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

  // Map Strapi relations to variables
  const listings = userData.products || [];
  const reviews = userData.received_reviews || [];
  const ratingAvg = userData.rating_avg || 5;
  const followers = userData.followers.length
  const following = userData.following.length

  return (
    <>
      {showNavbar && <Navbar />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-800">
        {/* --- Profile Header Section --- */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Profile Image */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-sm border border-gray-100">
              <Image
                src={userData.avatar?.url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"}
                alt={userData.username}
                fill
                className="object-cover rounded-full"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold">
                  {userData.username}
                </h1>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        fill={i < Math.floor(ratingAvg) ? "currentColor" : "none"} 
                        className={i < Math.floor(ratingAvg) ? "" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {reviews.length} reviews
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

            {/* Badge - Logic based on is_pro or listing count */}
            <div className="mt-4 flex items-center gap-3">
              <div className="bg-[#e6f7f6] p-1.5 rounded-md">
                <PlusSquare className="text-[#007782]" size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {userData.is_pro ? "Vinted Pro" : "Active Seller"}
                </p>
                <p className="text-gray-500 text-xs">
                  {listings.length > 5 ? "Regularly lists items." : "Verified Vinted member."}
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
                    {userData.location || "Spain"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />{" "}
                    Last seen {timeAgo(userData?.updatedAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>
                      <b className="text-gray-800 underline">{followers || 0}</b> followers,{" "}
                      <b className="text-gray-800 underline">{following || 0}</b> following
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                  Verified info:
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className={userData.confirmed ? "text-green-500" : "text-gray-400"} /> 
                  {userData.confirmed ? "Email Verified" : "Email Not Verified"}
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
              className={`pb-4 px-2 font-semibold text-sm transition-all ${
                activeTab === "Listings" 
                  ? "border-b-2 border-[#007782] text-[#007782]" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Listings ({listings.length})
            </button>
            <button
              onClick={() => setActiveTab("Reviews")}
              className={`pb-4 px-2 font-semibold text-sm transition-all ${
                activeTab === "Reviews" 
                  ? "border-b-2 border-[#007782] text-[#007782]" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>
        </div>

        {/* --- Tab Content --- */}
        {activeTab === "Listings" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-lg font-semibold">{listings.length} items</h2>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 cursor-pointer text-gray-600">
                  Category <span className="font-semibold text-gray-800">All</span> <ChevronDown size={16} />
                </div>
                <div className="flex items-center gap-2 cursor-pointer text-gray-600">
                  Sort by <span className="font-semibold text-gray-800">Relevance</span> <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {listings.map((product: any) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  likes={Number(product.likes || 0)}
                />
              ))}
              {listings.length === 0 && <p className="col-span-full text-gray-400">No items listed yet.</p>}
            </div>
          </>
        )}

        {activeTab === "Reviews" && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-lg font-semibold">{reviews.length} reviews</h2>
            {reviews.map((review: any) => (
              <div key={review.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {review.author?.username || "Anonymous"} — {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.content}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-gray-400">No reviews yet.</p>}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;