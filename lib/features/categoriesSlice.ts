import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  CATEGORY_TREE_ENDPOINT,
  CategoryNode,
  CategoryTreeApiResponse,
  sortCategoryTree,
} from "@/lib/categoryUtils";

type CategoriesState = {
  tree: CategoryNode[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: CategoriesState = {
  tree: [],
  status: "idle",
  error: null,
};

export const fetchCatalogTree = createAsyncThunk<
  CategoryNode[],
  void,
  { rejectValue: string }
>(
  "categories/fetchCatalogTree",
  async (_, { rejectWithValue }) => {
    let lastError = "Failed to load categories";


      try {
        const response = await fetch(CATEGORY_TREE_ENDPOINT);
        if (!response.ok) {
          lastError = `Failed to load categories: ${response.status}`;
          // continue;
        }

        const payload: CategoryTreeApiResponse = await response.json();
        const activeTree = (payload.data || []).filter((node) => node.isActive);
        return sortCategoryTree(activeTree);
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Failed to load categories";
      }
    

    return rejectWithValue(lastError);
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { categories?: CategoriesState };
      const status = state.categories?.status ?? "idle";
      return status === "idle" || status === "failed";
    },
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogTree.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCatalogTree.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tree = action.payload;
        state.error = null;
      })
      .addCase(fetchCatalogTree.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to load categories";
      });
  },
});

export default categoriesSlice.reducer;

