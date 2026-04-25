"use client";
import { useState, useRef, useEffect, useMemo, ChangeEvent, JSX } from "react";
import { Plus, Camera, X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../constants/api";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCatalogTree } from "@/lib/features/categoriesSlice";
import { CategoryNode } from "@/lib/categoryUtils";
import { useAuth } from "@/context/AuthContext";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_MB = 10;

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

type UploadImage = {
  file: File;
  previewUrl: string;
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

export default function UploadItem(): JSX.Element {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const categoryTree = useAppSelector((state) => state.categories.tree);
  const categoryStatus = useAppSelector((state) => state.categories.status);
  const categoryError = useAppSelector((state) => state.categories.error);
  const categoryLoading = categoryStatus === "idle" || categoryStatus === "loading";
  const [images, setImages] = useState<UploadImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [activeCategoryPath, setActiveCategoryPath] = useState<CategoryNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicFieldsLoading, setDynamicFieldsLoading] = useState<boolean>(false);
  const [dynamicFieldsError, setDynamicFieldsError] = useState<string | null>(null);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<UploadImage[]>([]);

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

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/categories/upload-attributes?category_id=${selectedCategory.id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load fields: ${response.status}`);
        }

        const payload = await response.json();

        const apiAttributes = payload.attributes || [];

        // Deduplicate by code
        const uniqueAttrMap = new Map<string, any>();
        for (const attr of apiAttributes) {
          const key = attr.code || attr.id;
          if (!uniqueAttrMap.has(key)) {
            uniqueAttrMap.set(key, attr);
          }
        }

        const loadedFields: DynamicField[] = Array.from(uniqueAttrMap.values()).map((attr: any) => {
          const config = attr.configuration || {};

          let fieldOptions: DynamicFieldOption[] = [];

          if (attr.rawOptions && Array.isArray(attr.rawOptions)) {
            fieldOptions = attr.rawOptions.map((opt: any) => ({
              label: opt.title || String(opt.id),
              value: String(opt.value || opt.id),
            }));
          } else if (config.options && Array.isArray(config.options) && config.options.length > 0) {
            const group = config.options[0];
            if (group && group.options && Array.isArray(group.options)) {
              fieldOptions = group.options.map((opt: any) => ({
                label: opt.title || String(opt.id),
                value: String(opt.id),
              }));
            }
          }

          let fieldType: DynamicField["type"] = "text";
          if (
            config.field_type === "select" ||
            attr.field_type === "select" ||
            config.display_type === "list" ||
            fieldOptions.length > 0
          ) {
            fieldType = "select";
          } else if (attr.rawType === "number" || config.display_type === "number") {
            fieldType = "number";
          }

          return {
            key: attr.code || String(attr.id),
            label: config.title || attr.code || "Field",
            type: fieldType,
            required: config.required || false,
            placeholder: config.placeholder || config.field_placeholder,
            options: fieldOptions,
          };
        });

        if (!isMounted) return;

        if (loadedFields.length > 0) {
          setDynamicFields(loadedFields);
          setDynamicFieldValues({});
          setDynamicFieldsLoading(false);

          const dropdownCodes = Array.from(
            new Set(
              loadedFields
                .filter((field) => {
                  const code = field.key.toLowerCase();
                  const needsDropdownByType = field.type === "select" && (field.options?.length ?? 0) === 0;
                  const needsDropdownByCode = (code === "brand" || code === "size") && (field.options?.length ?? 0) === 0;
                  return needsDropdownByType || needsDropdownByCode;
                })
                .map((field) => field.key.toLowerCase())
            )
          );

          if (dropdownCodes.length > 0) {
            const dropdownResponses = await Promise.all(
              dropdownCodes.map(async (code) => {
                try {
                  const dropdownRes = await fetch(
                    `${API_BASE_URL}/api/item-upload/dropdown?category_id=${selectedCategory.id}&code=${encodeURIComponent(code)}`
                  );
                  if (!dropdownRes.ok) return [code, []] as const;
                  const dropdownPayload = await dropdownRes.json();
                  const options = Array.isArray(dropdownPayload?.options)
                    ? dropdownPayload.options
                        .map((option: any) => ({
                          label: String(option.title || option.value || "").trim(),
                          value: String(option.value ?? option.id ?? ""),
                        }))
                        .filter((option: DynamicFieldOption) => option.label && option.value)
                    : [];
                  return [code, options] as const;
                } catch {
                  return [code, []] as const;
                }
              })
            );

            if (!isMounted) return;

            const optionsByCode = new Map<string, DynamicFieldOption[]>(dropdownResponses);
            setDynamicFields((prev) =>
              prev.map((field) => {
                const code = field.key.toLowerCase();
                const fetchedOptions = optionsByCode.get(code) || [];
                if (fetchedOptions.length === 0) return field;
                return {
                  ...field,
                  type: "select",
                  options: fetchedOptions,
                };
              })
            );
          }
        } else {
          setDynamicFields([]);
          setDynamicFieldsError(null);
          setDynamicFieldsLoading(false);
        }
      } catch (error) {
        if (!isMounted) return;
        setDynamicFields([]);
        setDynamicFieldsError(error instanceof Error ? error.message : "Failed to load fields");
        setDynamicFieldsLoading(false);
      }
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

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
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
    if (!search) return [];
    return leafCategoryEntries.filter(({ path }) =>
      path.some((node) => node.name.toLowerCase().includes(search))
    );
  }, [categorySearch, leafCategoryEntries]);

  const handleUploadClick = () => {
    if (images.length >= MAX_IMAGES) {
      toast.warn(`You can only upload up to ${MAX_IMAGES} photos.`);
      return;
    }
    fileInputRef.current?.click();
  };

  // FIX: enforce 6-image limit and 10MB per-file size limit
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.warn(`You can only upload up to ${MAX_IMAGES} photos.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.warn(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit and was skipped.`);
        continue;
      }
      validFiles.push(file);
    }

    const filesToAdd = validFiles.slice(0, remaining);

    if (validFiles.length > remaining) {
      toast.warn(`Only ${remaining} more photo(s) can be added. Extra files were skipped.`);
    }

    if (filesToAdd.length > 0) {
      const newImages = filesToAdd.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const toRemove = prev[index];
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
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

  const currentLevelTitle =
    activeCategoryPath.length > 0
      ? activeCategoryPath[activeCategoryPath.length - 1].name
      : "Select a category";

  const handleCreateProduct = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!selectedCategory) {
      setSubmitError("Please select a category.");
      return;
    }

    // FIX: validate price is a valid number before submitting
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setSubmitError("Please enter a valid price.");
      return;
    }

    setSubmitLoading(true);

    try {
      let imageIds: number[] = [];
      if (images.length > 0) {
        const uploadForm = new FormData();
        for (const image of images) {
          uploadForm.append("files", image.file);
        }

        const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: uploadForm,
        });

        const uploadPayload = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(
            uploadPayload?.error?.message || `Failed to upload images: ${uploadResponse.status}`
          );
        }

        imageIds = Array.isArray(uploadPayload)
          ? uploadPayload
              .map((item: any) => Number(item?.id))
              .filter((id: number) => Number.isInteger(id) && id > 0)
          : [];
      }

      // FIX: send price as a number, strip empty dynamic field values
      const cleanedDynamicValues = Object.fromEntries(
        Object.entries(dynamicFieldValues).filter(([_, v]) => v !== "" && v !== undefined && v !== null)
      );

      const response = await fetch(`${API_BASE_URL}/api/products/sell-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price: parsedPrice,           // ← number, not string
          categoryId: selectedCategory.id,
          dynamicValues: cleanedDynamicValues, // ← no empty strings
          imageIds,
          userId: user?.id,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.error?.message || payload?.message || `Failed to create product: ${response.status}`
        );
      }

      toast.success("Product created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTitle("");
      setDescription("");
      setPrice("");
      setDynamicFieldValues({});
      setImages((prev) => {
        for (const image of prev) URL.revokeObjectURL(image.previewUrl);
        return [];
      });
      setSelectedCategory(null);
      setActiveCategoryPath([]);
      setCategoryMenuOpen(false);
      setCategorySearch("");
      setDynamicFields([]);
      setSubmitSuccess(null);
      setSubmitError(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
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
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                    <img src={image.previewUrl} alt={`Upload ${index}`} className="object-cover w-full h-full" />
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

            {/* FIX: show count, disable when at limit */}
            <button
              onClick={handleUploadClick}
              disabled={images.length >= MAX_IMAGES}
              className="flex items-center gap-2 px-6 py-2 border border-[#007782] text-[#007782] rounded-md font-semibold hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>Upload photos ({images.length}/{MAX_IMAGES})</span>
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
          <div className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6">
            <label className="font-semibold text-gray-900 min-w-[150px]">Title</label>
            <input
              type="text"
              placeholder="Tell buyers what you're selling"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="flex-1 focus:outline-none text-gray-800 placeholder-gray-300"
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <label className="font-semibold text-gray-900 min-w-[150px]">Describe your item</label>
            <textarea
              placeholder="Tell buyers more about it"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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

                  {!categoryLoading && !categoryError && categorySearch &&
                    filteredLeafEntries.map(({ node, path }) => (
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

                  {!categoryLoading && !categoryError && !categorySearch &&
                    currentLevelNodes.map((node) => {
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
                                selectedCategory?.id === node.id ? "border-[#007782]" : "border-gray-400"
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

            {!dynamicFieldsLoading &&
              !dynamicFieldsError &&
              dynamicFields.map((field) => (
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
              <span className="text-gray-900">THB</span>
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

        {/* <div className="bg-white border border-gray-200 rounded-sm p-6 flex justify-between items-center">
          <span className="text-gray-600">What do you think of our upload process?</span>
          <button className="px-4 py-2 border border-[#007782] text-[#007782] rounded-md text-sm font-semibold hover:bg-teal-50">
            Give feedback
          </button>
        </div> */}

        {submitError && <div className="text-sm text-red-600">{submitError}</div>}
        {submitSuccess && <div className="text-sm text-green-700">{submitSuccess}</div>}

        <div className="flex justify-end gap-3 pt-6">
          {/* <button className="px-6 py-2 border border-[#007782] text-[#007782] rounded-md font-semibold hover:bg-teal-50">
            Save draft
          </button> */}
          <button
            type="button"
            onClick={handleCreateProduct}
            disabled={submitLoading}
            className="px-8 py-2 bg-[#007782] text-white rounded-md font-semibold hover:bg-[#005f68] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </>
  );
}