"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDE_FOOTER_PATHS = ["/Messages"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDE_FOOTER_PATHS.some((path) => pathname.startsWith(path))) return null;
  return <Footer />;
}
