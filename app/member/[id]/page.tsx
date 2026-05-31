"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Mail,
  Heart,
  Shield,
  Pencil,
  Trash2,
  Eye,
  X,
  Loader2,
  Check,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import { getUser, getUserAvatr } from "@/services/auth-service";
import { useAuth } from "@/context/AuthContext";
import {
  getFirstImageUrl,
  fetchProductsByUserId,
  deleteMyProduct,
} from "@/services/products-service";
import { getUserAvatarUrl } from "@/lib/user-profile";
import { API_BASE_URL } from "@/app/constants/api";

// ── Owner product card ────────────────────────────────────────────────────
function OwnerProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: any;
  onEdit: (p: any) => void;
  onDelete: (id: number) => void;
}) {
  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${API_BASE_URL}${product.imageUrl}`
    : null;

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {product.title || product.brand}
        </p>
        <p className="text-sm font-bold text-[#cb6f4d] mt-0.5">
          {product.price}
        </p>
        <p className="text-sm font-normal text-[#cb6f4d] mt-0.5">
          {product.category.name}
        </p>
        {product.condition && (
          <p className="text-xs text-gray-400 mt-0.5">{product.condition}</p>
        )}
      </div>

      {/* Owner action bar */}
      <div className="flex border-t border-gray-100">
        <Link
          href={`/products/${product.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <Eye size={13} /> View
        </Link>
        {/* <button onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-blue-500 hover:bg-blue-50 transition-colors border-x border-gray-100">
          <Pencil size={13} /> Edit
        </button> */}
        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-400 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const sellerId = params?.id;
  const { user } = useAuth();
  const isOwner = user && String(user.id) === String(sellerId);

  const [activeTab, setActiveTab] = useState("Listings");
  const [userData, setUserData] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit / delete state
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
    let LoggedInUser = user;
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const profileAvatarUrl =
    getUserAvatarUrl(loggedInUser) ||
    getUserAvatarUrl(user) ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop";
  const timeAgo = (dateString: string | undefined) => {
    if (!dateString) return "recently";
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000,
    );
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    if (!sellerId) return;

    setLoading(true);
    setError(null); // Clear previous errors

    let isMounted = true; // Cleanup flag to prevent state updates after unmount

    const fetchData = async () => {
      try {
        // Fetch both in parallel
        const [avatarRes, userRes] = await Promise.all([
          getUserAvatr(Number(sellerId)),
          getUser(Number(sellerId)),
        ]);

        if (!isMounted) return;
        setLoggedInUser(userRes);
        // Combine data: user data takes priority, but merge avatar URL if available
        const combinedData = {
          ...userRes,
          avatarUrl: avatarRes.avatar?.url || userRes.avatarUrl || null,
        };
        console.log("Fetched user data:", combinedData);
        setUserData(combinedData);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Failed to load profile");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId || !userData || activeTab !== "Listings") return;
    if (userData.products?.length > 0) {
      setListings(userData.products.map(mapProductToCard));
      return;
    }
    setProductsLoading(true);
    fetchProductsByUserId(Number(sellerId))
      .then(setListings)
      .catch(console.error)
      .finally(() => setProductsLoading(false));
  }, [sellerId, userData, activeTab]);
  useEffect(() => {
    if (!user || !userData) return;
    const alreadyFollowing = (userData.followers || []).some(
      (f: any) => String(f.id) === String(user.id),
    );
    setIsFollowing(alreadyFollowing);
  }, [user, userData]);

  function mapProductToCard(entry: any) {
    return {
      id: entry.id,
      title: entry.title ?? "",
      category: entry.category ?? "",
      brand: entry.brand ?? "",
      size: entry.size ?? "",
      condition: entry.condition ?? "",
      price: entry.price ? `TBH ${entry.price}` : "N/A",
      totalPrice: entry.price ? `TBH ${entry.price}` : "N/A",
      imageUrl: getFirstImageUrl(entry.images),
      likes: Number(entry.likeCount ?? 0),
      description: entry.description ?? "",
    };
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteMyProduct(id);
      setListings((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved(updated: any) {
    setListings((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
    );
    setEditProduct(null);
  }
  async function handleFollow() {
    if (!user) {
      router.push("/login");
      return;
    }
    setFollowLoading(true);
    try {
      if (!user) return;
      const userData = await getUser(user.id);
      const currentFollowing: number[] = (userData.following || []).map(
        (f: any) => f.id ?? f,
      );

      let updatedFollowing: number[];
      if (isFollowing) {
        updatedFollowing = currentFollowing.filter(
          (id) => String(id) !== String(sellerId),
        );
      } else {
        updatedFollowing = [...currentFollowing, Number(sellerId)];
      }

      const storedJwt = localStorage.getItem("jwt"); // adjust to however you store the JWT
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedJwt}`,
        },
        body: JSON.stringify({ following: updatedFollowing }),
      });

      if (!res.ok) throw new Error("Failed to update follow status");

      // Optimistically update local UI
      setIsFollowing((prev) => !prev);
      setUserData((prev: any) => {
        if (!prev) return prev;
        const followers: any[] = prev.followers || [];
        return {
          ...prev,
          followers: isFollowing
            ? followers.filter((f: any) => String(f.id) !== String(user.id))
            : [...followers, { id: user.id }],
        };
      });
    } catch (err: any) {
      alert(err?.message || "Something went wrong.");
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-6">
          <div className="w-40 h-40 rounded-full bg-gray-200" />
          <div className="w-64 h-4 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Users size={48} className="text-[#cb6f4d] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-gray-400">
            {error || "We couldn't find this member."}
          </p>
        </div>
      </div>
    );
  }

  const reviews = userData.received_reviews || [];
  const ratingAvg = userData.rating_avg || 5;
  const followers = userData.followers?.length || 0;
  const following = userData.following?.length || 0;
  const avatarSrc = userData?.avatarUrl?.trim() || null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#faf9f7] via-white to-[#f0ede8]">
        {/* Header */}
        <div className="border-b border-[#e0ddd8]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-56 md:h-56 rounded-full overflow-hidden shadow-xl border-4 border-white bg-white">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={userData.username || "User"}
                      fill
                      className="object-cover content-center rounded-full"
                      priority
                    />
                  ) : profileAvatarUrl ? (
                    <img
                      src={profileAvatarUrl}
                      alt={userData.username || "User"}
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User
                        className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
                {userData.confirmed && (
                  <div className="absolute -bottom-2 -right-2 bg-[#cb6f4d] rounded-full p-3 shadow-lg border-4 border-white">
                    <Shield size={24} className="text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 w-full">
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a1a] mb-3">
                    {userData.username}
                  </h1>
                  <div className="flex items-center gap-3 mb-4">
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
                    <span className="text-[#888] text-sm">
                      {ratingAvg.toFixed(1)} • {reviews.length} reviews
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff0e8] border border-[#f0c9b8]">
                    <div className="w-2 h-2 rounded-full bg-[#cb6f4d]" />
                    <span className="text-sm font-medium text-[#cb6f4d]">
                      ✓ Active Seller
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  {isOwner ? (
                    <Link href="/SellNow">
                      <button className="bg-[#cb6f4d] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#b85f3d] transition-all shadow-md flex items-center gap-2 text-sm">
                        + Add new listing
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`border-2 px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        isFollowing
                          ? "border-[#cb6f4d] text-[#cb6f4d] hover:bg-[#fff0e8]"
                          : "border-[#cb6f4d] text-[#cb6f4d] hover:bg-[#fff0e8]"
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Heart
                          size={18}
                          fill={isFollowing ? "currentColor" : "none"}
                        />
                      )}
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#aaa] mb-4">
                      About
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[#555]">
                        <MapPin size={18} className="text-[#cb6f4d]" />
                        <span className="text-sm">
                          {userData.country || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#555]">
                        <Clock size={18} className="text-[#cb6f4d]" />
                        <span className="text-sm">
                          Last seen {timeAgo(userData?.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#555]">
                        <Users size={18} className="text-[#cb6f4d]" />
                        <span className="text-sm">
                          <span className="font-semibold text-[#1a1a1a]">
                            {followers}
                          </span>{" "}
                          followers •{" "}
                          <span className="font-semibold text-[#1a1a1a]">
                            {following}
                          </span>{" "}
                          following
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#aaa] mb-4">
                      Verified
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail
                          size={18}
                          className={
                            userData.confirmed
                              ? "text-[#cb6f4d]"
                              : "text-[#ddd]"
                          }
                        />
                        <span
                          className={`text-sm font-medium ${userData.confirmed ? "text-[#1a1a1a]" : "text-[#aaa]"}`}
                        >
                          {userData.confirmed
                            ? "✓ Email Verified"
                            : "Email Not Verified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield size={18} className="text-[#cb6f4d]" />
                        <span className="text-sm font-medium text-[#1a1a1a]">
                          ✓ Member Since{" "}
                          {(() => {
                            const d = new Date(
                              userData.createdAt || Date.now(),
                            );
                            const month = d.toLocaleString("default", {
                              month: "short",
                            }); // "May"
                            return `${month} ${d.getFullYear()}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="border-b border-[#e0ddd8] mb-8">
            <div className="flex gap-8 justify-center sm:justify-start">
              {["Listings", "Reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "border-b-2 border-[#cb6f4d] text-[#cb6f4d]"
                      : "text-[#aaa] hover:text-[#555]"
                  }`}
                >
                  {tab === "Listings"
                    ? `Items Listed (${listings.length})`
                    : `Reviews (${reviews.length})`}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "Listings" && (
            <div>
              {productsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-[#cb6f4d]" />
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {listings.map((product: any) =>
                    isOwner ? (
                      <div
                        key={product.id}
                        className={
                          deletingId === product.id
                            ? "opacity-40 pointer-events-none"
                            : ""
                        }
                      >
                        <OwnerProductCard
                          product={product}
                          onEdit={setEditProduct}
                          onDelete={handleDelete}
                        />
                      </div>
                    ) : (
                      <ProductCard
                        key={product.id}
                        {...product}
                        likes={Number(product.likes || 0)}
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart size={32} className="text-[#e0ddd8] mx-auto mb-4" />
                  <p className="text-[#aaa] text-lg">No items listed yet</p>
                  {isOwner && (
                    <Link href="/SellNow">
                      <button className="mt-4 bg-[#cb6f4d] text-white px-6 py-2.5 rounded-full text-sm font-semibold">
                        + List your first item
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="max-w-3xl">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-2xl p-6 border border-[#e0ddd8] shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
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
                            {review.author?.username || "Anonymous"}
                          </p>
                          <p className="text-xs text-[#aaa]">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-[#cb6f4d]">
                          Verified Purchase
                        </span>
                      </div>
                      <p className="text-[#555] text-sm leading-relaxed">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Star size={32} className="text-[#e0ddd8] mx-auto mb-4" />
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

      {/* Edit modal */}
      {/* {editProduct && (
        <EditModal product={editProduct} onClose={() => setEditProduct(null)} onSaved={handleSaved} />
      )} */}
    </>
  );
};

export default ProfilePage;
