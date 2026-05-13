'use client';

import { useEffect, useState, useRef } from 'react';
import ProductFeed from '@/app/components/ProductFeed';
import { useAuth } from '@/context/AuthContext';
import { getUserFav_Products } from '@/services/auth-service';

async function fetchFavProductsByUserID(userId: string): Promise<any> {
  const data = await getUserFav_Products(Number(userId));
  return Array.isArray(data) ? data : data.fav_products ?? [];
}

export default function FavItems() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedForId = useRef<string | null>(null); // 👈 track last fetched userId

  const load = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFavProductsByUserID(userId);
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userId = String(user?.id);
    if (!user?.id || fetchedForId.current === userId) return; // 👈 skip if already fetched
    fetchedForId.current = userId;
    load(userId);
  }, [user?.id]);

  const handleRetry = () => {
    if (!user?.id) return;
    fetchedForId.current = null; // 👈 reset guard so retry works
    load(String(user.id));
  };

  return (
    <ProductFeed
      productList={products}
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
      hasMore={false}
    />
  );
}