"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts } from "@/lib/features/productsSlice";
import Footer from "../components/Footer";
import ProductFeed from "../components/ProductFeed";
import FooterV2 from "../components/FooterV2";
import { useAuth } from "@/context/AuthContext";

export default function BrowseProductsPage() {
  const dispatch = useAppDispatch();
  const pageSize = 20;
     const { user, requireLogin } = useAuth();
  const products = useAppSelector((state) => state.products.items);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);
  const page = useAppSelector((state) => state.products.page);
  const hasMore = useAppSelector((state) => state.products.hasMore);

  const isLoading = status === "loading";
  const isLoadingMore = status === "loading" && products.length > 0;

  useEffect(() => {
      const timer = setTimeout(() => {
    dispatch(fetchProducts({ page: 1, pageSize, userId: user?.id }));
  }, 1000);
  return () => clearTimeout(timer);
  }, [dispatch]);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
      const timer = setTimeout(() => {
    dispatch(fetchProducts({ page: page + 1, pageSize, userId: user?.id }));
  }, 1000);

  return () => clearTimeout(timer);

  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        <ProductFeed
          productList={products}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
          isLoading={isLoading}
          hasMore={hasMore}
          error={error}
        />
      </main>
      <FooterV2 />
    </div>
  );
}