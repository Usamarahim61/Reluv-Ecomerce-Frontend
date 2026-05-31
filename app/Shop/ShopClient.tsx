"use client";

import Footer from "@/app/components/Footer";
import ProductFeed from "@/app/components/ProductFeed";
import { API_BASE_URL } from "@/app/constants/api";
import {
  fetchFilteredProducts,
  fetchProductFilterOptions,
  ProductCardItem,
  ProductFilterOptions,
} from "@/services/products-service";
import { Bookmark, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const defaultFilterOptions: ProductFilterOptions = {
  brand: [],
  size: [],
  condition: [],
  colour: [],
  material: [],
  sortBy: ["Newest", "Price: Low to high", "Price: High to low"],
};

type CategoryTreeNode = {
  id: number;
  name: string;
  slug: string;
  categories: CategoryTreeNode[];
};

type LeafCategoryEntry = {
  node: CategoryTreeNode;
  path: CategoryTreeNode[];
};

const getLeafCategoryEntries = (
  nodes: CategoryTreeNode[],
  parentPath: CategoryTreeNode[] = [],
): LeafCategoryEntry[] =>
  nodes.flatMap((node) => {
    const currentPath = [...parentPath, node];
    if (!node.categories || node.categories.length === 0) {
      return [{ node, path: currentPath }];
    }
    return getLeafCategoryEntries(node.categories, currentPath);
  });

export default function ShopClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";
  const subCategory = searchParams.get("subCategory") || "";
  const item = searchParams.get("item") || "";

  const [items, setItems] = useState<ProductCardItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [conditionFilter, setConditionFilter] = useState("Condition");
  const [sizeFilter, setSizeFilter] = useState("Size");
  const [brandFilter, setBrandFilter] = useState("Brand");
  const [colourFilter, setColourFilter] = useState("Colour");
  const [materialFilter, setMaterialFilter] = useState("Material");
  const [sortBy, setSortBy] = useState("Newest");
  const [showShippingBanner, setShowShippingBanner] = useState(true);
  const [backendFilterOptions, setBackendFilterOptions] =
    useState<ProductFilterOptions>(defaultFilterOptions);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [categoryTreeLoading, setCategoryTreeLoading] = useState(false);
  const [activeCategoryPath, setActiveCategoryPath] = useState<CategoryTreeNode[]>([]);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  const pageTitle = item || subCategory || category || "Shop";

  const loadProducts = useCallback(
    async (nextPage: number, replace = false) => {
      try {
        if (replace) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const data = await fetchFilteredProducts({
          page: nextPage,
          pageSize: 40,
          category,
          subCategory,
          item,
          brand: brandFilter === "Brand" ? "" : brandFilter,
          size: sizeFilter === "Size" ? "" : sizeFilter,
          condition: conditionFilter === "Condition" ? "" : conditionFilter,
          colour: colourFilter === "Colour" ? "" : colourFilter,
          material: materialFilter === "Material" ? "" : materialFilter,
          sortBy,
        });

        setHasMore(data.hasMore);
        setPage(nextPage);
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, subCategory, item, brandFilter, sizeFilter, conditionFilter, colourFilter, materialFilter, sortBy],
  );

  useEffect(() => {
    loadProducts(1, true);
  }, [loadProducts]);

  useEffect(() => {
    let isMounted = true;
    const loadOptions = async () => {
      try {
        const options = await fetchProductFilterOptions({ category, subCategory, item });
        if (!isMounted) return;
        setBackendFilterOptions(options);
      } catch {
        if (!isMounted) return;
        setBackendFilterOptions(defaultFilterOptions);
      }
    };
    loadOptions();
    return () => { isMounted = false; };
  }, [category, subCategory, item]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => { document.removeEventListener("mousedown", onDocumentClick); };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadCategoryTree = async () => {
      try {
        setCategoryTreeLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/categories/catalog-tree`);
        if (!response.ok) throw new Error("Failed to load category tree");
        const payload = (await response.json()) as { data?: CategoryTreeNode[] };
        if (!isMounted) return;
        setCategoryTree(Array.isArray(payload.data) ? payload.data : []);
      } catch {
        if (!isMounted) return;
        setCategoryTree([]);
      } finally {
        if (!isMounted) return;
        setCategoryTreeLoading(false);
      }
    };
    loadCategoryTree();
    return () => { isMounted = false; };
  }, []);

  const currentLevelNodes = useMemo(() => {
    if (activeCategoryPath.length === 0) return categoryTree;
    return activeCategoryPath[activeCategoryPath.length - 1].categories || [];
  }, [activeCategoryPath, categoryTree]);

  const leafCategoryEntries = useMemo(() => getLeafCategoryEntries(categoryTree), [categoryTree]);
  const filteredLeafEntries = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return [];
    return leafCategoryEntries.filter(({ path }) =>
      path.some((node) => node.name.toLowerCase().includes(search)),
    );
  }, [categorySearch, leafCategoryEntries]);

  const updateCategoryQueryFromPath = (path: CategoryTreeNode[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (path[0]) params.set("category", path[0].slug || path[0].name);
    else params.delete("category");
    if (path[1]) params.set("subCategory", path[1].slug || path[1].name);
    else params.delete("subCategory");
    if (path.length > 2) params.set("item", path[path.length - 1].slug || path[path.length - 1].name);
    else params.delete("item");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryRowClick = (node: CategoryTreeNode) => {
    if (node.categories && node.categories.length > 0) {
      setActiveCategoryPath((prev) => [...prev, node]);
      return;
    }
    const selectedPath = [...activeCategoryPath, node];
    updateCategoryQueryFromPath(selectedPath);
    setCategoryMenuOpen(false);
    setCategorySearch("");
  };

  const handleBackLevel = () => setActiveCategoryPath((prev) => prev.slice(0, -1));
  const resetCategoryNavigation = () => {
    setActiveCategoryPath([]);
    setCategorySearch("");
  };

  const clearAllFilters = () => {
    setConditionFilter("Condition");
    setSizeFilter("Size");
    setBrandFilter("Brand");
    setColourFilter("Colour");
    setMaterialFilter("Material");
    setSortBy("Newest");
  };

  const conditionOptions = useMemo(() => ["Condition", ...backendFilterOptions.condition], [backendFilterOptions.condition]);
  const sizeOptions = useMemo(() => ["Size", ...backendFilterOptions.size], [backendFilterOptions.size]);
  const brandOptions = useMemo(() => ["Brand", ...backendFilterOptions.brand], [backendFilterOptions.brand]);
  const colourOptions = useMemo(() => ["Colour", ...backendFilterOptions.colour], [backendFilterOptions.colour]);
  const materialOptions = useMemo(() => ["Material", ...backendFilterOptions.material], [backendFilterOptions.material]);
  const sortOptions = useMemo(
    () => (backendFilterOptions.sortBy.length > 0 ? backendFilterOptions.sortBy : defaultFilterOptions.sortBy),
    [backendFilterOptions.sortBy],
  );

  const hasActiveFilters =
    conditionFilter !== "Condition" ||
    sizeFilter !== "Size" ||
    brandFilter !== "Brand" ||
    colourFilter !== "Colour" ||
    materialFilter !== "Material" ||
    !!category ||
    !!subCategory ||
    !!item;

  const pillSelectClass =
    "rounded-full border border-[#c7d0d5] bg-white px-4 py-1.5 text-[14px] text-[#2f2f2f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition hover:border-[#9fb1bb] hover:bg-[#fbfcfc] focus:border-[#cb6f4d] focus:ring-2 focus:ring-[#cb6f4d]/20 md:text-[16px]";
  const staticPillClass =
    "rounded-full border border-[#c7d0d5] bg-white px-4 py-1.5 text-[14px] text-[#2f2f2f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:text-[16px]";

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <main className="mx-auto w-full max-w-[1240px] px-4 pb-10 pt-4">
        <nav className="mb-1 flex items-center gap-2 text-[12px] text-[#6f6f6f]">
          <Link href="/" className="underline hover:text-[#cb6f4d]">Home</Link>
          <ChevronRight size={11} className="text-[#9f9f9f]" />
          <Link href="/Shop" className="underline hover:text-[#cb6f4d]">Shop</Link>
          {category ? (
            <>
              <ChevronRight size={11} className="text-[#9f9f9f]" />
              <span className="underline">{category}</span>
            </>
          ) : null}
          {subCategory ? (
            <>
              <ChevronRight size={11} className="text-[#9f9f9f]" />
              <span className="underline">{subCategory}</span>
            </>
          ) : null}
          {item ? (
            <>
              <ChevronRight size={11} className="text-[#9f9f9f]" />
              <span className="underline">{item}</span>
            </>
          ) : null}
        </nav>

        <div className="mb-3 flex items-center justify-between border-b border-[#d9d9d9] pb-5">
          <h1 className="text-[32px] font-semibold leading-none text-[#1d1d1d] md:text-[36px]">{pageTitle}</h1>
          <button className="flex items-center gap-2 rounded-[10px] border border-[#9aa5ab] bg-white px-4 py-2 text-[14px] text-[#2d2d2d] md:text-[16px]">
            <Bookmark size={20} />
            Save search
          </button>
        </div>

        <section className="mb-4 border-b border-[#d9d9d9] pb-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((prev) => !prev)}
                className="rounded-full border border-[#2a9ca4] bg-[#dbf0f1] px-4 py-1.5 text-[14px] text-[#194d52] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-[#cfe8ea] focus:outline-none focus:ring-2 focus:ring-[#cb6f4d]/20 md:text-[16px]"
              >
                Category <ChevronDown className="ml-1 inline-block" size={18} />
              </button>

              {categoryMenuOpen ? (
                <div className="absolute left-0 top-full z-30 mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#d5dfe4] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
                  <div className="space-y-3 border-b border-[#e9eef1] bg-[#f8fbfc] p-3">
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(event) => setCategorySearch(event.target.value)}
                      placeholder="Find a category"
                      className="w-full rounded-lg border border-[#d7e1e6] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#8ea0aa] focus:border-[#cb6f4d] focus:ring-2 focus:ring-[#cb6f4d]/15"
                    />
                    <div className="flex items-center justify-between">
                      {categorySearch ? (
                        <span className="text-sm font-medium text-gray-800">Search results</span>
                      ) : (
                        <>
                          {activeCategoryPath.length > 0 ? (
                            <button type="button" onClick={handleBackLevel} className="inline-flex items-center gap-1 text-[#cb6f4d] hover:underline">
                              <ChevronLeft size={14} />
                              <span className="text-sm">Back</span>
                            </button>
                          ) : (
                            <span />
                          )}
                          <span className="text-sm font-medium text-gray-800">
                            {activeCategoryPath.length > 0 ? activeCategoryPath[activeCategoryPath.length - 1].name : "Select category"}
                          </span>
                          {activeCategoryPath.length > 0 ? (
                            <button type="button" onClick={resetCategoryNavigation} className="text-xs text-gray-500 hover:text-gray-700 hover:underline">
                              Reset
                            </button>
                          ) : (
                            <span />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto bg-white">
                    {categoryTreeLoading ? <p className="p-3 text-sm text-gray-500">Loading categories...</p> : null}
                    {!categoryTreeLoading && categorySearch && filteredLeafEntries.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">No categories found.</p>
                    ) : null}
                    {!categoryTreeLoading && !categorySearch && currentLevelNodes.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">No categories available.</p>
                    ) : null}

                    {!categoryTreeLoading && categorySearch
                      ? filteredLeafEntries.map(({ node, path }) => (
                          <button
                            type="button"
                            key={`${node.id}-${path.map((itemNode) => itemNode.id).join("-")}`}
                            onClick={() => {
                              updateCategoryQueryFromPath(path);
                              setCategoryMenuOpen(false);
                              setCategorySearch("");
                            }}
                            className="w-full border-b border-[#eef2f4] px-3 py-3 text-left transition hover:bg-[#f3f8fa]"
                          >
                            <div className="text-sm font-medium text-gray-900">{node.name}</div>
                            <div className="mt-1 text-xs text-gray-500">{path.map((itemNode) => itemNode.name).join(" > ")}</div>
                          </button>
                        ))
                      : null}

                    {!categoryTreeLoading && !categorySearch
                      ? currentLevelNodes.map((node) => (
                          <button
                            type="button"
                            key={node.id}
                            onClick={() => handleCategoryRowClick(node)}
                            className="flex w-full items-center justify-between border-b border-[#eef2f4] px-3 py-3 text-left transition hover:bg-[#f3f8fa]"
                          >
                            <span className="text-gray-900">{node.name}</span>
                            {node.categories && node.categories.length > 0 ? (
                              <ChevronRight size={14} className="text-gray-500" />
                            ) : null}
                          </button>
                        ))
                      : null}
                  </div>
                </div>
              ) : null}
            </div>

            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className={pillSelectClass}>
              {sizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className={pillSelectClass}>
              {brandOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className={pillSelectClass}>
              {conditionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={colourFilter} onChange={(e) => setColourFilter(e.target.value)} className={pillSelectClass}>
              {colourOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <div className={staticPillClass}>
              Price <ChevronDown className="ml-1 inline-block" size={18} />
            </div>
            <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} className={pillSelectClass}>
              {materialOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={pillSelectClass}>
              {sortOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button className="rounded-full border border-[#bec7cc] bg-[#e8edee] px-4 py-1.5 text-[14px] text-[#2f2f2f] md:text-[16px]">
              {pageTitle} <X className="ml-1 inline-block" size={17} />
            </button>
            {hasActiveFilters ? (
              <button onClick={clearAllFilters} className="text-[14px] font-medium text-[#cb6f4d] md:text-[16px]">
                Clear filters
              </button>
            ) : null}
          </div>
        </section>

        <div className="mb-3 flex items-center justify-between text-[14px] text-[#5f6a6f] md:text-[16px]">
          <span>{items.length}+ results.</span>
          <span className="flex items-center gap-1">
            Search results <CircleHelp size={18} />
          </span>
        </div>

        {showShippingBanner ? (
          <div className="mb-3 flex items-center justify-between rounded-md border border-[#dedede] bg-white px-4 py-3 text-[14px] text-[#5f6a6f] md:text-[16px]">
            <p>Shipping fees will be added at checkout</p>
            <button onClick={() => setShowShippingBanner(false)}>
              <X size={20} className="text-[#3f3f3f]" />
            </button>
          </div>
        ) : null}

        {/* ProductFeed handles loading / error / empty / products internally */}
        <ProductFeed
          productList={items}
          onLoadMore={() => loadProducts(page + 1)}
          isLoadingMore={loadingMore}
          isLoading={loading}
          hasMore={hasMore}
          error={error}
          onRetry={() => loadProducts(1, true)}
          className="px-0 py-0"
          gridClassName="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
        />
      </main>

      <Footer />
    </div>
  );
}