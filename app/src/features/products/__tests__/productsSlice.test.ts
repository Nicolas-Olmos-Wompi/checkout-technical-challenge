import { configureStore } from "@reduxjs/toolkit";
import productsReducer, {
  fetchProducts,
  setPage,
  applyFilters,
  clearFilters,
} from "../productsSlice";
import * as productsApi from "../../../api/products";
import { ApiError } from "../../../api/types";
import type { PaginatedProducts } from "../../../api/product.types";

jest.mock("../../../api/products");

const mockedProductsApi = productsApi as jest.Mocked<typeof productsApi>;

function createTestStore() {
  return configureStore({ reducer: { products: productsReducer } });
}

const product = {
  id: "1",
  name: "Headset",
  description: "Bluetooth headset",
  price: 50000,
  stock: 10,
  image: "https://example.com/image.webp",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const paginatedResponse: PaginatedProducts = {
  items: [product],
  page: 1,
  pageSize: 10,
  total: 1,
  totalPages: 1,
};

describe("productsSlice reducer", () => {
  it("returns the initial state", () => {
    const store = createTestStore();
    expect(store.getState().products).toEqual({
      items: [],
      page: 1,
      pageSize: 6,
      total: 0,
      totalPages: 0,
      filters: { name: "", minPrice: "", maxPrice: "" },
      status: "idle",
      error: null,
    });
  });

  describe("fetchProducts", () => {
    it("sets status to loading while pending", () => {
      const store = createTestStore();
      store.dispatch({ type: fetchProducts.pending.type });
      expect(store.getState().products.status).toBe("loading");
      expect(store.getState().products.error).toBeNull();
    });

    it("stores items and pagination metadata on fulfillment", () => {
      const store = createTestStore();
      store.dispatch({
        type: fetchProducts.fulfilled.type,
        payload: paginatedResponse,
      });
      const state = store.getState().products;
      expect(state.status).toBe("succeeded");
      expect(state.items).toEqual([product]);
      expect(state.page).toBe(1);
      expect(state.total).toBe(1);
      expect(state.totalPages).toBe(1);
    });

    it("sets an error message on rejection", () => {
      const store = createTestStore();
      store.dispatch({
        type: fetchProducts.rejected.type,
        payload: "Something went wrong.",
      });
      const state = store.getState().products;
      expect(state.status).toBe("failed");
      expect(state.error).toBe("Something went wrong.");
    });
  });

  describe("setPage", () => {
    it("updates the current page", () => {
      const store = createTestStore();
      store.dispatch(setPage(3));
      expect(store.getState().products.page).toBe(3);
    });
  });

  describe("applyFilters", () => {
    it("updates filters and resets page to 1", () => {
      const store = createTestStore();
      store.dispatch(setPage(4));
      store.dispatch(
        applyFilters({ name: "chair", minPrice: "100", maxPrice: "500" }),
      );
      const state = store.getState().products;
      expect(state.filters).toEqual({
        name: "chair",
        minPrice: "100",
        maxPrice: "500",
      });
      expect(state.page).toBe(1);
    });
  });

  describe("clearFilters", () => {
    it("resets filters to empty and page to 1", () => {
      const store = createTestStore();
      store.dispatch(setPage(2));
      store.dispatch(
        applyFilters({ name: "chair", minPrice: "100", maxPrice: "500" }),
      );
      store.dispatch(clearFilters());
      const state = store.getState().products;
      expect(state.filters).toEqual({ name: "", minPrice: "", maxPrice: "" });
      expect(state.page).toBe(1);
    });
  });
});

describe("productsSlice thunk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the API with page, pageSize, and filters converted to numbers", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(paginatedResponse);
    const store = createTestStore();
    store.dispatch(setPage(2));
    store.dispatch(
      applyFilters({ name: "chair", minPrice: "100", maxPrice: "500" }),
    );

    await store.dispatch(fetchProducts());

    expect(mockedProductsApi.getProducts).toHaveBeenCalledWith({
      page: 1,
      pageSize: 6,
      name: "chair",
      minPrice: 10000,
      maxPrice: 50000,
    });
  });

  it("omits empty filter fields from the request", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(paginatedResponse);
    const store = createTestStore();

    await store.dispatch(fetchProducts());

    expect(mockedProductsApi.getProducts).toHaveBeenCalledWith({
      page: 1,
      pageSize: 6,
    });
  });

  it("stores the server error message on failure", async () => {
    mockedProductsApi.getProducts.mockRejectedValue(
      new ApiError("Request failed with status 500", 500),
    );
    const store = createTestStore();

    await store.dispatch(fetchProducts());

    const state = store.getState().products;
    expect(state.status).toBe("failed");
    expect(state.error).toBe("Request failed with status 500");
  });
});
