import { useState } from "react";

interface SubMenusProps {
  subCategories: SubCategoryItem[];
}

export interface SubCategoryItem {
  label: string;
  icon: string;
  children?: {
    icon: any;
    label: string;
    items: string[];
  }[];
}

export function SubMenus({ subCategories }: SubMenusProps) {
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
      <div className="flex gap-6">
        {subCategories.map((cat) => (
          <div
            key={cat.label}
            className="flex items-center cursor-pointer py-2 px-1 hover:text-[#007782]"
            onMouseEnter={() => handleCategoryHover(cat)}
          >
            <span className="text-lg">{cat.icon}</span>
            <span className="ml-2">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* MegaMenu panel */}
      {activeCategory && activeCategory.children && (
        <div className="absolute left-0 top-full w-full bg-white shadow-lg border-t border-gray-200 z-50 py-4 px-6 flex gap-6">
          
          {/* Children Column */}
          <div className="flex flex-col gap-2 min-w-[180px]">
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
                <span>{child.label}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-[1px] bg-gray-200"></div>

          {/* Items Column */}
          <div className="flex-1 flex flex-wrap gap-2">
            {activeCategory.children
              .filter((child) => child.label === selectedChild)
              .flatMap((child) => child.items)
              .map((item) => (
                <div
                  key={item}
                  className="px-3 py-1 cursor-pointer text-gray-700 hover:text-[#007782] hover:font-semibold whitespace-nowrap"
                >
                  {item}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
