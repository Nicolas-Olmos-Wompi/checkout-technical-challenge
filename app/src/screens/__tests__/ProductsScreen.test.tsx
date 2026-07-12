import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import ProductsScreen from "../ProductsScreen";
import authReducer, { type AuthState } from "../../features/auth/authSlice";
import productsReducer from "../../features/products/productsSlice";
import * as tokenStorage from "../../auth/tokenStorage";
import * as productsApi from "../../api/products";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import type { PaginatedProducts } from "../../api/product.types";
import { ApiError } from "../../api/types";

jest.mock("../../auth/tokenStorage");
jest.mock("../../api/products");

const mockedTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockedProductsApi = productsApi as jest.Mocked<typeof productsApi>;

type Props = NativeStackScreenProps<RootStackParamList, "Products">;

function createTestStore(authState: Partial<AuthState> = {}) {
  return configureStore({
    reducer: { auth: authReducer, products: productsReducer },
    preloadedState: {
      auth: {
        status: "authenticated",
        user: null,
        token: "token-abc",
        error: null,
        ...authState,
      } as AuthState,
    },
  });
}

async function renderProductsScreen(authState: Partial<AuthState> = {}) {
  const navigation = {
    reset: jest.fn(),
    navigate: jest.fn(),
  } as unknown as Props["navigation"];
  const store = createTestStore(authState);

  await render(
    <Provider store={store}>
      <ProductsScreen navigation={navigation} route={{} as Props["route"]} />
    </Provider>,
  );

  return { navigation, store };
}

function buildPage(overrides: Partial<PaginatedProducts> = {}): PaginatedProducts {
  return {
    items: [
      {
        id: "1",
        name: "Bluetooth Headset",
        description: "Wireless headset",
        price: 150000,
        stock: 5,
        image: "https://example.com/headset.webp",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ],
    page: 1,
    pageSize: 6,
    total: 1,
    totalPages: 1,
    ...overrides,
  };
}

describe("ProductsScreen", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedTokenStorage.clearToken.mockResolvedValue(undefined);
  });

  it("shows a welcome message with the authenticated user's username", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(buildPage());
    await renderProductsScreen({
      user: { id: "1", username: "john", email: "john@example.com" },
    });

    expect(screen.getByText("Welcome, john")).toBeTruthy();
  });

  it("does not show a welcome message when there is no user", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(buildPage());
    await renderProductsScreen({ user: null });

    expect(screen.queryByText(/Welcome,/)).toBeNull();
  });

  it("dispatches logout and navigates to Login when the logout button is pressed", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(buildPage());
    const { navigation, store } = await renderProductsScreen({
      user: { id: "1", username: "john", email: "john@example.com" },
    });

    await user.press(screen.getByText("Log out"));

    expect(mockedTokenStorage.clearToken).toHaveBeenCalled();
    expect(store.getState().auth.status).toBe("unauthenticated");
    expect(store.getState().auth.user).toBeNull();
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: "Login" }],
    });
  });

  it("fetches products on mount and renders them", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(buildPage());
    await renderProductsScreen();

    await waitFor(() => {
      expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
    });
    expect(mockedProductsApi.getProducts).toHaveBeenCalledWith({ page: 1, pageSize: 6 });
  });

  it("shows skeleton placeholders while loading", async () => {
    let resolvePromise: (value: PaginatedProducts) => void = () => {};
    mockedProductsApi.getProducts.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    await renderProductsScreen();

    expect(screen.getAllByTestId(/skeleton/).length).toBeGreaterThan(0);

    resolvePromise(buildPage());
    await waitFor(() => {
      expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
    });
  });

  it("shows an error state with a retry button on failure", async () => {
    mockedProductsApi.getProducts.mockRejectedValue(
      new ApiError("Request failed with status 500", 500),
    );
    await renderProductsScreen();

    await waitFor(() => {
      expect(screen.getByText("Request failed with status 500")).toBeTruthy();
    });
    expect(screen.getByText("Retry")).toBeTruthy();
  });

  it("retries the fetch when Retry is pressed", async () => {
    mockedProductsApi.getProducts.mockRejectedValueOnce(
      new ApiError("Request failed with status 500", 500),
    );
    await renderProductsScreen();

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeTruthy();
    });

    mockedProductsApi.getProducts.mockResolvedValueOnce(buildPage());
    await user.press(screen.getByText("Retry"));

    await waitFor(() => {
      expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
    });
  });

  it("searches by name and resets to page 1", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(buildPage());
    await renderProductsScreen();

    await waitFor(() => {
      expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
    });

    await user.type(screen.getByLabelText("Search products"), "chair");
    await user.press(screen.getByText("Search"));

    await waitFor(() => {
      expect(mockedProductsApi.getProducts).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 6,
        name: "chair",
      });
    });
  });

  it("applies price filters via the FiltersPanel and resets to page 1", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(buildPage());
    await renderProductsScreen();

    await waitFor(() => {
      expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
    });

    await user.press(screen.getByText("Filters"));
    await user.type(screen.getByLabelText("Minimum price"), "100");
    await user.type(screen.getByLabelText("Maximum price"), "500");
    await user.press(screen.getByText("Apply"));

    await waitFor(() => {
      expect(mockedProductsApi.getProducts).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 6,
        minPrice: 10000,
        maxPrice: 50000,
      });
    });
  });

  it("clears filters and refetches", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(buildPage());
    await renderProductsScreen();

    await waitFor(() => {
      expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
    });

    await user.press(screen.getByText("Filters"));
    await user.type(screen.getByLabelText("Minimum price"), "100");
    await user.press(screen.getByText("Clear"));

    await waitFor(() => {
      expect(mockedProductsApi.getProducts).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 6,
      });
    });
  });

  it("navigates to the next page when Next is pressed", async () => {
    mockedProductsApi.getProducts.mockResolvedValue(
      buildPage({ page: 1, totalPages: 3, total: 25 }),
    );
    await renderProductsScreen();

    await waitFor(() => {
      expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
    });

    mockedProductsApi.getProducts.mockResolvedValueOnce(
      buildPage({ page: 2, totalPages: 3, total: 25 }),
    );
    await user.press(screen.getByTestId("pagination-next"));

    await waitFor(() => {
      expect(mockedProductsApi.getProducts).toHaveBeenLastCalledWith({
        page: 2,
        pageSize: 6,
      });
    });
  });

  it("navigates to ProductDetail with the product when a card is tapped", async () => {
    const page = buildPage();
    mockedProductsApi.getProducts.mockResolvedValue(page);
    const { navigation } = await renderProductsScreen();

    await waitFor(() => {
      expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
    });

    await user.press(screen.getByText("Bluetooth Headset"));

    expect(navigation.navigate).toHaveBeenCalledWith("ProductDetail", {
      product: page.items[0],
    });
  });
});
