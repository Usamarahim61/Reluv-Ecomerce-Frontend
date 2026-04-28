import ProductDetailClient from "./ProductDetailClient";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { fetchConversations } from "@/lib/features/messagesSlice";
import { createConversationForProduct } from "@/services/messages-service";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { fetchConversations } from "@/lib/features/messagesSlice";
import { createConversationForProduct } from "@/services/messages-service";

import ImageCarousel from "@/app/components/ImageCarousel";
import ImageZoom from "@/app/components/ImageZoom";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import { API_BASE_URL } from "@/app/constants/api";
import { CATEGORY_TREE_ENDPOINT, CategoryNode } from "@/lib/categoryUtils";
import {
  fetchProductById,
  fetchProductsForHome,
  fetchProductsByUserId,
  fetchFilteredProducts,
  ProductCardItem,
  ProductDetailItem,
} from "@/services/products-service";
import {
  ChevronRight,
  Clock,
  Flag,
  Heart,
  Info,
  MapPin,
  PlusSquare,
  Share2,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/* ─── helpers ─────────────────────────────────────────────── */
const toAbsoluteImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

const toText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

const toRelativeUploadTime = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0)
    return "18 min ago";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "18 min ago";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  return `${Math.floor(diffHours / 24)} d ago`;
};

type BreadcrumbItem = { label: string; slug: string };

const findCategoryPath = (
  nodes: CategoryNode[],
  targetName: string,
): CategoryNode[] | null => {
  for (const node of nodes) {
    if (node.name.toLowerCase() === targetName.toLowerCase()) return [node];
    const childPath = findCategoryPath(node.categories || [], targetName);
    if (childPath) return [node, ...childPath];
  }
  return null;
};

function getPriceValue(priceString: string) {
  const match = priceString.match(/([\d.]+)/);
  return match ? match[1] : null;
}

function getCurrencyCode(priceString: string) {
  const curMatch = priceString.match(/[^\d.\s]+/);
  return curMatch ? curMatch[0] : null; // ← was curMatch[1], which is always undefined
}

/* ─── component ───────────────────────────────────────────── */
export default function ProductDetailPage() {
  return <ProductDetailClient />;
}

export async function generateStaticParams() {
  return [];
}
