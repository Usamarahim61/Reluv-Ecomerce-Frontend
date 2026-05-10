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
  searchProducts,
} from '@/services/products-service';
import { Bookmark, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

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
function ShopPageContent() {
  const { isAndroid } = useAndroidNative();
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const category    = searchParams.get('category')    || '';
  const subCategory = searchParams.get('subCategory') || '';
  const item        = searchParams.get('item')        || '';
  const searchQuery = searchParams.get('search')      || '';

  /* product list state */
  const [items,       setItems]       = useState<ProductCardItem[]>([]);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [isLoading,   setIsLoading]   = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError,   setLoadError]   = useState<string | null>(null);

  /* filter state */
  const [conditionFilter, setConditionFilter] = useState<string>(FILTER_DEFAULTS.condition);
  const [sizeFilter,      setSizeFilter]      = useState<string>(FILTER_DEFAULTS.size);
  const [brandFilter,     setBrandFilter]     = useState<string>(FILTER_DEFAULTS.brand);
  const [colourFilter,    setColourFilter]    = useState<string>(FILTER_DEFAULTS.colour);
  const [materialFilter,  setMaterialFilter]  = useState<string>(FILTER_DEFAULTS.material);
  const [sortBy,          setSortBy]          = useState<string>(FILTER_DEFAULTS.sortBy);
  const [sortMenuOpen,    setSortMenuOpen]    = useState(false);
  const [filtersOpen,     setFiltersOpen]     = useState(false);
  const [minPrice,        setMinPrice]        = useState<number | null>(null);
  const [maxPrice,        setMaxPrice]        = useState<number | null>(null);
  const [priceMinInput,   setPriceMinInput]   = useState('');
  const [priceMaxInput,   setPriceMaxInput]   = useState('');
  const [priceError,      setPriceError]      = useState<string | null>(null);

  /* filter options */
  const [filterOptions,        setFilterOptions]        = useState<ProductFilterOptions>(defaultFilterOptions);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);

  /* category tree */
  const [categoryMenuOpen,    setCategoryMenuOpen]    = useState(false);
  const [categorySearch,      setCategorySearch]      = useState('');
  const [categoryTree,        setCategoryTree]        = useState<CategoryTreeNode[]>([]);
  const [categoryTreeLoading, setCategoryTreeLoading] = useState(false);
  const [categoryTreeError,   setCategoryTreeError]   = useState<string | null>(null);
  const [categoryTreeFetched, setCategoryTreeFetched] = useState(false);
  const [activeCategoryPath,  setActiveCategoryPath]  = useState<CategoryTreeNode[]>([]);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const sortMenuRef     = useRef<HTMLDivElement | null>(null);

  const [showShippingBanner, setShowShippingBanner] = useState(true);

  const pageTitle = searchQuery ? `Search: ${searchQuery}` : item || subCategory || category || 'Browse All';

  /* ── load products ── */
  const loadProducts = useCallback(
    async (nextPage: number, replace = false) => {
      if (replace) { setIsLoading(true);   setLoadError(null); }
      else         { setLoadingMore(true); }

      try {
        const data = searchQuery.trim()
          ? await searchProducts(searchQuery, 20)
          : await fetchFilteredProducts({
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
              minPrice,
              maxPrice,
            });

        setHasMore(searchQuery.trim() ? false : data.hasMore);
        setPage(nextPage);
        setItems((prev) => (replace || searchQuery.trim() ? data.items : [...prev, ...data.items]));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load products.');
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [category, subCategory, item, searchQuery, brandFilter, sizeFilter, conditionFilter, colourFilter, materialFilter, sortBy, minPrice, maxPrice],
  );

  useEffect(() => { loadProducts(1, true); }, [loadProducts]);

  useEffect(() => {
    let isMounted = true;
    setFilterOptionsLoading(true);
    fetchProductFilterOptions({ category, subCategory, item })
      .then((opts)  => { if (isMounted) setFilterOptions(opts); })
      .catch(()     => { if (isMounted) setFilterOptions(defaultFilterOptions); })
      .finally(()   => { if (isMounted) setFilterOptionsLoading(false); });
    return () => { isMounted = false; };
  }, [category, subCategory, item]);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!categoryMenuRef.current?.contains(e.target as Node)) setCategoryMenuOpen(false);
      if (!sortMenuRef.current?.contains(e.target as Node)) setSortMenuOpen(false);
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
    minPrice !== null || maxPrice !== null ||
    !!searchQuery || !!category || !!subCategory || !!item;

  const activeFilterCount = [
    conditionFilter !== FILTER_DEFAULTS.condition,
    sizeFilter      !== FILTER_DEFAULTS.size,
    brandFilter     !== FILTER_DEFAULTS.brand,
    colourFilter    !== FILTER_DEFAULTS.colour,
    materialFilter  !== FILTER_DEFAULTS.material,
    minPrice !== null || maxPrice !== null,
  ].filter(Boolean).length;

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
    setMinPrice(null);
    setMaxPrice(null);
    setPriceMinInput('');
    setPriceMaxInput('');
    setPriceError(null);
  };

  const handleApplyPrice = () => {
    setPriceError(null);
    const minRaw = priceMinInput.trim();
    const maxRaw = priceMaxInput.trim();
    const minParsed = minRaw === '' ? null : Number(minRaw);
    const maxParsed = maxRaw === '' ? null : Number(maxRaw);
    if ((minParsed != null && (!Number.isFinite(minParsed) || minParsed < 0)) ||
        (maxParsed != null && (!Number.isFinite(maxParsed) || maxParsed < 0))) {
      setPriceError('Please enter valid prices.'); return;
    }
    if (minParsed != null && maxParsed != null && minParsed > maxParsed) {
      setPriceError('Min price cannot be greater than max price.'); return;
    }
    setMinPrice(minParsed);
    setMaxPrice(maxParsed);
  };

  const handleClearPrice = () => {
    setMinPrice(null); setMaxPrice(null);
    setPriceMinInput(''); setPriceMaxInput('');
    setPriceError(null);
  };

  const priceLabel = useMemo(() => {
    if (minPrice == null && maxPrice == null) return 'Price';
    if (minPrice != null && maxPrice != null) return `${minPrice} – ${maxPrice}`;
    if (minPrice != null) return `≥ ${minPrice}`;
    return `≤ ${maxPrice}`;
  }, [minPrice, maxPrice]);

  /* ─── chip helper ─────────────────────────────────────── */
  const Chip = ({
    label,
    active,
    onClick,
  }: { label: string; active?: boolean; onClick?: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`
        whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150
        ${active
          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
          : 'border-[#d4d4d4] bg-white text-[#333] hover:border-[#aaa]'}
      `}
    >
      {label}
    </button>
  );

  /* ─── RENDER ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f0ede8]">
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6">

        {!isAndroid && (
          <>
            {/* breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-[#888]">
              <Link href="/" className="hover:text-[#333]">Home</Link>
              <ChevronRight size={10} />
              <Link href="/Shop" className="hover:text-[#333]">Shop</Link>
              {category    && <><ChevronRight size={10} /><span>{category}</span></>}
              {subCategory && <><ChevronRight size={10} /><span>{subCategory}</span></>}
              {item        && <><ChevronRight size={10} /><span>{item}</span></>}
            </nav>

            {/* page heading row */}
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h1 className="font-serif text-[40px] font-normal leading-tight text-[#1a1a1a] md:text-[48px]">
                  {pageTitle}
                </h1>
                <p className="mt-1 text-sm text-[#888]">{items.length}+ items found</p>
              </div>
              {/* <button className="flex items-center gap-2 rounded-full border border-[#d4d4d4] bg-white px-5 py-2 text-sm text-[#333] transition hover:border-[#aaa]">
                <Bookmark size={16} /> Save search
              </button> */}
            </div>

            {/* top bar: search + controls */}
            <div className="mb-3 flex items-center gap-3">
              {/* search input */}
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  readOnly
                  placeholder="Search by name or brand..."
                  className="w-full rounded-full border border-[#d4d4d4] bg-white py-2.5 pl-10 pr-4 text-sm text-[#333] placeholder:text-[#aaa] outline-none focus:border-[#333]"
                />
              </div>

              {/* Filters toggle button */}
              <button
                type="button"
                onClick={() => setFiltersOpen((p) => !p)}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200
                  ${filtersOpen || activeFilterCount > 0
                    ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                    : 'border-[#d4d4d4] bg-white text-[#333] hover:border-[#aaa]'}`}
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#1a1a1a]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort dropdown */}
              <div className="relative" ref={sortMenuRef}>
                <button
                  type="button"
                  onClick={() => setSortMenuOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-full border border-[#d4d4d4] bg-white px-5 py-2.5 text-sm text-[#333] transition hover:border-[#aaa]"
                >
                  {sortBy} <ChevronDown size={15} className={`transition-transform duration-200 ${sortMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortMenuOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 min-w-[180px] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setSortBy(opt); setSortMenuOpen(false); }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-[#f7f5f2]
                          ${sortBy === opt ? 'font-semibold text-[#1a1a1a]' : 'text-[#555]'}`}
                      >
                        {opt}
                        {sortBy === opt && (
                          <span className="ml-2 h-2 w-2 rounded-full bg-[#1a1a1a]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Slide-down filter panel ── */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${filtersOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="mb-4 rounded-2xl border border-[#e0ddd8] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">

                {/* Category row */}
                <div className="mb-5" ref={categoryMenuRef}>
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-[#aaa]">Category</p>
                  <div className="relative">
                    {/* Quick category chips from tree top level, lazy load */}
                    <div className="flex flex-wrap gap-2">
                      {!categoryTreeFetched && (
                        <button
                          type="button"
                          onClick={() => { setCategoryMenuOpen(true); }}
                          className="rounded-full border border-dashed border-[#ccc] px-4 py-1.5 text-sm text-[#aaa] transition hover:border-[#999]"
                        >
                          Browse categories…
                        </button>
                      )}

                      {categoryTreeFetched && categoryTree.map((node) => {
                        const isActive = category === (node.slug || node.name);
                        return (
                          <Chip
                            key={node.id}
                            label={node.name}
                            active={isActive}
                            onClick={() => {
                              if (isActive) {
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete('category'); params.delete('subCategory'); params.delete('item');
                                router.push(`${pathname}?${params.toString()}`);
                              } else {
                                updateCategoryQueryFromPath([node]);
                              }
                            }}
                          />
                        );
                      })}

                      {/* More / browse button */}
                      <button
                        type="button"
                        onClick={() => { setCategoryMenuOpen((p) => !p); if (!categoryTreeFetched) {} }}
                        className="flex items-center gap-1 rounded-full border border-dashed border-[#ccc] px-4 py-1.5 text-sm text-[#777] transition hover:border-[#999]"
                      >
                        More <ChevronDown size={14} className={`transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Category tree dropdown */}
                    {categoryMenuOpen && (
                      <div className="absolute left-0 top-full z-30 mt-2 w-[380px] overflow-hidden rounded-2xl border border-[#e0ddd8] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
                        <div className="border-b border-[#f0ede8] bg-[#faf9f7] p-3 space-y-2">
                          <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            placeholder="Find a category…"
                            className="w-full rounded-xl border border-[#e0ddd8] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#bbb] focus:border-[#333]"
                          />
                          <div className="flex items-center justify-between">
                            {categorySearch ? (
                              <span className="text-sm font-medium text-[#333]">Search results</span>
                            ) : (
                              <>
                                {activeCategoryPath.length > 0 ? (
                                  <button type="button" onClick={handleBackLevel} className="inline-flex items-center gap-1 text-sm text-[#555] hover:text-[#111]">
                                    <ChevronLeft size={13} /> Back
                                  </button>
                                ) : <span />}
                                <span className="text-sm font-medium text-[#333]">
                                  {activeCategoryPath.length > 0 ? activeCategoryPath[activeCategoryPath.length - 1].name : 'All categories'}
                                </span>
                                {activeCategoryPath.length > 0 ? (
                                  <button type="button" onClick={resetCategoryNavigation} className="text-xs text-[#aaa] hover:text-[#555]">Reset</button>
                                ) : <span />}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {categoryTreeLoading && (
                            <div className="flex items-center justify-center py-6">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a1a1a] border-t-transparent" />
                            </div>
                          )}
                          {!categoryTreeLoading && categoryTreeError && (
                            <div className="flex flex-col items-center gap-2 px-3 py-5">
                              <p className="text-sm text-red-500">{categoryTreeError}</p>
                              <button type="button" onClick={() => { setCategoryTreeFetched(false); setCategoryTreeError(null); }} className="text-xs text-[#555] underline">Retry</button>
                            </div>
                          )}
                          {!categoryTreeLoading && !categoryTreeError && categorySearch && (
                            filteredLeafEntries.length === 0
                              ? <p className="p-3 text-sm text-[#aaa]">No categories found.</p>
                              : filteredLeafEntries.map(({ node, path }) => (
                                  <button type="button" key={`${node.id}-${path.map((n) => n.id).join('-')}`}
                                    onClick={() => { updateCategoryQueryFromPath(path); setCategoryMenuOpen(false); setCategorySearch(''); }}
                                    className="w-full border-b border-[#f5f3f0] px-3 py-2.5 text-left transition hover:bg-[#faf9f7]"
                                  >
                                    <div className="text-sm font-medium text-[#1a1a1a]">{node.name}</div>
                                    <div className="mt-0.5 text-xs text-[#aaa]">{path.map((n) => n.name).join(' › ')}</div>
                                  </button>
                                ))
                          )}
                          {!categoryTreeLoading && !categoryTreeError && !categorySearch && (
                            currentLevelNodes.length === 0
                              ? <p className="p-3 text-sm text-[#aaa]">No categories available.</p>
                              : currentLevelNodes.map((node) => (
                                  <button type="button" key={node.id} onClick={() => handleCategoryRowClick(node)}
                                    className="flex w-full items-center justify-between border-b border-[#f5f3f0] px-3 py-2.5 text-left transition hover:bg-[#faf9f7]"
                                  >
                                    <span className="text-sm text-[#1a1a1a]">{node.name}</span>
                                    {node.categories?.length > 0 && <ChevronRight size={13} className="text-[#aaa]" />}
                                  </button>
                                ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Condition row */}
                <div className="mb-5">
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-[#aaa]">Condition</p>
                  <div className="flex flex-wrap gap-2">
                    {conditionOptions.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        active={conditionFilter === opt && opt !== FILTER_DEFAULTS.condition}
                        onClick={() => setConditionFilter(opt === conditionFilter ? FILTER_DEFAULTS.condition : opt)}
                      />
                    ))}
                  </div>
                </div>

                {/* Size row */}
                <div className="mb-5">
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-[#aaa]">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {filterOptionsLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-8 w-14 animate-pulse rounded-full bg-[#ece9e4]" />
                        ))
                      : sizeOptions.map((opt) => (
                          <Chip
                            key={opt}
                            label={opt}
                            active={sizeFilter === opt && opt !== FILTER_DEFAULTS.size}
                            onClick={() => setSizeFilter(opt === sizeFilter ? FILTER_DEFAULTS.size : opt)}
                          />
                        ))
                    }
                  </div>
                </div>

                {/* Brand + Colour + Material row */}
                <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                  {[
                    { label: 'Brand',    value: brandFilter,    def: FILTER_DEFAULTS.brand,    opts: brandOptions,    set: setBrandFilter    },
                    { label: 'Colour',   value: colourFilter,   def: FILTER_DEFAULTS.colour,   opts: colourOptions,   set: setColourFilter   },
                    { label: 'Material', value: materialFilter, def: FILTER_DEFAULTS.material, opts: materialOptions, set: setMaterialFilter },
                  ].map(({ label, value, def, opts, set }) => (
                    <div key={label}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#aaa]">{label}</p>
                      <select
                        value={value}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => set(e.target.value)}
                        disabled={filterOptionsLoading}
                        className="w-full rounded-xl border border-[#d4d4d4] bg-white px-3 py-2 text-sm text-[#333] outline-none transition focus:border-[#333] disabled:opacity-50"
                      >
                        {opts.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Price row */}
                <div className="mb-5">
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-[#aaa]">Price range</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <input
                      type="number" min="0" step="0.01"
                      value={priceMinInput}
                      onChange={(e) => setPriceMinInput(e.target.value)}
                      placeholder="Min"
                      className="w-28 rounded-xl border border-[#d4d4d4] bg-white px-3 py-2 text-sm outline-none focus:border-[#333]"
                    />
                    <span className="pb-2 text-sm text-[#aaa]">–</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={priceMaxInput}
                      onChange={(e) => setPriceMaxInput(e.target.value)}
                      placeholder="Max"
                      className="w-28 rounded-xl border border-[#d4d4d4] bg-white px-3 py-2 text-sm outline-none focus:border-[#333]"
                    />
                    <button
                      type="button" onClick={handleApplyPrice}
                      className="rounded-xl bg-[#1a1a1a] px-5 py-2 text-sm text-white transition hover:bg-[#333]"
                    >
                      Apply
                    </button>
                    {(minPrice != null || maxPrice != null) && (
                      <button type="button" onClick={handleClearPrice} className="text-sm text-[#aaa] underline hover:text-[#555]">
                        Clear
                      </button>
                    )}
                    {priceError && <p className="w-full text-xs text-red-500">{priceError}</p>}
                  </div>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between border-t border-[#f0ede8] pt-4">
                  {hasActiveFilters ? (
                    <button onClick={clearFilters} className="rounded-xl bg-white px-6 py-2 text-sm font-medium text-black transition hover:bg-[#d1cece]">
                      Clear all filters
                    </button>
                    
                  ) : <span />}
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-xl bg-[#1a1a1a] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#333]"
                  >
                    Show results
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips strip */}
            {hasActiveFilters && !filtersOpen && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-3xl border border-[#e8e4dc] bg-white/90 px-3 py-3 shadow-sm shadow-[#b7b0a214]">
                <div className="flex flex-wrap items-center gap-2">
                  {category && (
                    <button
                      type="button"
                      onClick={() => {
                        const p = new URLSearchParams(searchParams.toString());
                        p.delete('category');
                        p.delete('subCategory');
                        p.delete('item');
                        router.push(`${pathname}?${p.toString()}`);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333]"
                    >
                      {category}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-white group-hover:text-[#1a1a1a]">
                        <X size={11} />
                      </span>
                    </button>
                  )}
                  {subCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        const p = new URLSearchParams(searchParams.toString());
                        p.delete('subCategory');
                        p.delete('item');
                        router.push(`${pathname}?${p.toString()}`);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333]"
                    >
                      {subCategory}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#1a1a1a]">
                        <X size={11} />
                      </span>
                    </button>
                  )}
                  {conditionFilter !== FILTER_DEFAULTS.condition && (
                    <button
                      type="button"
                      onClick={() => setConditionFilter(FILTER_DEFAULTS.condition)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333]"
                    >
                      {conditionFilter}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#1a1a1a]">
                        <X size={11} />
                      </span>
                    </button>
                  )}
                  {sizeFilter !== FILTER_DEFAULTS.size && (
                    <button
                      type="button"
                      onClick={() => setSizeFilter(FILTER_DEFAULTS.size)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333]"
                    >
                      {sizeFilter}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#1a1a1a]">
                        <X size={11} />
                      </span>
                    </button>
                  )}
                  {brandFilter !== FILTER_DEFAULTS.brand && (
                    <button
                      type="button"
                      onClick={() => setBrandFilter(FILTER_DEFAULTS.brand)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333]"
                    >
                      {brandFilter}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#1a1a1a]">
                        <X size={11} />
                      </span>
                    </button>
                  )}
                  {colourFilter !== FILTER_DEFAULTS.colour && (
                    <button
                      type="button"
                      onClick={() => setColourFilter(FILTER_DEFAULTS.colour)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333]"
                    >
                      {colourFilter}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#1a1a1a]">
                        <X size={11} />
                      </span>
                    </button>
                  )}
                  {materialFilter !== FILTER_DEFAULTS.material && (
                    <button
                      type="button"
                      onClick={() => setMaterialFilter(FILTER_DEFAULTS.material)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333]"
                    >
                      {materialFilter}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#1a1a1a]">
                        <X size={11} />
                      </span>
                    </button>
                  )}
                  {(minPrice != null || maxPrice != null) && (
                    <button
                      type="button"
                      onClick={handleClearPrice}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333]"
                    >
                      {priceLabel}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#1a1a1a]">
                        <X size={11} />
                      </span>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full flex align-middle bg-[#f8f6f1] px-4 py-2 text-xs font-semibold text-[#444] transition hover:bg-[#e9e6dd] hover:text-[#111]"
                >
                                        <span className="inline-flex me-1 items-center justify-center text-black transition hover:text-[#1a1a1a]">
                        <X size={13} />
                      </span>
                  Clear all
                </button>
              </div>
            )}

            {/* results count + help */}
            {!filtersOpen && (
              <div className="mb-4 flex items-center justify-between text-sm text-[#888]">
                <span>{items.length}+ results</span>
                <span className="flex items-center gap-1">Search results <CircleHelp size={15} /></span>
              </div>
            )}
          </>
        )}

        {/* shipping banner */}
        {!isAndroid && showShippingBanner && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#e0ddd8] bg-white px-4 py-3 text-sm text-[#777]">
            <p>Shipping fees will be added at checkout</p>
            <button onClick={() => setShowShippingBanner(false)}>
              <X size={18} className="text-[#aaa] hover:text-[#555]" />
            </button>
          </div>
        )}

        {/* error */}
        {loadError && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-sm text-red-500">{loadError}</p>
            <button
              onClick={() => loadProducts(1, true)}
              className="rounded-xl border border-[#1a1a1a] px-5 py-2 text-sm text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* product feed */}
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

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1280px] px-4 py-10 text-center text-sm text-[#aaa]">
          Loading shop…
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
