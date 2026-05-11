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
  MessageCircle,
  Share2,
  Heart,
  Shield,
} from "lucide-react";
import { useParams } from "next/navigation";

import ProductCard from "@/app/components/ProductCard";
import Footer from "@/app/components/Footer";
import { getUser } from "@/services/auth-service";
import { useAuth } from "@/context/AuthContext";
import { getFirstImageUrl, fetchProductsByUserId } from "@/services/products-service";
const ProfilePage = ({ show = true }: { show?: boolean }) => {
  const params = useParams();
  const sellerId = params?.id;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Listings");
  const [userData, setUserData] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
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

  useEffect(() => {
    const fetchProducts = async () => {
      if (!sellerId || !userData) return;
      
      // Only fetch from API if userData doesn't have products or we want fresh data
      if (userData.products && userData.products.length > 0) {
        setListings(userData.products.map(mapProductToCard));
        return;
      }
      
      try {
        setProductsLoading(true);
        const products = await fetchProductsByUserId(Number(sellerId));
        setListings(products);
      } catch (err: any) {
        console.error("Products Fetch Error:", err);
      } finally {
        setProductsLoading(false);
      }
    };

    if (activeTab === "Listings") {
      fetchProducts();
    }
  }, [sellerId, userData, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#faf9f7] to-[#f0ede8]">
        <div className="animate-pulse space-y-6">
          <div className="w-40 h-40 rounded-full bg-[#e0ddd8]" />
          <div className="w-64 h-4 bg-[#e0ddd8] rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#faf9f7] to-[#f0ede8] px-4">
        <div className="text-center">
          <div className="rounded-full bg-white p-6 shadow-lg w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Users size={48} className="text-[#cb6f4d]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">User Not Found</h2>
          <p className="text-[#888]">{error || "We couldn't find this member."}</p>
        </div>
      </div>
    );
  }

  const mapProductToCard = (entry: any) => {
    const attributes = entry ?? {};
    const brand = attributes.brand ?? "";
    const size = attributes.size ?? "";
    const condition = attributes.condition ?? "";
    const price = attributes.price ? `${attributes.price}` : "N/A";
    const totalPrice = price;
    const imageUrl = getFirstImageUrl(attributes.images);
    const likes = Number(attributes.likeCount ?? 0) || 0;

    return {
      id: entry.id,
      brand,
      size,
      condition,
      price,
      totalPrice,
      imageUrl,
      likes,
    };
  };

  const productListings = userData.products || [];
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
      {/* Background Gradient */}
      <div className="min-h-screen bg-linear-to-br from-[#faf9f7] via-white to-[#f0ede8]">
        
        {/* Header Section */}
        <div className="border-b border-[#e0ddd8]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
              
              {/* Avatar Section */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-56 md:h-56 rounded-full overflow-hidden shadow-xl border-4 border-white bg-white">
                  <Image
                    src={
                      avatarSrc ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
                    }
                    alt={userData.username || "User"}
                    fill
                    className="object-cover rounded-full"
                    priority
                  />
                </div>
                {userData.confirmed && (
                  <div className="absolute -bottom-2 -right-2 bg-[#cb6f4d] rounded-full p-3 shadow-lg border-4 border-white">
                    <Shield size={24} className="text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info Section */}
              <div className="flex-1 w-full">
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a1a] mb-3">
                    {userData.username}
                  </h1>
                  
                  {/* Rating */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex text-[#cb6f4d]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={
                              i < Math.floor(ratingAvg) ? "currentColor" : "none"
                            }
                            className={
                              i < Math.floor(ratingAvg) ? "" : "text-[#e0ddd8]"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[#888] text-sm font-medium">
                        {ratingAvg.toFixed(1)} • {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff0e8] border border-[#f0c9b8]">
                    <div className="w-2 h-2 rounded-full bg-[#cb6f4d]" />
                    <span className="text-sm font-medium text-[#cb6f4d]">
                      {userData.is_pro ? "🌟 Reluv Pro Member" : "✓ Active Seller"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  {user?.id !== userData?.id && (
                    <>
                      {/* <button className="flex-1 sm:flex-none bg-[#cb6f4d] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#b85f3d] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <MessageCircle size={18} />
                        Message
                      </button> */}
                      <button className="flex-1 sm:flex-none border-2 border-[#cb6f4d] text-[#cb6f4d] px-6 py-3 rounded-full font-semibold hover:bg-[#fff0e8] transition-all flex items-center justify-center gap-2">
                        <Heart size={18} />
                        Follow
                      </button>
                    </>
                  )}
                  {/* <button className="sm:flex-none p-3 text-[#aaa] hover:bg-white rounded-full border border-[#e0ddd8] transition-colors">
                    <Share2 size={20} />
                  </button> */}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#aaa] mb-4">About</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[#555]">
                        <MapPin size={18} className="text-[#cb6f4d]" />
                        <span className="text-sm">{userData.country || "Spain"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#555]">
                        <Clock size={18} className="text-[#cb6f4d]" />
                        <span className="text-sm">Last seen {timeAgo(userData?.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#555]">
                        <Users size={18} className="text-[#cb6f4d]" />
                        <span className="text-sm">
                          <span className="font-semibold text-[#1a1a1a]">{followers}</span> followers • 
                          <span className="font-semibold text-[#1a1a1a] ml-1">{following}</span> following
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#aaa] mb-4">Verified</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail
                          size={18}
                          className={
                            userData.confirmed ? "text-[#cb6f4d]" : "text-[#ddd]"
                          }
                        />
                        <span className={`text-sm font-medium ${userData.confirmed ? "text-[#1a1a1a]" : "text-[#aaa]"}`}>
                          {userData.confirmed ? "✓ Email Verified" : "Email Not Verified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield
                          size={18}
                          className="text-[#cb6f4d]"
                        />
                        <span className="text-sm font-medium text-[#1a1a1a]">
                          ✓ Member Since {new Date(userData.createdAt || Date.now()).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          
          {/* Tabs */}
          <div className="border-b border-[#e0ddd8] mb-8">
            <div className="flex gap-8 justify-center sm:justify-start">
              <button
                onClick={() => setActiveTab("Listings")}
                className={`pb-4 text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
                  activeTab === "Listings"
                    ? "border-b-2 border-[#cb6f4d] text-[#cb6f4d]"
                    : "text-[#aaa] hover:text-[#555]"
                }`}
              >
                Items Listed ({listings.length})
              </button>
              <button
                onClick={() => setActiveTab("Reviews")}
                className={`pb-4 text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
                  activeTab === "Reviews"
                    ? "border-b-2 border-[#cb6f4d] text-[#cb6f4d]"
                    : "text-[#aaa] hover:text-[#555]"
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "Listings" && (
            <div>
              {listings.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {listings.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      likes={Number(product.likes || 0)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="rounded-full bg-white w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Heart size={32} className="text-[#e0ddd8]" />
                  </div>
                  <p className="text-[#aaa] text-lg">No items listed yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="max-w-3xl">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any, idx: number) => (
                    <div
                      key={review.id}
                      className={`bg-white rounded-2xl p-6 border border-[#e0ddd8] shadow-sm hover:shadow-md transition-all ${
                        idx !== reviews.length - 1 ? "" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex text-[#cb6f4d]">
                              {[...Array(review.rating || 5)].map((_, i) => (
                                <Star key={i} size={16} fill="currentColor" />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-[#aaa]">
                              {review.rating || 5} out of 5
                            </span>
                          </div>
                          <p className="font-semibold text-[#1a1a1a] text-sm">
                            {review.author?.username || "Anonymous Buyer"}
                          </p>
                          <p className="text-xs text-[#aaa]">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-[#cb6f4d]">Verified Purchase</span>
                        </div>
                      </div>
                      <p className="text-[#555] text-sm leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="rounded-full bg-white w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Star size={32} className="text-[#e0ddd8]" />
                  </div>
                  <p className="text-[#aaa] text-lg">No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;
