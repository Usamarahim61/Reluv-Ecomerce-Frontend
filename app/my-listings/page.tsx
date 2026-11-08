"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Tag,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/app/components/ProductCard";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import {
  ProductCardItem,
  fetchProductsByUserId,
  relistProduct,
} from "@/services/products-service";

export default function MyListingsPage() {
  const { user, authReady } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "sold">("all");

  // Relisting states
  const [relistConfirmItem, setRelistConfirmItem] = useState<ProductCardItem | null>(null);
  const [relistingId, setRelistingId] = useState<string | null>(null);

  const loadListings = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        // Pass includeAll = true to fetch active and sold products, matching mobile
        const products = await fetchProductsByUserId(user.id, true);
        setListings(products);
      } catch (err: any) {
        setError(err?.message || "Failed to load listings");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (user?.id) {
      loadListings();
    } else if (authReady) {
      setLoading(false);
    }
  }, [user?.id, authReady, loadListings]);

  // Handle relist action
  const confirmRelist = async () => {
    if (!relistConfirmItem || !user?.id) return;

    const targetItem = relistConfirmItem;
    setRelistingId(String(targetItem.id));

    try {
      await relistProduct(targetItem.id, user.id);
      await loadListings(true);
      toast.success(
        `"${targetItem.title || targetItem.brand || "Item"}" has been relisted and is now available to buyers.`
      );
      setRelistConfirmItem(null);
    } catch (err: any) {
      toast.error(err?.message || "Could not relist item. Please try again.");
    } finally {
      setRelistingId(null);
    }
  };

  // Filter listings based on active tab
  const filteredListings = useMemo(() => {
    if (activeTab === "active") {
      return listings.filter((item) => item.productStatus !== "sold");
    }
    if (activeTab === "sold") {
      return listings.filter((item) => item.productStatus === "sold");
    }
    return listings;
  }, [listings, activeTab]);

  const activeCount = useMemo(
    () => listings.filter((item) => item.productStatus !== "sold").length,
    [listings]
  );
  const soldCount = useMemo(
    () => listings.filter((item) => item.productStatus === "sold").length,
    [listings]
  );

  return (
    <div className="min-h-screen bg-[#faf9f7] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link href="/" className="hover:text-[#cb6f4d] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-900">My Listings</span>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#cb6f4d] transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e5e1db] mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
              My Listings{" "}
              <span className="text-[#cb6f4d] text-xl sm:text-2xl font-bold">
                ({listings.length})
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage, monitor, and relist items you have listed on Reluv.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadListings(true)}
              disabled={refreshing || loading}
              className="p-2.5 rounded-full border border-gray-300 hover:border-[#cb6f4d] hover:text-[#cb6f4d] text-gray-600 transition-colors bg-white shadow-xs disabled:opacity-50"
              title="Refresh listings"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin text-[#cb6f4d]" : ""}
              />
            </button>

            <Link href="/SellNow">
              <button
                type="button"
                className="bg-[#cb6f4d] hover:bg-[#b85f3d] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Plus size={16} />
                <span>List an item</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "all"
                ? "bg-[#cb6f4d] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "active"
                ? "bg-[#cb6f4d] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sold")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "sold"
                ? "bg-[#cb6f4d] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Sold ({soldCount})
          </button>
        </div>

        {/* Content Section */}
        {!user && authReady ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto mt-8">
            <Package size={52} className="text-[#cb6f4d] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Sign in to view your listings
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              You need to be logged into your account to access and manage your listings.
            </p>
            <Link href="/auth/login">
              <button
                type="button"
                className="bg-[#cb6f4d] hover:bg-[#b85f3d] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
              >
                Sign in
              </button>
            </Link>
          </div>
        ) : loading && listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={36} className="animate-spin text-[#cb6f4d]" />
            <p className="text-sm font-medium text-gray-500">
              Loading your listings...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-red-100 shadow-sm max-w-lg mx-auto">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Could not load listings
            </h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              type="button"
              onClick={() => loadListings()}
              className="bg-[#cb6f4d] hover:bg-[#b85f3d] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 md:p-16 text-center border border-gray-200 shadow-sm max-w-xl mx-auto my-8">
            <div className="w-20 h-20 bg-[#fff5f0] text-[#cb6f4d] rounded-full flex items-center justify-center mx-auto mb-5">
              <Package size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === "sold"
                ? "No sold listings yet"
                : activeTab === "active"
                ? "No active listings yet"
                : "No listings yet"}
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              {activeTab === "sold"
                ? "Items you sell will appear here with the option to relist them anytime."
                : "Declutter your wardrobe and start selling your luxury fashion items on Reluv today."}
            </p>
            <Link href="/SellNow">
              <button
                type="button"
                className="bg-[#cb6f4d] hover:bg-[#b85f3d] text-white px-7 py-3 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <Plus size={16} />
                <span>List now</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredListings.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                documentId={item.documentId}
                brand={item.brand}
                title={item.title}
                size={item.size}
                condition={item.condition}
                price={item.price}
                totalPrice={item.totalPrice}
                imageUrl={item.imageUrl}
                likes={item.likes}
                isVerifiedLuxury={item.isVerifiedLuxury}
                productStatus={item.productStatus}
                actionLabel={item.productStatus === "sold" ? "Relist item" : undefined}
                onAction={
                  item.productStatus === "sold"
                    ? () => setRelistConfirmItem(item)
                    : undefined
                }
                actionLoading={relistingId === String(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Relist Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(relistConfirmItem)}
        onClose={() => setRelistConfirmItem(null)}
        onConfirm={confirmRelist}
        title="Relist this item?"
        message={
          relistConfirmItem ? (
            <span>
              This will make{" "}
              <strong className="text-gray-900 font-bold">
                "{relistConfirmItem.title || relistConfirmItem.brand || "this item"}"
              </strong>{" "}
              available to buyers again at its listed price.
            </span>
          ) : null
        }
        confirmText="Relist"
        variant="primary"
        loading={Boolean(relistingId)}
        icon={<Tag size={20} />}
      />
    </div>
  );
}
