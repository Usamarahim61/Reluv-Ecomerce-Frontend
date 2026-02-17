"use client";
import { useState, useRef, useEffect, useMemo, ChangeEvent, JSX } from "react";
import { Plus, Camera, X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react";
import Navbar from "../components/navbar";
import { API_BASE_URL } from "../constants/api";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCatalogTree } from "@/lib/features/categoriesSlice";
import { CategoryNode } from "@/lib/categoryUtils";

type LeafCategoryEntry = {
  node: CategoryNode;
  path: CategoryNode[];
};

type DynamicFieldOption = {
  label: string;
  value: string;
};

type DynamicField = {
  key: string;
  label: string;
  type: "select" | "text" | "number";
  required: boolean;
  placeholder?: string;
  unit?: string;
  options?: DynamicFieldOption[];
};

const getLeafCategoryEntries = (nodes: CategoryNode[], parentPath: CategoryNode[] = []): LeafCategoryEntry[] => {
  return nodes.flatMap((node) => {
    const currentPath = [...parentPath, node];
    if (!node.categories || node.categories.length === 0) {
      return [{ node, path: currentPath }];
    }
    return getLeafCategoryEntries(node.categories, currentPath);
  });
};

const toOptions = (rawOptions: unknown): DynamicFieldOption[] => {
  if (!Array.isArray(rawOptions)) {
    return [];
  }

  return rawOptions
    .map((option) => {
      if (typeof option === "string" || typeof option === "number") {
        return { label: String(option), value: String(option) };
      }

      if (option && typeof option === "object") {
        const asObject = option as Record<string, unknown>;
        const value = asObject.value ?? asObject.id ?? asObject.slug ?? asObject.name;
        const label = asObject.label ?? asObject.name ?? asObject.value ?? asObject.slug;
        if (value != null && label != null) {
          return { label: String(label), value: String(value) };
        }
      }

      return null;
    })
    .filter((option): option is DynamicFieldOption => option !== null);
};

const normalizeDynamicFields = (payload: unknown): DynamicField[] => {
  let sourceList: unknown[] = [];

  if (Array.isArray(payload)) {
    sourceList = payload;
  } else if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    const data = root.data;

    if (Array.isArray(data)) {
      sourceList = data;
    } else if (data && typeof data === "object") {
      const dataObject = data as Record<string, unknown>;
      if (Array.isArray(dataObject.fields)) {
        sourceList = dataObject.fields;
      } else if (Array.isArray(dataObject.attributes)) {
        sourceList = dataObject.attributes;
      }
    }
  }

  return sourceList
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      const rawType = String(raw.type ?? raw.fieldType ?? raw.inputType ?? "").toLowerCase();
      const options = toOptions(raw.options ?? raw.values ?? raw.choices);

      let type: DynamicField["type"] = "text";
      if (rawType.includes("number")) {
        type = "number";
      } else if (rawType.includes("select") || options.length > 0) {
        type = "select";
      }

      const key = String(raw.key ?? raw.slug ?? raw.name ?? raw.documentId ?? raw.id ?? `field_${index}`);
      const label = String(raw.label ?? raw.name ?? raw.title ?? `Field ${index + 1}`);

      return {
        key,
        label,
        type,
        required: Boolean(raw.required),
        placeholder: raw.placeholder ? String(raw.placeholder) : undefined,
        unit: raw.unit ? String(raw.unit) : undefined,
        options,
      };
    })
    .filter((field): field is DynamicField => field !== null);
};

export default function UploadItem(): JSX.Element {
  const dispatch = useAppDispatch();
  const categoryTree = useAppSelector((state) => state.categories.tree);
  const categoryStatus = useAppSelector((state) => state.categories.status);
  const categoryError = useAppSelector((state) => state.categories.error);
  const categoryLoading = categoryStatus === "idle" || categoryStatus === "loading";
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useState<string>("");

  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [activeCategoryPath, setActiveCategoryPath] = useState<CategoryNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicFieldsLoading, setDynamicFieldsLoading] = useState<boolean>(false);
  const [dynamicFieldsError, setDynamicFieldsError] = useState<string | null>(null);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoryStatus === "idle") {
      dispatch(fetchCatalogTree());
    }
  }, [categoryStatus, dispatch]);

  useEffect(() => {
    let isMounted = true;

    const fetchFields = async () => {
      if (!selectedCategory) {
        setDynamicFields([]);
        setDynamicFieldsError(null);
        setDynamicFieldValues({});
        setDynamicFieldsLoading(false);
        return;
      }

      setDynamicFieldsLoading(true);
      setDynamicFieldsError(null);

      const endpoints = [
        `${API_BASE_URL}/api/categories/${selectedCategory.id}/attributes`,
        `${API_BASE_URL}/api/categories/${selectedCategory.id}/fields`,
        `${API_BASE_URL}/api/category-attributes?categoryId=${selectedCategory.id}`,
        `${API_BASE_URL}/api/category-fields?categoryId=${selectedCategory.id}`,
      ];

      let loadedFields: DynamicField[] = [];
      let lastError = "No field schema returned from backend";

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) {
            lastError = `Failed to load fields: ${response.status}`;
            continue;
          }

          const payload = await response.json();
          const normalized = normalizeDynamicFields(payload);

          if (normalized.length > 0) {
            loadedFields = normalized;
            break;
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : "Failed to load fields";
        }
      }

      if (!isMounted) {
        return;
      }

      if (loadedFields.length > 0) {
        setDynamicFields(loadedFields);
        setDynamicFieldValues({});
      } else {
        setDynamicFields([]);
        setDynamicFieldsError(lastError);
      }

      setDynamicFieldsLoading(false);
    };

    fetchFields();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const currentLevelNodes = useMemo(() => {
    if (activeCategoryPath.length === 0) {
      return categoryTree;
    }
    return activeCategoryPath[activeCategoryPath.length - 1].categories || [];
  }, [activeCategoryPath, categoryTree]);

  const leafCategoryEntries = useMemo(() => getLeafCategoryEntries(categoryTree), [categoryTree]);

  const filteredLeafEntries = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) {
      return [];
    }
    return leafCategoryEntries.filter(({ path }) =>
      path.some((node) => node.name.toLowerCase().includes(search))
    );
  }, [categorySearch, leafCategoryEntries]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryRowClick = (node: CategoryNode) => {
    if (node.categories && node.categories.length > 0) {
      setActiveCategoryPath((prev) => [...prev, node]);
      return;
    }

    setSelectedCategory(node);
    setCategoryMenuOpen(false);
    setCategorySearch("");
  };

  const handleBackLevel = () => {
    setActiveCategoryPath((prev) => prev.slice(0, -1));
  };

  const resetCategoryNavigation = () => {
    setActiveCategoryPath([]);
    setCategorySearch("");
  };

  const currentLevelTitle = activeCategoryPath.length > 0
    ? activeCategoryPath[activeCategoryPath.length - 1].name
    : "Select a category";

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 space-y-4 bg-white min-h-screen pb-20">
        <div className="bg-white border border-gray-200 rounded-sm p-6 border-dashed border-2 min-h-[250px]">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center justify-center py-6">
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full">
                {images.map((src, index) => (
                  <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                    <img src={src} alt={`Upload ${index}`} className="object-cover w-full h-full" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-6 py-2 border border-[#007782] text-[#007782] rounded-md font-semibold hover:bg-teal-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Upload photos</span>
            </button>
          </div>

          <div className="mt-4 w-full bg-[#f0f9f9] border border-[#d0f0f0] rounded-md p-3 flex items-center gap-3">
            <div className="p-1 bg-white rounded border border-[#b0e0e0]">
              <Camera className="w-5 h-5 text-[#007782]" />
            </div>
            <p className="text-sm text-gray-700">
              Catch your buyers' eye - use quality photos.{" "}
              <a href="#" className="text-[#007782] underline font-medium">
                Learn how
              </a>
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 space-y-8">
          <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-gray-100 pb-6">
            <label className="font-semibold text-gray-900 min-w-[150px]">Title</label>
            <input
              type="text"
              placeholder="Tell buyers what you're selling"
              className="flex-1 focus:outline-none text-gray-800 placeholder-gray-300"
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <label className="font-semibold text-gray-900 min-w-[150px]">Describe your item</label>
            <textarea
              placeholder="Tell buyers more about it"
              rows={4}
              className="flex-1 focus:outline-none text-gray-800 placeholder-gray-300 resize-none"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col md:flex-row justify-between gap-4 relative">
          <label className="font-semibold text-gray-900 min-w-[150px] w-full md:w-auto">Category</label>
          <div className="flex-1 w-full relative" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => setCategoryMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between border-b border-gray-100 py-1 text-left"
            >
              <span className="text-gray-800">
                {selectedCategory ? selectedCategory.name : "Select a category"}
              </span>
              {categoryMenuOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {selectedCategory && (
              <input type="hidden" name="categorySlug" value={selectedCategory.slug} />
            )}

            {categoryMenuOpen && (
              <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="p-3 border-b border-gray-100 space-y-3">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder="Find a category"
                    className="w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none"
                  />

                  <div className="flex items-center justify-between">
                    {categorySearch ? (
                      <span className="text-sm font-medium text-gray-800">Search results</span>
                    ) : (
                      <>
                        {activeCategoryPath.length > 0 ? (
                          <button
                            type="button"
                            onClick={handleBackLevel}
                            className="inline-flex items-center gap-1 text-[#007782]"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                          </button>
                        ) : (
                          <span />
                        )}
                        <span className="text-sm font-medium text-gray-800">{currentLevelTitle}</span>
                        {activeCategoryPath.length > 0 ? (
                          <button
                            type="button"
                            onClick={resetCategoryNavigation}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Reset
                          </button>
                        ) : (
                          <span />
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {categoryLoading && <p className="p-3 text-sm text-gray-500">Loading categories...</p>}

                  {!categoryLoading && categoryError && (
                    <p className="p-3 text-sm text-red-500">{categoryError}</p>
                  )}

                  {!categoryLoading && !categoryError && categorySearch && filteredLeafEntries.length === 0 && (
                    <p className="p-3 text-sm text-gray-500">No categories found.</p>
                  )}

                  {!categoryLoading && !categoryError && !categorySearch && currentLevelNodes.length === 0 && (
                    <p className="p-3 text-sm text-gray-500">No categories available.</p>
                  )}

                  {!categoryLoading && !categoryError && categorySearch && filteredLeafEntries.map(({ node, path }) => (
                    <button
                      type="button"
                      key={`${node.id}-${path.map((item) => item.id).join("-")}`}
                      onClick={() => {
                        setSelectedCategory(node);
                        setCategoryMenuOpen(false);
                        setCategorySearch("");
                      }}
                      className="w-full px-3 py-3 border-b border-gray-100 text-left hover:bg-gray-50"
                    >
                      <div className="text-sm font-medium text-gray-900">{node.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {path.map((item) => item.name).join(" > ")}
                      </div>
                    </button>
                  ))}

                  {!categoryLoading && !categoryError && !categorySearch && currentLevelNodes.map((node) => {
                    const hasChildren = node.categories && node.categories.length > 0;
                    return (
                      <button
                        type="button"
                        key={node.id}
                        onClick={() => handleCategoryRowClick(node)}
                        className="w-full px-3 py-3 border-b border-gray-100 text-left hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="text-gray-900">{node.name}</span>
                        {hasChildren ? (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : (
                          <span
                            className={`h-7 w-7 rounded-full border-2 flex items-center justify-center ${
                              selectedCategory?.id === node.id
                                ? "border-[#007782]"
                                : "border-gray-400"
                            }`}
                          >
                            {selectedCategory?.id === node.id && (
                              <span className="h-3.5 w-3.5 rounded-full bg-[#007782]" />
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedCategory && (
          <div className="bg-white border border-gray-200 rounded-sm">
            {dynamicFieldsLoading && (
              <div className="p-6 text-sm text-gray-500">Loading category details...</div>
            )}

            {!dynamicFieldsLoading && dynamicFieldsError && (
              <div className="p-6 text-sm text-red-500">{dynamicFieldsError}</div>
            )}

            {!dynamicFieldsLoading && !dynamicFieldsError && dynamicFields.length === 0 && (
              <div className="p-6 text-sm text-gray-500">No additional details for this category.</div>
            )}

            {!dynamicFieldsLoading && !dynamicFieldsError && dynamicFields.map((field) => (
              <div
                key={field.key}
                className="p-6 border-b border-gray-100 last:border-b-0 flex flex-col md:flex-row gap-4 justify-between"
              >
                <label className="font-semibold text-gray-900 min-w-[150px]">
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                <div className="flex-1">
                  {field.type === "select" ? (
                    <select
                      name={field.key}
                      value={dynamicFieldValues[field.key] || ""}
                      onChange={(event) =>
                        setDynamicFieldValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      className="w-full border-b border-gray-100 py-1 focus:outline-none text-gray-800 bg-transparent"
                    >
                      <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center border-b border-gray-100 py-1">
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        name={field.key}
                        value={dynamicFieldValues[field.key] || ""}
                        onChange={(event) =>
                          setDynamicFieldValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                        }
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        className="w-full focus:outline-none text-gray-800 placeholder-gray-300"
                      />
                      {field.unit && <span className="text-gray-500 ml-2">{field.unit}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <label className="font-semibold text-gray-900 min-w-[150px] w-full md:w-auto">Price</label>
          <div className="flex-1 w-full">
            <div className="flex items-center border-b border-gray-100 py-1">
              <span className="text-gray-900">EUR</span>
              <input
                type="text"
                placeholder="0.00"
                className="w-full ml-1 focus:outline-none text-gray-800 placeholder-gray-300"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 flex justify-between items-center">
          <span className="text-gray-600">What do you think of our upload process?</span>
          <button className="px-4 py-2 border border-[#007782] text-[#007782] rounded-md text-sm font-semibold hover:bg-teal-50">
            Give feedback
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button className="px-6 py-2 border border-[#007782] text-[#007782] rounded-md font-semibold hover:bg-teal-50">
            Save draft
          </button>
          <button className="px-8 py-2 bg-[#007782] text-white rounded-md font-semibold hover:bg-[#005f68]">
            Upload
          </button>
        </div>
      </div>
    </>
  );
}
