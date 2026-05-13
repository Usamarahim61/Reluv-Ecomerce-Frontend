import { SubCategoryItem } from "@/app/constants/subCatagories";
import { API_BASE_URL } from "@/app/constants/api";

export type CategoryNode = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  categories: CategoryNode[];
};

export type CategoryTreeApiResponse = {
  data: CategoryNode[];
};

export const CATEGORY_TREE_ENDPOINT = 
  `${API_BASE_URL}/api/categories/catalog-tree`


export const sortCategoryTree = (nodes: CategoryNode[]): CategoryNode[] => {
  return [...nodes]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((node) => ({
      ...node,
      categories: sortCategoryTree(node.categories || []),
    }));
};

export const mapTreeToSubCategories = (tree: CategoryNode[]): SubCategoryItem[] => {
  return tree.map((root) => ({
    label: root.name,
    slug: root.slug,
    children: [
      { label: "ALL", icon: "::", items: [], slug: root.slug },
      ...(root.categories || []).map((child) => ({
        label: child.name,
        icon: "::",
        items: (child.categories || []).map((leaf) => leaf.name),
        slug: child.slug,
        itemSlugs: (child.categories || []).map((leaf) => leaf.slug),
      })),
    ],
  }));
};

