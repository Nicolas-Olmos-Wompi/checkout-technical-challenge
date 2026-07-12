import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen, userEvent } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";
import authReducer, { type AuthState } from "../../features/auth/authSlice";
import loginFormReducer from "../../features/auth/loginFormSlice";
import signupFormReducer from "../../features/auth/signupFormSlice";
import * as authApi from "../../api/auth";
import * as tokenStorage from "../../auth/tokenStorage";
import { ApiError } from "../../api/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

jest.mock("../../api/auth");
jest.mock("../../auth/tokenStorage");

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      loginForm: loginFormReducer,
      signupForm: signupFormReducer,
    },
  });
}

async function renderLoginScreen(
  overrides: Partial<Props["navigation"]> = {},
  preloadedState?: Parameters<typeof configureStore>[0]["preloadedState"],
) {
  const navigation = {
    navigate: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  } as unknown as Props["navigation"];
  const store = preloadedState
    ? configureStore({
        reducer: {
          auth: authReducer,
          loginForm: loginFormReducer,
          signupForm: signupFormReducer,
        },
        preloadedState,
      })
    : createTestStore();

  const view = await render(
    <Provider store={store}>
      <LoginScreen navigation={navigation} route={{} as Props["route"]} />
    </Provider>,
  );

  return { navigation, store, view };
}

describe("LoginScreen", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedTokenStorage.getToken.mockResolvedValue(null);
    mockedTokenStorage.setToken.mockResolvedValue(undefined);
  });

  it("shows validation errors and does not call the API when fields are invalid", async () => {
    await renderLoginScreen();

    await user.press(screen.getByText("Log in"));

    expect(screen.getByText("Username must be between 3 and 255 characters")).toBeTruthy();
    expect(screen.getByText("Password must be between 8 and 255 characters")).toBeTruthy();
    expect(mockedAuthApi.login).not.toHaveBeenCalled();
  });

  it("dispatches the login thunk and navigates to Products on success", async () => {
    mockedAuthApi.login.mockResolvedValue({
      token: "token-abc",
      tokenType: "Bearer",
      expiresIn: "1h",
      user: { id: "1", username: "john", email: "john@example.com" },
    });

    const { navigation, store } = await renderLoginScreen();

    await user.type(screen.getByLabelText("Username"), "john");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.press(screen.getByText("Log in"));

    expect(mockedAuthApi.login).toHaveBeenCalledWith({
      username: "john",
      password: "password123",
    });
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: "Products" }],
    });
    expect(mockedTokenStorage.setToken).toHaveBeenCalledWith("token-abc");
    expect(store.getState().auth.status).toBe("authenticated");
  });

  it("shows the server error message in a banner when login fails", async () => {
    mockedAuthApi.login.mockRejectedValue(
      new ApiError("Invalid username or password.", 401, "401"),
    );

    await renderLoginScreen();

    await user.type(screen.getByLabelText("Username"), "john");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.press(screen.getByText("Log in"));

    expect(screen.getByText("Invalid username or password.")).toBeTruthy();
  });

  it("navigates to Signup when the create-account button is pressed", async () => {
    const { navigation } = await renderLoginScreen();

    await user.press(screen.getByText("Create an account"));

    expect(navigation.navigate).toHaveBeenCalledWith("Signup");
  });

  it("keeps typed field values in the store as the user types", async () => {
    const { store } = await renderLoginScreen();

    await user.type(screen.getByLabelText("Username"), "john");

    expect(store.getState().loginForm.username).toBe("john");
  });

  it("clears a stale auth error left over from another screen on mount", async () => {
    const { store } = await renderLoginScreen(
      {},
      {
        auth: {
          status: "unauthenticated",
          user: null,
          token: null,
          error: 'Username "nicolas" is already taken.',
        } as AuthState,
      },
    );

    expect(screen.queryByText('Username "nicolas" is already taken.')).toBeNull();
    expect(store.getState().auth.error).toBeNull();
  });

  it("clears the auth error on unmount so it does not leak to the next screen", async () => {
    mockedAuthApi.login.mockRejectedValue(
      new ApiError("Invalid username or password.", 401, "401"),
    );

    const { store, view } = await renderLoginScreen();

    await user.type(screen.getByLabelText("Username"), "john");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.press(screen.getByText("Log in"));

    expect(store.getState().auth.error).toBe("Invalid username or password.");

    await view.unmount();

    expect(store.getState().auth.error).toBeNull();
  });
});
