import ProductDetailClient from "./ProductDetailClient";

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}

export async function generateStaticParams() {
  return [];
}
