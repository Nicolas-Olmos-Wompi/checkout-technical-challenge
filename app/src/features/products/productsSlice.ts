import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getProducts } from "../../api/products";
import type { GetProductsParams, PaginatedProducts, Product } from "../../api/product.types";
import { ApiError } from "../../api/types";

export type ProductsStatus = "idle" | "loading" | "succeeded" | "failed";

export type ProductFilters = {
  name: string;
  minPrice: string;
  maxPrice: string;
};

export type ProductsState = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: ProductFilters;
  status: ProductsStatus;
  error: string | null;
};

const initialState: ProductsState = {
  items: [],
  page: 1,
  pageSize: 6,
  total: 0,
  totalPages: 0,
  filters: { name: "", minPrice: "", maxPrice: "" },
  status: "idle",
  error: null,
};

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

function buildParams(state: ProductsState): GetProductsParams {
  const { page, pageSize, filters } = state;
  const params: GetProductsParams = { page, pageSize };

  if (filters.name.trim() !== "") {
    params.name = filters.name.trim();
  }
  if (filters.minPrice.trim() !== "") {
    params.minPrice = Number(filters.minPrice.trim()) * 100;
  }
  if (filters.maxPrice.trim() !== "") {
    params.maxPrice = Number(filters.maxPrice.trim()) * 100;
  }

  return params;
}

export const fetchProducts = createAsyncThunk<
  PaginatedProducts,
  void,
  { state: { products: ProductsState }; rejectValue: string }
>("products/fetchProducts", async (_, { getState, rejectWithValue }) => {
  try {
    const params = buildParams(getState().products);
    return await getProducts(params);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    applyFilters(state, action: PayloadAction<ProductFilters>) {
      state.filters = action.payload;
      state.page = 1;
    },
    clearFilters(state) {
      state.filters = { name: "", minPrice: "", maxPrice: "" };
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<PaginatedProducts>) => {
          state.status = "succeeded";
          state.items = action.payload.items;
          state.page = action.payload.page;
          state.pageSize = action.payload.pageSize;
          state.total = action.payload.total;
          state.totalPages = action.payload.totalPages;
          state.error = null;
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong. Please try again.";
      });
  },
});

export const { setPage, applyFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
