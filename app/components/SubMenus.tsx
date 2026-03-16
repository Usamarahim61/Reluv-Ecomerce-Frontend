"use client";
import { useState } from "react";
import { SubCategoryItem } from "../constants/subCatagories";
import Link from "next/link";

interface SubMenusProps {
  subCategories?: SubCategoryItem[];
  loading?: boolean;
}

export function SubMenus({ subCategories = [], loading = false }: SubMenusProps) {
  const safeSubCategories = Array.isArray(subCategories) ? subCategories : [];
  const [activeCategory, setActiveCategory] = useState<SubCategoryItem | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  const handleCategoryHover = (cat: SubCategoryItem) => {
    setActiveCategory(cat);
    // Default select 2nd child if exists
    if (cat.children && cat.children.length >= 2) {
      setSelectedChild(cat.children[1].label);
    } else if (cat.children && cat.children.length > 0) {
      setSelectedChild(cat.children[0].label);
    } else {
      setSelectedChild(null);
    }
  };

  return (
    <div
      className="relative"
      onMouseLeave={() => {
        setActiveCategory(null);
        setSelectedChild(null);
      }}
      >
      {/* Main Subcategory Row */}
      <div className="flex gap-6 items-center min-h-[44px]">
        {loading &&
          Array.from({ length: 7 }).map((_, index) => (
            <div
              key={`category-skeleton-${index}`}
              className="flex items-center py-2 px-1"
            >
              <span
                className={`ml-2 h-[16px] rounded bg-gray-200/90 animate-pulse ${
                  index % 3 === 0 ? "w-20" : index % 3 === 1 ? "w-24" : "w-16"
                }`}
              />
            </div>
          ))}
        {!loading && safeSubCategories.map((cat) => (
          <div
            key={cat.label}
            className="flex items-center cursor-pointer py-2 px-1 hover:text-[#007782]"
            onMouseEnter={() => handleCategoryHover(cat)}
          >
            <Link
              href={`/Shop?category=${encodeURIComponent(cat.slug || cat.label)}`}
              className="ml-2"
            >
              {cat.label}
            </Link>
          </div>
        ))}
      </div>

      {/* MegaMenu panel */}
      {activeCategory && activeCategory.children && (
        <div className="absolute left-0 top-full w-full bg-white shadow-lg border-t border-gray-200 z-50 py-4 px-6 flex gap-6 h-[320px]">
          
          {/* Children Column */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            {activeCategory.children.map((child) => (
              <div
                key={child.label}
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedChild === child.label
                    ? "bg-gray-100 font-semibold text-[#007782]"
                    : "text-gray-600"
                }`}
                onMouseEnter={() => setSelectedChild(child.label)}
              >
                <span>{child.icon}</span>
                <Link
                  href={`/Shop?category=${encodeURIComponent(activeCategory.slug || activeCategory.label)}&subCategory=${encodeURIComponent(child.slug || child.label)}`}
                >
                  {child.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-[1px] bg-gray-200"></div>

          {/* Items Column */}
          <div className="flex flex-col flex-wrap gap-5">
            {activeCategory.children
              .filter((child) => child.label === selectedChild)
              .flatMap((child) => child.items.map((item, idx) => ({ item, slug: child.itemSlugs?.[idx] })))
              .map(({ item, slug }) => (
                <Link
                  href={`/Shop?category=${encodeURIComponent(activeCategory.slug || activeCategory.label)}&subCategory=${encodeURIComponent(selectedChild || "")}&item=${encodeURIComponent(slug || item)}`}
                  key={item}
                  className="px-3 py-1 cursor-pointer text-gray-700 hover:text-[#007782] hover:font-semibold whitespace-nowrap"
                >
                  {item}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
