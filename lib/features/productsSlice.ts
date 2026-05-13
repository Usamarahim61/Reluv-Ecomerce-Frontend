import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchProductsForHome, fetchProductById, ProductCardItem, ProductDetailItem } from "@/services/products-service";

interface ProductsState {
  items: ProductCardItem[];
  currentProduct: ProductDetailItem | null;
  page: number;
  pageSize: number;
  hasMore: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  productStatus: "idle" | "loading" | "succeeded" | "failed";
  productError: string | null;
}

const initialState: ProductsState = {
  items: [],
  currentProduct: null,
  page: 1,
  pageSize: 20,
  hasMore: true,
  status: "idle",
  error: null,
  productStatus: "idle",
  productError: null,
};

// Async thunk for fetching products with pagination
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page, pageSize }: { page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const result = await fetchProductsForHome(page, pageSize);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch products");
    }
  }
);

// Async thunk for fetching a single product by ID
export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const product = await fetchProductById(id);
      return product;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch product");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
      state.status = "idle";
      state.error = null;
    },
    appendProducts: (state, action: PayloadAction<ProductCardItem[]>) => {
      state.items = [...state.items, ...action.payload];
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.productStatus = "idle";
      state.productError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload.page === 1) {
          state.items = action.payload.items;
        } else {
          state.items = [...state.items, ...action.payload.items];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Fetch single product
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.productStatus = "loading";
        state.productError = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.productStatus = "succeeded";
        state.currentProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.productStatus = "failed";
        state.productError = action.payload as string;
      });
  },
});

export const { resetProducts, appendProducts, setPage, setHasMore, clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
