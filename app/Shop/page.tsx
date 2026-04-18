'use client';

import Footer from '@/app/components/Footer';
import ProductFeed from '@/app/components/ProductFeed';
import { API_BASE_URL } from '@/app/constants/api';
import { useAndroidNative } from '@/app/components/useAndroidNative';
import {
  fetchFilteredProducts,
  fetchProductFilterOptions,
  ProductCardItem,
  ProductFilterOptions,
} from '@/services/products-service';
import { Bookmark, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ─── constants ───────────────────────────────────────────── */
const defaultFilterOptions: ProductFilterOptions = {
  brand: [],
  size: [],
  condition: [],
  colour: [],
  material: [],
  sortBy: ['Newest', 'Price: Low to high', 'Price: High to low'],
};

const FILTER_DEFAULTS = {
  condition: 'Condition',
  size: 'Size',
  brand: 'Brand',
  colour: 'Colour',
  material: 'Material',
  sortBy: 'Newest',
} as const;

/* ─── types ───────────────────────────────────────────────── */
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

/* ─── pure helpers ────────────────────────────────────────── */
const getLeafCategoryEntries = (
  nodes: CategoryTreeNode[],
  parentPath: CategoryTreeNode[] = [],
): LeafCategoryEntry[] =>
  nodes.flatMap((node) => {
    const currentPath = [...parentPath, node];
    if (!node.categories || node.categories.length === 0) return [{ node, path: currentPath }];
    return getLeafCategoryEntries(node.categories, currentPath);
  });

/* ─── component ───────────────────────────────────────────── */
export default function ShopPage() {
  const { isAndroid } = useAndroidNative();
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const category    = searchParams.get('category')    || '';
  const subCategory = searchParams.get('subCategory') || '';
  const item        = searchParams.get('item')        || '';

  /* product list state */
  const [items,       setItems]       = useState<ProductCardItem[]>([]);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [isLoading,   setIsLoading]   = useState(false);   // initial / filter-change load
  const [loadingMore, setLoadingMore] = useState(false);   // "load more" pagination
  const [loadError,   setLoadError]   = useState<string | null>(null);

  /* filter state */
  const [conditionFilter, setConditionFilter] = useState(FILTER_DEFAULTS.condition);
  const [sizeFilter,      setSizeFilter]      = useState(FILTER_DEFAULTS.size);
  const [brandFilter,     setBrandFilter]     = useState(FILTER_DEFAULTS.brand);
  const [colourFilter,    setColourFilter]    = useState(FILTER_DEFAULTS.colour);
  const [materialFilter,  setMaterialFilter]  = useState(FILTER_DEFAULTS.material);
  const [sortBy,          setSortBy]          = useState(FILTER_DEFAULTS.sortBy);

  /* filter options */
  const [filterOptions,        setFilterOptions]        = useState<ProductFilterOptions>(defaultFilterOptions);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);

  /* category tree — lazy: only fetch when menu first opens */
  const [categoryMenuOpen,    setCategoryMenuOpen]    = useState(false);
  const [categorySearch,      setCategorySearch]      = useState('');
  const [categoryTree,        setCategoryTree]        = useState<CategoryTreeNode[]>([]);
  const [categoryTreeLoading, setCategoryTreeLoading] = useState(false);
  const [categoryTreeError,   setCategoryTreeError]   = useState<string | null>(null);
  const [categoryTreeFetched, setCategoryTreeFetched] = useState(false); // guard: fetch once
  const [activeCategoryPath,  setActiveCategoryPath]  = useState<CategoryTreeNode[]>([]);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  const [showShippingBanner, setShowShippingBanner] = useState(true);

  const pageTitle = item || subCategory || category || 'Shop';

  /* ── load products ── */
  const loadProducts = useCallback(
    async (nextPage: number, replace = false) => {
      if (replace) { setIsLoading(true);   setLoadError(null); }
      else         { setLoadingMore(true); }

      try {
        const data = await fetchFilteredProducts({
          page: nextPage,
          pageSize: 40,
          category,
          subCategory,
          item,
          brand:     brandFilter     === FILTER_DEFAULTS.brand     ? '' : brandFilter,
          size:      sizeFilter      === FILTER_DEFAULTS.size      ? '' : sizeFilter,
          condition: conditionFilter === FILTER_DEFAULTS.condition ? '' : conditionFilter,
          colour:    colourFilter    === FILTER_DEFAULTS.colour    ? '' : colourFilter,
          material:  materialFilter  === FILTER_DEFAULTS.material  ? '' : materialFilter,
          sortBy,
        });

        setHasMore(data.hasMore);
        setPage(nextPage);
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load products.');
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [category, subCategory, item, brandFilter, sizeFilter, conditionFilter, colourFilter, materialFilter, sortBy],
  );

  // re-fetch from page 1 whenever filters/category change
  useEffect(() => {
    loadProducts(1, true);
  }, [loadProducts]);

  /* ── load filter options — runs in parallel with products, not duplicated ── */
  useEffect(() => {
    let isMounted = true;
    setFilterOptionsLoading(true);

    fetchProductFilterOptions({ category, subCategory, item })
      .then((opts)  => { if (isMounted) setFilterOptions(opts); })
      .catch(()     => { if (isMounted) setFilterOptions(defaultFilterOptions); })
      .finally(()   => { if (isMounted) setFilterOptionsLoading(false); });

    return () => { isMounted = false; };
  }, [category, subCategory, item]);

  /* ── load category tree — lazy, only once ── */
  useEffect(() => {
    if (!categoryMenuOpen || categoryTreeFetched) return;
    let isMounted = true;
    setCategoryTreeLoading(true);
    setCategoryTreeError(null);

    fetch(`${API_BASE_URL}/api/categories/catalog-tree`)
      .then((r) => { if (!r.ok) throw new Error('Failed to load categories.'); return r.json(); })
      .then((payload: { data?: CategoryTreeNode[] }) => {
        if (!isMounted) return;
        setCategoryTree(Array.isArray(payload.data) ? payload.data : []);
        setCategoryTreeFetched(true);
      })
      .catch((err) => {
        if (!isMounted) return;
        setCategoryTreeError(err instanceof Error ? err.message : 'Could not load categories.');
        setCategoryTree([]);
      })
      .finally(() => { if (isMounted) setCategoryTreeLoading(false); });

    return () => { isMounted = false; };
  }, [categoryMenuOpen, categoryTreeFetched]);

  /* ── close category menu on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!categoryMenuRef.current?.contains(e.target as Node)) setCategoryMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── derived/memoised ── */
  const currentLevelNodes = useMemo(
    () => activeCategoryPath.length === 0
      ? categoryTree
      : activeCategoryPath[activeCategoryPath.length - 1].categories || [],
    [activeCategoryPath, categoryTree],
  );

  const leafCategoryEntries = useMemo(() => getLeafCategoryEntries(categoryTree), [categoryTree]);

  const filteredLeafEntries = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return [];
    return leafCategoryEntries.filter(({ path }) =>
      path.some((n) => n.name.toLowerCase().includes(search)),
    );
  }, [categorySearch, leafCategoryEntries]);

  const conditionOptions = useMemo(() => [FILTER_DEFAULTS.condition, ...filterOptions.condition], [filterOptions.condition]);
  const sizeOptions      = useMemo(() => [FILTER_DEFAULTS.size,      ...filterOptions.size],      [filterOptions.size]);
  const brandOptions     = useMemo(() => [FILTER_DEFAULTS.brand,     ...filterOptions.brand],     [filterOptions.brand]);
  const colourOptions    = useMemo(() => [FILTER_DEFAULTS.colour,    ...filterOptions.colour],    [filterOptions.colour]);
  const materialOptions  = useMemo(() => [FILTER_DEFAULTS.material,  ...filterOptions.material],  [filterOptions.material]);
  const sortOptions      = useMemo(
    () => filterOptions.sortBy.length > 0 ? filterOptions.sortBy : defaultFilterOptions.sortBy,
    [filterOptions.sortBy],
  );

  const hasActiveFilters =
    conditionFilter !== FILTER_DEFAULTS.condition ||
    sizeFilter      !== FILTER_DEFAULTS.size      ||
    brandFilter     !== FILTER_DEFAULTS.brand     ||
    colourFilter    !== FILTER_DEFAULTS.colour    ||
    materialFilter  !== FILTER_DEFAULTS.material  ||
    !!category || !!subCategory || !!item;

  /* ── category navigation helpers ── */
  const updateCategoryQueryFromPath = (path: CategoryTreeNode[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (path[0]) params.set('category',    path[0].slug || path[0].name); else params.delete('category');
    if (path[1]) params.set('subCategory', path[1].slug || path[1].name); else params.delete('subCategory');
    if (path.length > 2) params.set('item', path[path.length - 1].slug || path[path.length - 1].name);
    else params.delete('item');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryRowClick = (node: CategoryTreeNode) => {
    if (node.categories?.length) { setActiveCategoryPath((prev) => [...prev, node]); return; }
    updateCategoryQueryFromPath([...activeCategoryPath, node]);
    setCategoryMenuOpen(false);
    setCategorySearch('');
  };

  const handleBackLevel         = () => setActiveCategoryPath((prev) => prev.slice(0, -1));
  const resetCategoryNavigation = () => { setActiveCategoryPath([]); setCategorySearch(''); };

  const clearFilters = () => {
    setConditionFilter(FILTER_DEFAULTS.condition);
    setSizeFilter(FILTER_DEFAULTS.size);
    setBrandFilter(FILTER_DEFAULTS.brand);
    setColourFilter(FILTER_DEFAULTS.colour);
    setMaterialFilter(FILTER_DEFAULTS.material);
    setSortBy(FILTER_DEFAULTS.sortBy);
  };

  /* ── style constants ── */
  const pillSelectClass =
    'rounded-full border border-[#c7d0d5] bg-white px-4 py-1.5 text-[14px] text-[#2f2f2f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition hover:border-[#9fb1bb] hover:bg-[#fbfcfc] focus:border-[#007782] focus:ring-2 focus:ring-[#007782]/20 md:text-[16px]';
  const staticPillClass =
    'rounded-full border border-[#c7d0d5] bg-white px-4 py-1.5 text-[14px] text-[#2f2f2f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:text-[16px]';

  /* ─── RENDER ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <main className="mx-auto w-full max-w-[1240px] px-4 pb-10 pt-4">

        {!isAndroid && (
          <>
            {/* breadcrumb */}
            <nav className="mb-1 flex items-center gap-2 text-[12px] text-[#6f6f6f]">
              <Link href="/" className="underline hover:text-[#007782]">Home</Link>
              <ChevronRight size={11} className="text-[#9f9f9f]" />
              <Link href="/Shop" className="underline hover:text-[#007782]">Shop</Link>
              {category    && <><ChevronRight size={11} className="text-[#9f9f9f]" /><span className="underline">{category}</span></>}
              {subCategory && <><ChevronRight size={11} className="text-[#9f9f9f]" /><span className="underline">{subCategory}</span></>}
              {item        && <><ChevronRight size={11} className="text-[#9f9f9f]" /><span className="underline">{item}</span></>}
            </nav>

            {/* page heading */}
            <div className="mb-3 flex items-center justify-between border-b border-[#d9d9d9] pb-5">
              <h1 className="text-[32px] font-semibold leading-none text-[#1d1d1d] md:text-[36px]">{pageTitle}</h1>
              <button className="flex items-center gap-2 rounded-[10px] border border-[#9aa5ab] bg-white px-4 py-2 text-[14px] text-[#2d2d2d] md:text-[16px]">
                <Bookmark size={20} /> Save search
              </button>
            </div>

            {/* filter bar */}
            <section className="mb-4 border-b border-[#d9d9d9] pb-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">

                {/* category dropdown */}
                <div className="relative" ref={categoryMenuRef}>
                  <button
                    type="button"
                    onClick={() => setCategoryMenuOpen((prev) => !prev)}
                    className="rounded-full border border-[#2a9ca4] bg-[#dbf0f1] px-4 py-1.5 text-[14px] text-[#194d52] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-[#cfe8ea] focus:outline-none focus:ring-2 focus:ring-[#007782]/20 md:text-[16px]"
                  >
                    Category <ChevronDown className="ml-1 inline-block" size={18} />
                  </button>

                  {categoryMenuOpen && (
                    <div className="absolute left-0 top-full z-30 mt-2 w-[380px] overflow-hidden rounded-xl border border-[#d5dfe4] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
                      <div className="space-y-3 border-b border-[#e9eef1] bg-[#f8fbfc] p-3">
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Find a category"
                          className="w-full rounded-lg border border-[#d7e1e6] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#8ea0aa] focus:border-[#007782] focus:ring-2 focus:ring-[#007782]/15"
                        />
                        <div className="flex items-center justify-between">
                          {categorySearch ? (
                            <span className="text-sm font-medium text-gray-800">Search results</span>
                          ) : (
                            <>
                              {activeCategoryPath.length > 0 ? (
                                <button type="button" onClick={handleBackLevel} className="inline-flex items-center gap-1 text-[#007782] hover:underline">
                                  <ChevronLeft size={14} /><span className="text-sm">Back</span>
                                </button>
                              ) : <span />}
                              <span className="text-sm font-medium text-gray-800">
                                {activeCategoryPath.length > 0 ? activeCategoryPath[activeCategoryPath.length - 1].name : 'Select category'}
                              </span>
                              {activeCategoryPath.length > 0 ? (
                                <button type="button" onClick={resetCategoryNavigation} className="text-xs text-gray-500 hover:text-gray-700 hover:underline">Reset</button>
                              ) : <span />}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="max-h-72 overflow-y-auto bg-white">
                        {/* loading */}
                        {categoryTreeLoading && (
                          <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-teal-600" />
                          </div>
                        )}

                        {/* error with retry */}
                        {!categoryTreeLoading && categoryTreeError && (
                          <div className="flex flex-col items-center gap-2 px-3 py-5">
                            <p className="text-sm text-red-500">{categoryTreeError}</p>
                            <button
                              type="button"
                              onClick={() => { setCategoryTreeFetched(false); setCategoryTreeError(null); }}
                              className="text-xs text-[#007782] underline"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        {/* search results */}
                        {!categoryTreeLoading && !categoryTreeError && categorySearch && (
                          filteredLeafEntries.length === 0
                            ? <p className="p-3 text-sm text-gray-500">No categories found.</p>
                            : filteredLeafEntries.map(({ node, path }) => (
                                <button
                                  type="button"
                                  key={`${node.id}-${path.map((n) => n.id).join('-')}`}
                                  onClick={() => { updateCategoryQueryFromPath(path); setCategoryMenuOpen(false); setCategorySearch(''); }}
                                  className="w-full border-b border-[#eef2f4] px-3 py-3 text-left transition hover:bg-[#f3f8fa]"
                                >
                                  <div className="text-sm font-medium text-gray-900">{node.name}</div>
                                  <div className="mt-1 text-xs text-gray-500">{path.map((n) => n.name).join(' > ')}</div>
                                </button>
                              ))
                        )}

                        {/* tree navigation */}
                        {!categoryTreeLoading && !categoryTreeError && !categorySearch && (
                          currentLevelNodes.length === 0
                            ? <p className="p-3 text-sm text-gray-500">No categories available.</p>
                            : currentLevelNodes.map((node) => (
                                <button
                                  type="button"
                                  key={node.id}
                                  onClick={() => handleCategoryRowClick(node)}
                                  className="flex w-full items-center justify-between border-b border-[#eef2f4] px-3 py-3 text-left transition hover:bg-[#f3f8fa]"
                                >
                                  <span className="text-gray-900">{node.name}</span>
                                  {node.categories?.length > 0 && <ChevronRight size={14} className="text-gray-500" />}
                                </button>
                              ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* filter selects — show skeleton placeholders while options load */}
                {(
                  [
                    { value: sizeFilter,      onChange: setSizeFilter,      options: sizeOptions      },
                    { value: brandFilter,     onChange: setBrandFilter,     options: brandOptions     },
                    { value: conditionFilter, onChange: setConditionFilter, options: conditionOptions },
                    { value: colourFilter,    onChange: setColourFilter,    options: colourOptions    },
                  ] as const
                ).map(({ value, onChange, options }) => (
                  <select
                    key={value}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={filterOptionsLoading}
                    className={`${pillSelectClass} ${filterOptionsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ))}

                <div className={staticPillClass}>
                  Price <ChevronDown className="ml-1 inline-block" size={18} />
                </div>

                <select
                  value={materialFilter}
                  onChange={(e) => setMaterialFilter(e.target.value)}
                  disabled={filterOptionsLoading}
                  className={`${pillSelectClass} ${filterOptionsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {materialOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={pillSelectClass}
                >
                  {sortOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <button className="rounded-full border border-[#bec7cc] bg-[#e8edee] px-4 py-1.5 text-[14px] text-[#2f2f2f] md:text-[16px]">
                  {pageTitle} <X className="ml-1 inline-block" size={17} />
                </button>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[14px] font-medium text-[#007782] md:text-[16px]">
                    Clear filters
                  </button>
                )}
              </div>
            </section>

            <div className="mb-3 flex items-center justify-between text-[14px] text-[#5f6a6f] md:text-[16px]">
              <span>{items.length}+ results.</span>
              <span className="flex items-center gap-1">Search results <CircleHelp size={18} /></span>
            </div>
          </>
        )}

        {/* shipping banner */}
        {!isAndroid && showShippingBanner && (
          <div className="mb-3 flex items-center justify-between rounded-md border border-[#dedede] bg-white px-4 py-3 text-[14px] text-[#5f6a6f] md:text-[16px]">
            <p>Shipping fees will be added at checkout</p>
            <button onClick={() => setShowShippingBanner(false)}>
              <X size={20} className="text-[#3f3f3f]" />
            </button>
          </div>
        )}

        {/* product feed error with retry */}
        {loadError && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-sm text-red-500">{loadError}</p>
            <button
              onClick={() => loadProducts(1, true)}
              className="rounded-md border border-[#007782] px-4 py-2 text-sm text-[#007782] hover:bg-[#007782] hover:text-white transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* product feed — spinner shown inline inside ProductFeed via isLoading prop */}
        {!loadError && (
          <ProductFeed
            productList={items}
            onLoadMore={() => loadProducts(page + 1)}
            isLoadingMore={loadingMore}
            isLoading={isLoading}
            hasMore={hasMore}
            className="px-0 py-0"
            gridClassName="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
            cardVariant={isAndroid ? 'android' : 'default'}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}