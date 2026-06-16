"use client";
import { useState, useRef, useEffect, useMemo, ChangeEvent, JSX, Suspense } from "react";
import {
  Plus,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useParams, useSearchParams } from "next/navigation";

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

// Images that already exist on the server (have an id + url)
type ExistingImage = {
  id: number;
  url: string;
};

// Newly picked local images (not yet uploaded)
type NewImage = {
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

const toAbsoluteImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

const getLeafCategoryEntries = (
  nodes: CategoryNode[],
  parentPath: CategoryNode[] = [],
): LeafCategoryEntry[] => {
  return nodes.flatMap((node) => {
    const currentPath = [...parentPath, node];
    if (!node.categories || node.categories.length === 0) {
      return [{ node, path: currentPath }];
    }
    return getLeafCategoryEntries(node.categories, currentPath);
  });
};

/* ================================================================
   EDIT ITEM PAGE
   Route expected: /items/[id]/edit
   Fetches existing product, pre-fills the form, then PATCHes on save.
================================================================ */
function EditItemInner(): JSX.Element {
  const { user, authReady, requireLogin } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // product id from route — works for both /items/[id]/edit and wherever you mount this
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") ?? "";

  const categoryTree = useAppSelector((state) => state.categories.tree);
  const categoryStatus = useAppSelector((state) => state.categories.status);
  const categoryError = useAppSelector((state) => state.categories.error);
  const categoryLoading =
    categoryStatus === "idle" || categoryStatus === "loading";

  const hasFetchedCategories = useRef(false);

  /* ── product load state ── */
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  /* ── form fields ── */
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ── category state ── */
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [activeCategoryPath, setActiveCategoryPath] = useState<CategoryNode[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(
    null,
  );

  /* ── dynamic fields ── */
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicFieldsLoading, setDynamicFieldsLoading] =
    useState<boolean>(false);
  const [dynamicFieldsError, setDynamicFieldsError] = useState<string | null>(
    null,
  );
  const [dynamicFieldValues, setDynamicFieldValues] = useState<
    Record<string, string>
  >({});

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const newImagesRef = useRef<NewImage[]>([]);

  /* ── total slot count ── */
  const totalImageCount = existingImages.length + newImages.length;

  /* ================================================================
     AUTH GUARD
  ================================================================ */
  useEffect(() => {
    if (!authReady || user) return;
    requireLogin("Please log in to edit your listing.");
  }, [authReady, user, requireLogin]);

  /* ================================================================
     FETCH CATEGORY TREE (once)
  ================================================================ */
  useEffect(() => {
    if (hasFetchedCategories.current) return;
    if (categoryStatus === "idle") {
      hasFetchedCategories.current = true;
      dispatch(fetchCatalogTree());
    }
  }, [categoryStatus, dispatch]);

  /* ================================================================
     FETCH EXISTING PRODUCT & PRE-FILL FORM
  ================================================================ */
  useEffect(() => {
    if (!productId) {
      setProductError("Invalid product id.");
      setProductLoading(false);
      return;
    }

    let isMounted = true;
    setProductLoading(true);
    setProductError(null);

    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/products/getProductById/${productId}`,
        );
        if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
        const json = await res.json();

        // Support both flat and Strapi v4 data-wrapped shapes
        const data =
          json?.product ?? json?.data?.attributes ?? json?.data ?? json;

        if (!isMounted) return;

        // Pre-fill text fields
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");

        const rawPrice = data.price ?? "";
        setPrice(String(rawPrice).replace(/[^\d.]/g, ""));

        // Pre-fill existing images
        const imgs: ExistingImage[] = (data.images ?? [])
          .map((img: any) => ({
            id: Number(img.id),
            url: toAbsoluteImageUrl(img.url ?? img.attributes?.url ?? ""),
          }))
          .filter((img: ExistingImage) => img.id && img.url);

        setExistingImages(imgs);

        // Pre-fill category — we match by name after the tree loads;
        // store raw category name so we can resolve once the tree is ready
        if (data.category) {
          setPendingCategoryName(
            typeof data.category === "string"
              ? data.category
              : (data.category?.name ?? ""),
          );
        }

        // Pre-fill dynamic field values (attributes array from Strapi)
        if (Array.isArray(data.attributes)) {
          const vals: Record<string, string> = {};
          for (const attr of data.attributes) {
            if (attr.code && attr.value != null) {
              vals[attr.code] = String(attr.value);
            }
          }
          setDynamicFieldValues(vals);
        }
      } catch (err) {
        if (isMounted)
          setProductError(
            err instanceof Error ? err.message : "Failed to load product.",
          );
      } finally {
        if (isMounted) setProductLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  /* ── pending category name (resolved once tree is ready) ── */
  const [pendingCategoryName, setPendingCategoryName] = useState<string>("");

  useEffect(() => {
    if (!pendingCategoryName || categoryLoading || categoryTree.length === 0)
      return;

    const findNode = (nodes: CategoryNode[]): CategoryNode | null => {
      for (const node of nodes) {
        if (node.name.toLowerCase() === pendingCategoryName.toLowerCase())
          return node;
        const found = findNode(node.categories || []);
        if (found) return found;
      }
      return null;
    };

    const match = findNode(categoryTree);
    if (match) {
      setSelectedCategory(match);
      setPendingCategoryName(""); // resolved — clear
    }
  }, [pendingCategoryName, categoryTree, categoryLoading]);

  /* ================================================================
     FETCH DYNAMIC FIELDS (per selected category)
  ================================================================ */
  useEffect(() => {
    let isMounted = true;

    const fetchFields = async () => {
      if (!selectedCategory) {
        setDynamicFields([]);
        setDynamicFieldsError(null);
        setDynamicFieldsLoading(false);
        return;
      }

      setDynamicFieldsLoading(true);
      setDynamicFieldsError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/categories/upload-attributes?category_id=${selectedCategory.id}`,
        );

        if (!response.ok)
          throw new Error(`Failed to load fields: ${response.status}`);

        const payload = await response.json();
        const apiAttributes = payload.attributes || [];

        const uniqueAttrMap = new Map<string, any>();
        for (const attr of apiAttributes) {
          const key = attr.code || attr.id;
          if (!uniqueAttrMap.has(key)) uniqueAttrMap.set(key, attr);
        }

        const loadedFields: DynamicField[] = Array.from(
          uniqueAttrMap.values(),
        ).map((attr: any) => {
          const config = attr.configuration || {};
          let fieldOptions: DynamicFieldOption[] = [];

          if (attr.rawOptions && Array.isArray(attr.rawOptions)) {
            fieldOptions = attr.rawOptions.map((opt: any) => ({
              label: opt.title || String(opt.id),
              value: String(opt.value || opt.id),
            }));
          } else if (config.options?.length > 0) {
            const group = config.options[0];
            if (group?.options?.length > 0) {
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
            key: attr.code ? attr.code.startsWith("brand_") ? "brand" : attr.code.includes("size") ? "size" : attr.code : String(attr.id),
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
          setDynamicFieldsLoading(false);

          // Fetch dropdown options for fields that need them
          const dropdownCodes = Array.from(
            new Set(
              loadedFields
                .filter((field) => {
                  const code = field.key.toLowerCase();
                  const needsDropdownByType =
                    field.type === "select" &&
                    (field.options?.length ?? 0) === 0;
                  const needsDropdownByCode =
                    (code === "brand" || code === "size") &&
                    (field.options?.length ?? 0) === 0;
                  return needsDropdownByType || needsDropdownByCode;
                })
                .map((field) => field.key.toLowerCase()),
            ),
          );

          if (dropdownCodes.length > 0) {
            const dropdownResponses = await Promise.all(
              dropdownCodes.map(async (code) => {
                try {
                  const dropdownRes = await fetch(
                    `${API_BASE_URL}/api/item-upload/dropdown?category_id=${selectedCategory.id}&code=${encodeURIComponent(code)}`,
                  );
                  if (!dropdownRes.ok) return [code, []] as const;
                  const dropdownPayload = await dropdownRes.json();
                  const options = Array.isArray(dropdownPayload?.options)
                    ? dropdownPayload.options
                        .map((option: any) => ({
                          label: String(
                            option.title || option.value || "",
                          ).trim(),
                          value: String(option.value ?? option.id ?? ""),
                        }))
                        .filter(
                          (option: DynamicFieldOption) =>
                            option.label && option.value,
                        )
                    : [];
                  return [code, options] as const;
                } catch {
                  return [code, []] as const;
                }
              }),
            );

            if (!isMounted) return;

            const optionsByCode = new Map<string, DynamicFieldOption[]>(
              dropdownResponses,
            );
            setDynamicFields((prev) =>
              prev.map((field) => {
                const code = field.key.toLowerCase();
                const fetchedOptions = optionsByCode.get(code) || [];
                if (fetchedOptions.length === 0) return field;
                return { ...field, type: "select", options: fetchedOptions };
              }),
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
          error instanceof Error ? error.message : "Failed to load fields",
        );
        setDynamicFieldsLoading(false);
      }
    };

    fetchFields();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  /* ================================================================
     CLOSE CATEGORY MENU ON OUTSIDE CLICK
  ================================================================ */
  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  /* ── Sync new images ref + revoke on unmount ── */
  useEffect(() => {
    newImagesRef.current = newImages;
  }, [newImages]);
  useEffect(() => {
    return () => {
      for (const img of newImagesRef.current)
        URL.revokeObjectURL(img.previewUrl);
    };
  }, []);

  /* ================================================================
     MEMOS
  ================================================================ */
  const currentLevelNodes = useMemo(() => {
    if (activeCategoryPath.length === 0) return categoryTree;
    return activeCategoryPath[activeCategoryPath.length - 1].categories || [];
  }, [activeCategoryPath, categoryTree]);

  const leafCategoryEntries = useMemo(
    () => getLeafCategoryEntries(categoryTree),
    [categoryTree],
  );

  const filteredLeafEntries = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return [];
    return leafCategoryEntries.filter(({ path }) =>
      path.some((node) => node.name.toLowerCase().includes(search)),
    );
  }, [categorySearch, leafCategoryEntries]);

  /* ================================================================
     IMAGE HANDLERS
  ================================================================ */
  const handleUploadClick = () => {
    if (totalImageCount >= MAX_IMAGES) {
      toast.warn(`You can only have up to ${MAX_IMAGES} photos.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - totalImageCount;
    if (remaining <= 0) {
      toast.warn(`You can only have up to ${MAX_IMAGES} photos.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.warn(
          `"${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB and was skipped.`,
        );
        continue;
      }
      validFiles.push(file);
    }

    const filesToAdd = validFiles.slice(0, remaining);
    if (validFiles.length > remaining) {
      toast.warn(
        `Only ${remaining} more photo(s) can be added. Extra files were skipped.`,
      );
    }

    if (filesToAdd.length > 0) {
      const newImgs = filesToAdd.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setNewImages((prev) => [...prev, ...newImgs]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove an existing (server) image — track its id so we can tell the API
  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  };

  // Remove a newly-picked local image
  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const toRemove = prev[index];
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  /* ================================================================
     CATEGORY HANDLERS
  ================================================================ */
  const handleCategoryRowClick = (node: CategoryNode) => {
    if (node.categories && node.categories.length > 0) {
      setActiveCategoryPath((prev) => [...prev, node]);
      return;
    }
    setSelectedCategory(node);
    setCategoryMenuOpen(false);
    setCategorySearch("");
  };

  const handleBackLevel = () =>
    setActiveCategoryPath((prev) => prev.slice(0, -1));

  const resetCategoryNavigation = () => {
    setActiveCategoryPath([]);
    setCategorySearch("");
  };

  const currentLevelTitle =
    activeCategoryPath.length > 0
      ? activeCategoryPath[activeCategoryPath.length - 1].name
      : "Select a category";

  /* ================================================================
     SUBMIT — PATCH
  ================================================================ */
  const handleSaveChanges = async () => {
    setSubmitError(null);

    if (!selectedCategory) {
      setSubmitError("Please select a category.");
      return;
    }

    if (totalImageCount === 0) {
      setSubmitError("Please add at least one photo.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setSubmitError("Please enter a valid price.");
      return;
    }

    setSubmitLoading(true);

    try {
      // 1. Upload any new images first
      let newImageIds: number[] = [];
      if (newImages.length > 0) {
        const formData = new FormData();
        for (const img of newImages) {
          formData.append("files", renameFile(img.file));
        }

        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadPayload = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(
            uploadPayload?.error?.message ||
              `Failed to upload images: ${uploadRes.status}`,
          );
        }

        newImageIds = Array.isArray(uploadPayload)
          ? uploadPayload
              .map((item: any) => Number(item?.id))
              .filter((id: number) => Number.isInteger(id) && id > 0)
          : [];
      }

      // 2. Build final image id list:
      //    kept existing ids  +  newly uploaded ids
      const keptExistingIds = existingImages.map((img) => img.id);
      
      // Clean and combine the IDs for the payload
      const validNewIds = Array.isArray(newImageIds) ? newImageIds.filter(id => id && !isNaN(id)) : [];
      const finalImageIds = [...keptExistingIds, ...validNewIds];

      if (finalImageIds.length === 0) {
        throw new Error("Product must have at least one image.");
      }

      // 3. Clean dynamic field values
      const cleanedDynamicValues = Object.fromEntries(
        Object.entries(dynamicFieldValues).filter(
          ([, v]) => v !== "" && v !== undefined && v !== null,
        ),
      );

      // 4. PATCH the product
      const res = await fetch(`${API_BASE_URL}/api/products/update-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          data: {
            productId,
            title,
            description,
            price: parsedPrice,
            categoryId: selectedCategory.id,
            dynamicValues: cleanedDynamicValues,
            imageIds: finalImageIds, // matches "imageIds" from your sell-now POST
            removedImageIds,
            userId: user?.id,
          },
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(
          payload?.error?.message ||
            payload?.message ||
            `Failed to update product: ${res.status}`,
        );
      }

      toast.success("Listing updated successfully!");
      router.push(`/items/${productId}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save changes.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const isPublishDisabled =
    submitLoading || dynamicFieldsLoading || productLoading;

  /* ================================================================
     LOADING / ERROR SCREENS
  ================================================================ */
  if (authReady && !user) return <></>;

  if (productLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center gap-4 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#cb6f4d]" />
        <p className="text-sm font-sans">Loading your listing…</p>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
        <p className="text-red-500 text-sm font-sans">{productError}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#cb6f4d] underline font-sans"
        >
          Go back
        </button>
      </div>
    );
  }

  /* ================================================================
     MAIN RENDER
  ================================================================ */
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 bg-[#fdfcfb] min-h-screen pb-20">
      {/* ── Header ── */}
      <header className="mb-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5 font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="font-serif text-4xl font-bold text-[#1a1816] mb-2">
          Edit Listing
        </h1>
        <p className="text-gray-500 text-sm font-sans">
          Update your listing details below. Changes save immediately.
        </p>
      </header>

      <div className="space-y-8">
        {/* ── PHOTOS ── */}
        <section>
          <h2 className="font-semibold text-[#1a1816] mb-1">Photos</h2>
          <p className="text-xs text-gray-500 mb-4">
            Up to {MAX_IMAGES} photos. First photo is the cover. Remove old
            photos or add new ones.
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
            {/* Existing (server) images */}
            {existingImages.map((img) => (
              <div
                key={`existing-${img.id}`}
                className="relative w-32 h-32 border border-gray-200 rounded-2xl overflow-hidden group"
              >
                <img
                  src={img.url}
                  alt="Product photo"
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {/* Subtle "saved" badge */}
                <span className="absolute bottom-1 left-1 bg-black/40 text-white text-[9px] font-sans px-1.5 py-0.5 rounded-full">
                  saved
                </span>
              </div>
            ))}

            {/* New (local preview) images */}
            {newImages.map((img, index) => (
              <div
                key={`new-${index}`}
                className="relative w-32 h-32 border-2 border-dashed border-[#cb6f4d]/40 rounded-2xl overflow-hidden group"
              >
                <img
                  src={img.previewUrl}
                  alt={`New photo ${index + 1}`}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {/* "new" badge */}
                <span className="absolute bottom-1 left-1 bg-[#cb6f4d]/80 text-white text-[9px] font-sans px-1.5 py-0.5 rounded-full">
                  new
                </span>
              </div>
            ))}

            {/* Add more slot */}
            {totalImageCount < MAX_IMAGES && (
              <button
                onClick={handleUploadClick}
                className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Camera className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs font-medium text-gray-400">
                  Add ({totalImageCount}/{MAX_IMAGES})
                </span>
              </button>
            )}
          </div>

          {removedImageIds.length > 0 && (
            <p className="mt-2 text-xs text-amber-600 font-sans">
              {removedImageIds.length} photo
              {removedImageIds.length > 1 ? "s" : ""} marked for removal.
              Changes apply when you save.
            </p>
          )}
        </section>

        {/* ── TITLE ── */}
        <section>
          <label className="block font-semibold text-[#1a1816] mb-2">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g. Vintage Levi's Denim Jacket"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]/30 text-gray-800 font-sans"
          />
        </section>

        {/* ── DESCRIPTION ── */}
        <section>
          <label className="block font-semibold text-[#1a1816] mb-2">
            Description
          </label>
          <textarea
            placeholder="Describe your item..."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]/30 text-gray-800 resize-none font-sans"
          />
        </section>

        {/* ── PRICE ── */}
        <section>
          <label className="block font-semibold text-[#1a1816] mb-2">
            Price (THB)
          </label>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl">
            <span className="text-gray-500 font-medium font-sans">THB</span>
            <input
              type="text"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-300 font-sans"
            />
          </div>
        </section>

        {/* ── CATEGORY ── */}
        <section>
          <label className="block font-semibold text-[#1a1816] mb-2">
            Category
          </label>
          <div className="relative" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => setCategoryMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl text-left font-sans"
            >
              <span
                className={selectedCategory ? "text-gray-800" : "text-gray-400"}
              >
                {selectedCategory ? selectedCategory.name : "Select a category"}
              </span>
              {categoryMenuOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {selectedCategory && (
              <input
                type="hidden"
                name="categorySlug"
                value={selectedCategory.slug}
              />
            )}

            {categoryMenuOpen && (
              <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl">
                <div className="p-3 border-b border-gray-100 space-y-3">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Find a category"
                    className="w-full px-3 py-2 rounded-lg bg-[#f7f7f7] focus:outline-none text-sm font-sans"
                  />

                  <div className="flex items-center justify-between">
                    {categorySearch ? (
                      <span className="text-sm font-medium text-gray-800 font-sans">
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
                            <span className="text-sm font-sans">Back</span>
                          </button>
                        ) : (
                          <span />
                        )}
                        <span className="text-sm font-medium text-gray-800 font-sans">
                          {currentLevelTitle}
                        </span>
                        {activeCategoryPath.length > 0 ? (
                          <button
                            type="button"
                            onClick={resetCategoryNavigation}
                            className="text-xs text-gray-500 hover:text-gray-700 font-sans"
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
                    <p className="p-3 text-sm text-gray-500 font-sans">
                      Loading categories…
                    </p>
                  )}

                  {!categoryLoading && categoryError && (
                    <p className="p-3 text-sm text-red-500 font-sans">
                      {categoryError}
                    </p>
                  )}

                  {!categoryLoading &&
                    !categoryError &&
                    categorySearch &&
                    filteredLeafEntries.length === 0 && (
                      <p className="p-3 text-sm text-gray-500 font-sans">
                        No categories found.
                      </p>
                    )}

                  {!categoryLoading &&
                    !categoryError &&
                    !categorySearch &&
                    currentLevelNodes.length === 0 && (
                      <p className="p-3 text-sm text-gray-500 font-sans">
                        No categories available.
                      </p>
                    )}

                  {/* Search results */}
                  {!categoryLoading &&
                    !categoryError &&
                    categorySearch &&
                    filteredLeafEntries.map(({ node, path }) => (
                      <button
                        type="button"
                        key={`${node.id}-${path.map((n) => n.id).join("-")}`}
                        onClick={() => {
                          setSelectedCategory(node);
                          setCategoryMenuOpen(false);
                          setCategorySearch("");
                        }}
                        className="w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 font-sans"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {node.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {path.map((n) => n.name).join(" > ")}
                        </div>
                      </button>
                    ))}

                  {/* Tree navigation */}
                  {!categoryLoading &&
                    !categoryError &&
                    !categorySearch &&
                    currentLevelNodes.map((node) => {
                      const hasChildren =
                        node.categories && node.categories.length > 0;
                      return (
                        <button
                          type="button"
                          key={node.id}
                          onClick={() => handleCategoryRowClick(node)}
                          className="w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 flex items-center justify-between font-sans"
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

        {/* ── DYNAMIC FIELDS ── */}
        {selectedCategory && (
          <section>
            {dynamicFieldsLoading && (
              <p className="text-sm text-gray-500 font-sans">
                Loading category details…
              </p>
            )}

            {!dynamicFieldsLoading && dynamicFieldsError && (
              <p className="text-sm text-red-500 font-sans">
                {dynamicFieldsError}
              </p>
            )}

            {!dynamicFieldsLoading &&
              !dynamicFieldsError &&
              dynamicFields.length === 0 && (
                <p className="text-sm text-gray-500 font-sans">
                  No additional details for this category.
                </p>
              )}

            {!dynamicFieldsLoading &&
              !dynamicFieldsError &&
              dynamicFields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dynamicFields.map((field) => (
                    <div key={field.key}>
                      <label className="block font-semibold text-[#1a1816] mb-2 font-sans">
                        {field.label}
                        {field.required ? " *" : ""}
                      </label>
                      {field.type === "select" ? (
                        <div className="relative">
                          <select
                            name={field.key}
                            value={dynamicFieldValues[field.key] || ""}
                            onChange={(e) =>
                              setDynamicFieldValues((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl appearance-none focus:outline-none text-gray-800 font-sans"
                          >
                            <option value="">
                              {field.placeholder ||
                                `Select ${field.label.toLowerCase()}`}
                            </option>
                            {(field.options || []).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-xl">
                          <input
                            type={field.type === "number" ? "number" : "text"}
                            name={field.key}
                            value={dynamicFieldValues[field.key] || ""}
                            onChange={(e) =>
                              setDynamicFieldValues((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            placeholder={
                              field.placeholder ||
                              `Enter ${field.label.toLowerCase()}`
                            }
                            className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-300 font-sans"
                          />
                          {field.unit && (
                            <span className="text-gray-500 text-sm font-sans">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </section>
        )}

        {/* ── SUBMIT ── */}
        <div className="pt-4">
          {submitError && (
            <p className="text-red-500 text-sm mb-4 text-center font-sans">
              {submitError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isPublishDisabled}
            className="w-full py-4 bg-[#cb6f4d] cursor-pointer text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed font-sans"
          >
            {submitLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving…
              </>
            ) : dynamicFieldsLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading fields…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function EditItem(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditItemInner />
    </Suspense>
  );
}
