"use client";
import { useEffect, useMemo, useRef, useState, ChangeEvent, JSX } from "react";
import { Plus, Camera, X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../constants/api";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCatalogTree } from "@/lib/features/categoriesSlice";
import { CategoryNode } from "@/lib/categoryUtils";
import { useAiListingAnalysis } from "@/lib/hooks/useAiListingAnalysis";
import { fetchFilteredProducts, type ProductCardItem } from "@/services/products-service";
import ProductCard from "@/app/components/ProductCard";
import type { ApplyTarget, ResolvedField, ResolvedTextField } from "@/lib/ai/types";
import { useAuth } from "@/context/AuthContext";
import SearchableSelectSellItem from "../components/SearchableSelectSellItem";
import ColorPalette from "../components/ColorPalette";
import AiAnalysisProgress from "../components/AiListingAssistant/AiAnalysisProgress";
import AiSuggestionsPanel from "../components/AiListingAssistant/AiSuggestionsPanel";
import LuxuryVerificationNotice from "../components/AiListingAssistant/LuxuryVerificationNotice";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_MB = 10;

const isColorField = (field: Pick<DynamicField, "key" | "label">) => {
  const key = field.key.trim().toLowerCase();
  const label = field.label.trim().toLowerCase();
  return key === "color" || key === "colour" || label === "color" || label === "colour";
};

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

/* ---------------- UTILITIES ---------------- */

const renameFile = (file: File): File => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split(".").pop();
  const newName = `item_${timestamp}_${random}.${ext}`;
  return new File([file], newName, { type: file.type });
};

const getLeafCategoryEntries = (
  nodes: CategoryNode[],
  parentPath: CategoryNode[] = []
): LeafCategoryEntry[] => {
  return nodes.flatMap((node) => {
    const currentPath = [...parentPath, node];
    if (!node.categories || node.categories.length === 0) {
      return [{ node, path: currentPath }];
    }
    return getLeafCategoryEntries(node.categories, currentPath);
  });
};

export default function UploadItem(): JSX.Element {
  const { user, authReady, requireLogin } = useAuth();
  const dispatch = useAppDispatch();
  const categoryTree = useAppSelector((state) => state.categories.tree);
  const categoryStatus = useAppSelector((state) => state.categories.status);
  const categoryError = useAppSelector((state) => state.categories.error);
  const categoryLoading = categoryStatus === "idle" || categoryStatus === "loading";

  const hasFetchedCategories = useRef(false); // ← guard

  const [images, setImages] = useState<UploadImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductCardItem[]>([]);
  const [relatedLoading, setRelatedLoading] = useState<boolean>(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [activeCategoryPath, setActiveCategoryPath] = useState<CategoryNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicFieldsLoading, setDynamicFieldsLoading] = useState<boolean>(false);
  const [dynamicFieldsError, setDynamicFieldsError] = useState<string | null>(null);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});
  const [dynamicFieldTypeOverrides, setDynamicFieldTypeOverrides] = useState<
    Record<string, "select" | "text">
  >({});
  const [dynamicFieldOtherActive, setDynamicFieldOtherActive] = useState<Record<string, boolean>>({});
  const [appliedAiFields, setAppliedAiFields] = useState<Set<ApplyTarget>>(new Set());
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);

  const allCategoryNodes = useMemo(() => {
    const collect = (nodes: CategoryNode[]): CategoryNode[] =>
      nodes.flatMap((node) => [node, ...(node.categories ? collect(node.categories) : [])]);
    return collect(categoryTree);
  }, [categoryTree]);

  const findCategoryPath = (
    predicate: (node: CategoryNode) => boolean,
    nodes: CategoryNode[],
    path: CategoryNode[] = [],
  ): CategoryNode[] | null => {
    for (const node of nodes) {
      const nextPath = [...path, node];
      if (predicate(node)) return nextPath;
      const childMatch = findCategoryPath(predicate, node.categories || [], nextPath);
      if (childMatch) return childMatch;
    }
    return null;
  };

  const findCategoryNodeBySuggestion = (suggestion?: ResolvedField | null): CategoryNode | null => {
    if (!suggestion) return null;
    const rawValue = suggestion.rawValue?.trim() ?? "";
    const resolvedLabel = suggestion.resolvedLabel?.trim() ?? "";
    const target = (resolvedLabel || rawValue).trim();
    if (!target) return null;

    if (suggestion.resolvedId) {
      const path = findCategoryPath((node) => node.id === suggestion.resolvedId, categoryTree);
      if (path) return path[path.length - 1];
    }

    const normalizedTarget = target.toLowerCase();
    const exactMatch = allCategoryNodes.find(
      (node) => node.name.trim().toLowerCase() === normalizedTarget,
    );
    if (exactMatch) return exactMatch;

    return (
      allCategoryNodes.find((node) => {
        const normalizedName = node.name.trim().toLowerCase();
        return (
          normalizedName.includes(normalizedTarget) ||
          normalizedTarget.includes(normalizedName)
        );
      }) ?? null
    );
  };

  const suggestionFieldAliases: Record<ApplyTarget, string[]> = {
    category: ["category"],
    subcategory: ["subcategory", "sub category", "sub-category", "sub_category"],
    brand: ["brand", "brand_women_shoes", "shoes brand", "shoes_brand"],
    primaryColor: ["primarycolor", "primary color", "colour", "color", "colour"],
    secondaryColor: ["secondarycolor", "secondary color", "colour", "color", "colour"],
    material: ["material"],
    condition: ["condition"],
    gender: ["gender", "sex"],
    style: ["style", "occasion", "shoe style", "look"],
    title: ["title"],
    description: ["description"],
  };

  const normalizeString = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[\s\-_\/]+/g, " ")
      .replace(/[^a-z0-9 ]+/g, "");

  const getDynamicFieldValue = (aliases: string[]): string | undefined => {
    const normalizedAliases = aliases.map((alias) => normalizeString(alias));

    for (const field of dynamicFields) {
      const normalizedFieldKey = normalizeString(field.key);
      const normalizedFieldLabel = normalizeString(field.label);
      const value = dynamicFieldValues[field.key]?.trim();

      if (!value) continue;

      if (
        normalizedAliases.some(
          (alias) =>
            normalizedFieldKey.includes(alias) ||
            normalizedFieldLabel.includes(alias),
        )
      ) {
        return value;
      }
    }

    return undefined;
  };

  const buildRelatedProductFilters = () => {
    if (!selectedCategory) return null;

    const filters: Record<string, string | number | undefined> = {
      category: selectedCategory.slug || selectedCategory.name,
      brand: getDynamicFieldValue(["brand"]),
      size: getDynamicFieldValue(["size"]),
      condition: getDynamicFieldValue(["condition"]),
      colour: getDynamicFieldValue(["colour", "color"]),
      material: getDynamicFieldValue(["material"]),
      sortBy: "price_asc",
    };

    return Object.entries(filters).reduce<Record<string, string | number>>(
      (acc, [key, value]) => {
        if (value == null || String(value).trim() === "") return acc;
        acc[key] = value;
        return acc;
      },
      {},
    );
  };

  const findDynamicFieldForSuggestion = (
    suggestionKey: ApplyTarget,
    suggestion: ResolvedField,
  ): DynamicField | undefined => {
    const aliases = suggestionFieldAliases[suggestionKey] || [];
    const target = normalizeString(suggestion.resolvedLabel || suggestion.rawValue || "");
    return dynamicFields.find((field) => {
      const haystack = normalizeString(`${field.key} ${field.label}`);
      if (aliases.some((alias) => haystack.includes(normalizeString(alias)))) {
        return true;
      }
      return target && haystack.includes(target);
    });
  };

  const optionMatchesSuggestion = (optionText: string, targetText: string): boolean => {
    const normalizedOption = normalizeString(optionText);
    const normalizedTarget = normalizeString(targetText);
    if (!normalizedTarget) return false;
    if (normalizedOption === normalizedTarget) return true;
    if (normalizedOption.includes(normalizedTarget) || normalizedTarget.includes(normalizedOption)) return true;
    const targetWords = normalizedTarget.split(" ").filter(Boolean);
    return targetWords.every((word) => normalizedOption.includes(word));
  };

  const getOptionValueForSuggestion = (
    field: DynamicField,
    suggestion: ResolvedField,
  ): string | null => {
    const target = suggestion.resolvedLabel || suggestion.rawValue || "";
    if (!target || !field.options) return null;

    const exactMatch = field.options.find(
      (opt) =>
        optionMatchesSuggestion(String(opt.value), target) ||
        optionMatchesSuggestion(opt.label, target),
    );
    return exactMatch ? String(exactMatch.value) : null;
  };

  const applySuggestionToDynamicField = (
    suggestionKey: ApplyTarget,
    suggestion: ResolvedField,
  ) => {
    const field = findDynamicFieldForSuggestion(suggestionKey, suggestion);
    if (!field) return;

    const optionValue = getOptionValueForSuggestion(field, suggestion);
    if (optionValue !== null) {
      // If suggestion matches an existing option, ensure 'Other' input is disabled
      setDynamicFieldOtherActive((prev) => ({ ...prev, [field.key]: false }));
      setDynamicFieldTypeOverrides((prev) => {
        const copy = { ...prev };
        delete copy[field.key];
        return copy;
      });
      handleDynamicFieldChange(field.key, optionValue);
      return;
    }

    const fallbackValue = suggestion.rawValue || suggestion.resolvedLabel || "";
    if (!fallbackValue) return;

    if (field.type === "select") {
      // Show the text input (Other) for this field so user can edit/clear it
      setDynamicFieldTypeOverrides((prev) => ({
        ...prev,
        [field.key]: "text",
      }));
      setDynamicFieldOtherActive((prev) => ({ ...prev, [field.key]: true }));
    }
    handleDynamicFieldChange(field.key, fallbackValue);
  };

  useEffect(() => {
    if (!selectedCategory) {
      setDynamicFieldTypeOverrides({});
    }
  }, [selectedCategory]);

  const {
    analyze,
    cancel,
    reset: resetAiAnalysis,
    isAnalyzing,
    progressMessage,
    result: aiResult,
    error: aiError,
  } = useAiListingAnalysis();

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<UploadImage[]>([]);

  useEffect(() => {
    if (!authReady || user) return;
    requireLogin("Please log in first to start selling.");
  }, [authReady, user, requireLogin]);

  /* ---------------- FETCH CATEGORY TREE (fires once) ---------------- */

  useEffect(() => {
    if (hasFetchedCategories.current) return;
    if (categoryStatus === "idle") {
      hasFetchedCategories.current = true;
      dispatch(fetchCatalogTree());
    }
  }, [categoryStatus, dispatch]);

  /* ---------------- FETCH DYNAMIC FIELDS (fires per selected category) ---------------- */

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
          } else if (
            config.options &&
            Array.isArray(config.options) &&
            config.options.length > 0
          ) {
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
          } else if (
            attr.rawType === "number" ||
            config.display_type === "number"
          ) {
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
          setDynamicFieldTypeOverrides({});
          setDynamicFieldValues({});
          setDynamicFieldsLoading(false);

          const dropdownCodes = Array.from(
            new Set(
              loadedFields
                .filter((field) => {
                  const code = field.key.toLowerCase();
                  const needsDropdownByType =
                    field.type === "select" && (field.options?.length ?? 0) === 0;
                  const needsDropdownByCode =
                    (code === "brand" || code === "size") &&
                    (field.options?.length ?? 0) === 0;
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
                        .filter(
                          (option: DynamicFieldOption) => option.label && option.value
                        )
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
                return { ...field, type: "select", options: fetchedOptions };
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
        setDynamicFieldsError(
          error instanceof Error ? error.message : "Failed to load fields"
        );
        setDynamicFieldsLoading(false);
      }
    };

    fetchFields();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  /* ---------------- CLOSE CATEGORY MENU ON OUTSIDE CLICK ---------------- */

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
    if (!selectedCategory) {
      setRelatedProducts([]);
      setRelatedError(null);
      setRelatedLoading(false);
      return;
    }

    let isMounted = true;
    const timer = window.setTimeout(async () => {
      const params = buildRelatedProductFilters();
      if (!params) return;

      setRelatedLoading(true);
      setRelatedError(null);

      try {
        const response = await fetchFilteredProducts({
          ...params,
          pageSize: 8,
        });

        if (!isMounted) return;
        setRelatedProducts(response.items || []);
      } catch (error) {
        if (!isMounted) return;
        setRelatedError(
          error instanceof Error ? error.message : "Failed to load related products",
        );
        setRelatedProducts([]);
      } finally {
        if (!isMounted) return;
        setRelatedLoading(false);
      }
    }, 500);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [selectedCategory, JSON.stringify(dynamicFieldValues)]);

  /* ---------------- SYNC IMAGES REF ---------------- */

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  /* ---------------- REVOKE BLOB URLS ON UNMOUNT ---------------- */

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, []);

  /* ---------------- MEMOS ---------------- */

  const currentLevelNodes = useMemo(() => {
    if (activeCategoryPath.length === 0) return categoryTree;
    return activeCategoryPath[activeCategoryPath.length - 1].categories || [];
  }, [activeCategoryPath, categoryTree]);

  const leafCategoryEntries = useMemo(
    () => getLeafCategoryEntries(categoryTree),
    [categoryTree]
  );

  const filteredLeafEntries = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return [];
    return leafCategoryEntries.filter(({ path }) =>
      path.some((node) => node.name.toLowerCase().includes(search))
    );
  }, [categorySearch, leafCategoryEntries]);

  /* ---------------- HANDLERS ---------------- */

  const handleUploadClick = () => {
    if (images.length >= MAX_IMAGES) {
      toast.warn(`You can only upload up to ${MAX_IMAGES} photos.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAnalyzePhotos = () => {
    if (images.length === 0) {
      toast.warn("Upload at least one photo before running AI analysis.");
      return;
    }

    analyze({ files: images.map((image) => image.file), categoryId: selectedCategory?.id ?? null });
  };

  const handleApplyField = (field: ApplyTarget) => {
    const suggestion = aiResult?.suggestions[field];
    if (!suggestion) return;

    if (field === "title") {
      setTitle((suggestion as ResolvedTextField).text ?? title);
    } else if (field === "description") {
      setDescription((suggestion as ResolvedTextField).text ?? description);
    } else if (field === "category" || field === "subcategory") {
      const categoryNode = findCategoryNodeBySuggestion(suggestion as ResolvedField);
      if (categoryNode) {
        const path = findCategoryPath((node) => node.id === categoryNode.id, categoryTree);
        setSelectedCategory(categoryNode);
        setActiveCategoryPath(path ? path.slice(0, -1) : []);
      }
    } else {
      applySuggestionToDynamicField(field, suggestion as ResolvedField);
    }

    setAppliedAiFields((prev) => new Set(prev).add(field));
  };

  const handleApplyAll = () => {
    if (!aiResult) return;

    if (aiResult.suggestions.title.text) setTitle(aiResult.suggestions.title.text);
    if (aiResult.suggestions.description.text) setDescription(aiResult.suggestions.description.text);

    const applyKeys: ApplyTarget[] = [
      "title",
      "description",
      "category",
      "subcategory",
      "brand",
      "material",
      "primaryColor",
      "secondaryColor",
      "condition",
      "gender",
      "style",
    ];

    applyKeys.forEach((key) => handleApplyField(key));
    setAppliedAiFields(new Set(applyKeys));
  };

  const handleDismissAiSuggestions = () => {
    setShowAiSuggestions(false);
  };

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
        toast.warn(
          `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit and was skipped.`
        );
        continue;
      }
      validFiles.push(file);
    }

    const filesToAdd = validFiles.slice(0, remaining);

    if (validFiles.length > remaining) {
      toast.warn(
        `Only ${remaining} more photo(s) can be added. Extra files were skipped.`
      );
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

  const handleDynamicFieldChange = (key: string, value: string) => {
    setDynamicFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleCreateProduct = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!selectedCategory) {
      setSubmitError("Please select a category.");
      return;
    }

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
          uploadForm.append("files", renameFile(image.file)); // ← renamed files
        }

        const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: uploadForm,
        });

        const uploadPayload = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(
            uploadPayload?.error?.message ||
              `Failed to upload images: ${uploadResponse.status}`
          );
        }

        imageIds = Array.isArray(uploadPayload)
          ? uploadPayload
              .map((item: any) => Number(item?.id))
              .filter((id: number) => Number.isInteger(id) && id > 0)
          : [];
      }

      const cleanedDynamicValues = Object.fromEntries(
        Object.entries(dynamicFieldValues).filter(
          ([_, v]) => v !== "" && v !== undefined && v !== null
        )
      );

      const response = await fetch(`${API_BASE_URL}/api/products/sell-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: parsedPrice,
          categoryId: selectedCategory.id,
          dynamicValues: cleanedDynamicValues,
          imageIds,
          userId: user?.id,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.error?.message ||
            payload?.message ||
            `Failed to create product: ${response.status}`
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

      // Reset form
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
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  // Publish button is disabled while submitting OR while category fields are loading
  const isPublishDisabled = submitLoading || dynamicFieldsLoading;

  if (authReady && !user) return <></>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 bg-[#fdfcfb] min-h-screen pb-20">
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-[#1a1816] mb-2">Sell an Item</h1>
        <p className="text-gray-500 text-sm">Fill in the details below to list your item.</p>
      </header>

      <div className="space-y-8">
        {/* --- PHOTOS SECTION --- */}
        <section>
          <h2 className="font-semibold text-[#1a1816] mb-1">Photos</h2>
          <p className="text-xs text-gray-500 mb-4">
            Add up to {MAX_IMAGES} photos. First photo will be the cover.
          </p>

          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative w-32 h-32 border border-gray-200 rounded-2xl overflow-hidden group"
              >
                <img
                  src={image.previewUrl}
                  alt={`Upload ${index}`}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                onClick={handleUploadClick}
                className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Camera className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs font-medium text-gray-400">
                  Add ({images.length}/{MAX_IMAGES})
                </span>
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleAnalyzePhotos}
              disabled={images.length === 0 || isAnalyzing}
              className="inline-flex items-center justify-center rounded-full bg-[#cb6f4d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a65c3f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? "Analyzing photos..." : "Analyze with AI"}
            </button>
            <p className="text-xs text-gray-500 sm:text-right">
              Tip: AI works best with clear, well-lit photos showing brand details.
            </p>
          </div>

          <AiAnalysisProgress message={progressMessage} onCancel={cancel} />

          {aiError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {aiError}
            </div>
          )}

          {aiResult && showAiSuggestions && (
            <AiSuggestionsPanel
              suggestions={aiResult.suggestions}
              appliedFields={appliedAiFields}
              onApplyField={handleApplyField}
              onApplyAll={handleApplyAll}
              onDismiss={handleDismissAiSuggestions}
            />
          )}
        </section>

        {/* --- TITLE --- */}
        <section>
          <label className="block font-semibold text-[#1a1816] mb-2">Title</label>
          <input
            type="text"
            placeholder="e.g. Vintage Levi's Denim Jacket"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]/30 text-gray-800"
          />
        </section>

        {/* --- DESCRIPTION --- */}
        <section>
          <label className="block font-semibold text-[#1a1816] mb-2">Description</label>
          <textarea
            placeholder="Describe your item..."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]/30 text-gray-800 resize-none"
          />
        </section>

        {/* --- PRICE --- */}
        <section>
          <label className="block font-semibold text-[#1a1816] mb-2">Price (TBH)</label>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl">
            <span className="text-gray-500 font-medium">TBH</span>
            <input
              type="text"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-300"
            />
          </div>
        </section>

        {/* --- CATEGORY --- */}
        <section>
          <label className="block font-semibold text-[#1a1816] mb-2">Category</label>
          <div className="relative" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => setCategoryMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl text-left"
            >
              <span className={selectedCategory ? "text-gray-800" : "text-gray-400"}>
                {selectedCategory ? selectedCategory.name : "Select a category"}
              </span>
              {categoryMenuOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {selectedCategory && (
              <input type="hidden" name="categorySlug" value={selectedCategory.slug} />
            )}

            {categoryMenuOpen && (
              <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl">
                <div className="p-3 border-b border-gray-100 space-y-3">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder="Find a category"
                    className="w-full px-3 py-2 rounded-lg bg-[#f7f7f7] focus:outline-none text-sm"
                  />

                  <div className="flex items-center justify-between">
                    {categorySearch ? (
                      <span className="text-sm font-medium text-gray-800">
                        Search results
                      </span>
                    ) : (
                      <>
                        {activeCategoryPath.length > 0 ? (
                          <button
                            type="button"
                            onClick={handleBackLevel}
                            className="inline-flex items-center gap-1 text-[#cb6f4d]"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                          </button>
                        ) : (
                          <span />
                        )}
                        <span className="text-sm font-medium text-gray-800">
                          {currentLevelTitle}
                        </span>
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
                  {categoryLoading && (
                    <p className="p-3 text-sm text-gray-500">Loading categories...</p>
                  )}

                  {!categoryLoading && categoryError && (
                    <p className="p-3 text-sm text-red-500">{categoryError}</p>
                  )}

                  {!categoryLoading &&
                    !categoryError &&
                    categorySearch &&
                    filteredLeafEntries.length === 0 && (
                      <p className="p-3 text-sm text-gray-500">No categories found.</p>
                    )}

                  {!categoryLoading &&
                    !categoryError &&
                    !categorySearch &&
                    currentLevelNodes.length === 0 && (
                      <p className="p-3 text-sm text-gray-500">No categories available.</p>
                    )}

                  {!categoryLoading &&
                    !categoryError &&
                    categorySearch &&
                    filteredLeafEntries.map(({ node, path }) => (
                      <button
                        type="button"
                        key={`${node.id}-${path.map((item) => item.id).join("-")}`}
                        onClick={() => {
                          setSelectedCategory(node);
                          setCategoryMenuOpen(false);
                          setCategorySearch("");
                        }}
                        className="w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium text-gray-900">{node.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {path.map((item) => item.name).join(" > ")}
                        </div>
                      </button>
                    ))}

                  {!categoryLoading &&
                    !categoryError &&
                    !categorySearch &&
                    currentLevelNodes.map((node) => {
                      const hasChildren = node.categories && node.categories.length > 0;
                      return (
                        <button
                          type="button"
                          key={node.id}
                          onClick={() => handleCategoryRowClick(node)}
                          className="w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span className="text-gray-900">{node.name}</span>
                          {hasChildren ? (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          ) : (
                            <span
                              className={`h-7 w-7 rounded-full border-2 flex items-center justify-center ${
                                selectedCategory?.id === node.id
                                  ? "border-[#cb6f4d]"
                                  : "border-gray-400"
                              }`}
                            >
                              {selectedCategory?.id === node.id && (
                                <span className="h-3.5 w-3.5 rounded-full bg-[#cb6f4d]" />
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
        </section>

        {/* --- DYNAMIC FIELDS (brand, material, color, size, etc. — arrive per category) --- */}
        {selectedCategory && (
          <section>
            {dynamicFieldsLoading && (
              <p className="text-sm text-gray-500">Loading category details...</p>
            )}

            {!dynamicFieldsLoading && dynamicFieldsError && (
              <p className="text-sm text-red-500">{dynamicFieldsError}</p>
            )}

            {!dynamicFieldsLoading &&
              !dynamicFieldsError &&
              dynamicFields.length === 0 && (
                <p className="text-sm text-gray-500">
                  No additional details for this category.
                </p>
              )}

            {!dynamicFieldsLoading &&
              !dynamicFieldsError &&
              dynamicFields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dynamicFields.map((field) => {
                    const showColorPalette =
                      isColorField(field) && dynamicFieldTypeOverrides[field.key] !== "text";

                    return (
                    <div key={field.key}>
                      {showColorPalette ? (
                        <ColorPalette
                          value={dynamicFieldValues[field.key] || ""}
                          onChange={(value) =>
                            handleDynamicFieldChange(field.key, value)
                          }
                          label={field.label}
                          required={field.required}
                          options={(field.options || []).map((option) => ({
                            label: option.label,
                            value: option.value,
                          }))}
                        />
                      ) : (
                        <>
                          <label className="block font-semibold text-[#1a1816] mb-2">
                            {field.label}
                            {field.required ? " *" : ""}
                          </label>
                      {((dynamicFieldTypeOverrides[field.key] ?? field.type) === "select") ? (
                        dynamicFieldOtherActive[field.key] ? (
                          <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl">
                            <input
                              type="text"
                              name={field.key}
                              value={dynamicFieldValues[field.key] || ""}
                              onChange={(e) =>
                                handleDynamicFieldChange(field.key, e.target.value)
                              }
                              placeholder={
                                field.placeholder || `Enter ${field.label.toLowerCase()}`
                              }
                              className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                // revert back to dropdown and remove any text override
                                setDynamicFieldOtherActive((prev) => ({ ...prev, [field.key]: false }));
                                setDynamicFieldTypeOverrides((prev) => {
                                  const copy = { ...prev };
                                  delete copy[field.key];
                                  return copy;
                                });
                                handleDynamicFieldChange(field.key, "");
                              }}
                              className="text-gray-400 hover:text-gray-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                                <SearchableSelectSellItem
                            options={(field.options || []).map((option) => ({
                              value: option.value,
                              label: option.label,
                            }))}
                            value={dynamicFieldValues[field.key] || ""}
                            onChange={(value) => {
                              const selected = (field.options || []).find((o) => String(o.value) === String(value));
                              const isOther = value === "__other__" || (selected?.label || "").trim().toLowerCase() === "other";
                              if (isOther) {
                                setDynamicFieldOtherActive((prev) => ({ ...prev, [field.key]: true }));
                                handleDynamicFieldChange(field.key, "");
                              } else {
                                handleDynamicFieldChange(field.key, value);
                              }
                            }}
                            placeholder={
                              field.placeholder || `Select ${field.label.toLowerCase()}`
                            }
                            searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
                            className="w-full sm:max-w-none"
                            triggerClassName="px-4 py-3 bg-[#f7f7f7] border-gray-200 rounded-xl h-auto"
                          />
                        )
                      ) : (
                        (() => {
                          const isOverriddenToText = dynamicFieldTypeOverrides[field.key] === "text";
                          const showClear = dynamicFieldOtherActive[field.key] || isOverriddenToText;
                          if (showClear) {
                            return (
                              <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl">
                                <input
                                  type={field.type === "number" ? "number" : "text"}
                                  name={field.key}
                                  value={dynamicFieldValues[field.key] || ""}
                                  onChange={(e) =>
                                    handleDynamicFieldChange(field.key, e.target.value)
                                  }
                                  placeholder={
                                    field.placeholder || `Enter ${field.label.toLowerCase()}`
                                  }
                                  className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    // remove override and revert to dropdown
                                    setDynamicFieldOtherActive((prev) => ({ ...prev, [field.key]: false }));
                                    setDynamicFieldTypeOverrides((prev) => {
                                      const copy = { ...prev };
                                      delete copy[field.key];
                                      return copy;
                                    });
                                    handleDynamicFieldChange(field.key, "");
                                  }}
                                  className="text-gray-400 hover:text-gray-700 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl">
                              <input
                                type={field.type === "number" ? "number" : "text"}
                                name={field.key}
                                value={dynamicFieldValues[field.key] || ""}
                                onChange={(e) =>
                                  handleDynamicFieldChange(field.key, e.target.value)
                                }
                                placeholder={
                                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                                }
                                className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-300"
                              />
                              {field.unit && (
                                <span className="text-gray-500 text-sm">{field.unit}</span>
                              )}
                            </div>
                          );
                        })()
                      )}
                        </>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
          </section>
        )}

        {selectedCategory && relatedProducts.length > 0 && (
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1a1816]">
                  Pricing comparison
                </h2>
                <p className="text-sm text-gray-500">
                  See similar items in this category and niche while you list.
                </p>
              </div>
              {relatedProducts.length > 0 && (
                <p className="text-xs text-gray-500">
                  Showing {relatedProducts.length > 4 ? 4 : relatedProducts.length} related items.
                </p>
              )}
            </div>

            {relatedLoading ? (
              <p className="text-sm text-gray-500">Loading related products...</p>
            ) : relatedError ? (
              <p className="text-sm text-red-500">{relatedError}</p>
            ) : relatedProducts.length === 0 ? (
              <p className="text-sm text-gray-500">
                No related listings found yet. Try adjusting category, brand or item details.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedProducts.slice(0, 4).map((product) => (
                  <ProductCard key={String(product.id)} {...product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- SUBMIT --- */}
        <div className="pt-4">
          {submitError && (
            <p className="text-red-500 text-sm mb-4 text-center">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-green-700 text-sm mb-4 text-center">{submitSuccess}</p>
          )}
          <button
            type="button"
            onClick={handleCreateProduct}
            disabled={isPublishDisabled}
            className="w-full py-4 bg-[#cb6f4d] cursor-pointer text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {submitLoading
              ? "Publishing..."
              : dynamicFieldsLoading
              ? "Loading fields..."
              : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
