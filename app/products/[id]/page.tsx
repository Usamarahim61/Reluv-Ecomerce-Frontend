import { CategoryNode } from "@/lib/categoryUtils";
import ProductDetailClient from "./ProductDetailClient";

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


/* ─── component ───────────────────────────────────────────── */
export default function ProductDetailPage() {
  return <ProductDetailClient />;
}

export async function generateStaticParams() {
  return [];
}
