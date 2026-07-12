import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen, userEvent } from "@testing-library/react-native";
import ProductsScreen from "../ProductsScreen";
import authReducer, { type AuthState } from "../../features/auth/authSlice";
import * as tokenStorage from "../../auth/tokenStorage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

jest.mock("../../auth/tokenStorage");
const mockedTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;

type Props = NativeStackScreenProps<RootStackParamList, "Products">;

function createTestStore(authState: Partial<AuthState>) {
  return configureStore({
    reducer: { auth: authReducer },
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
  const navigation = { reset: jest.fn() } as unknown as Props["navigation"];
  const store = createTestStore(authState);

  await render(
    <Provider store={store}>
      <ProductsScreen navigation={navigation} route={{} as Props["route"]} />
    </Provider>,
  );

  return { navigation, store };
}

describe("ProductsScreen", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedTokenStorage.clearToken.mockResolvedValue(undefined);
  });

  it("shows a welcome message with the authenticated user's username", async () => {
    await renderProductsScreen({
      user: { id: "1", username: "john", email: "john@example.com" },
    });

    expect(screen.getByText("Welcome, john")).toBeTruthy();
  });

  it("does not show a welcome message when there is no user", async () => {
    await renderProductsScreen({ user: null });

    expect(screen.queryByText(/Welcome,/)).toBeNull();
  });

  it("dispatches logout and navigates to Login when the logout button is pressed", async () => {
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
});
