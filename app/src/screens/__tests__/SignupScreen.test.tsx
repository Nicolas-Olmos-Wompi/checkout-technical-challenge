import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen, userEvent } from "@testing-library/react-native";
import SignupScreen from "../SignupScreen";
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

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      loginForm: loginFormReducer,
      signupForm: signupFormReducer,
    },
  });
}

async function renderSignupScreen(
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
      <SignupScreen navigation={navigation} route={{} as Props["route"]} />
    </Provider>,
  );

  return { navigation, store, view };
}

describe("SignupScreen", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedTokenStorage.getToken.mockResolvedValue(null);
    mockedTokenStorage.setToken.mockResolvedValue(undefined);
  });

  it("shows validation errors and does not call the API when fields are invalid", async () => {
    await renderSignupScreen();

    await user.press(screen.getByText("Sign up"));

    expect(screen.getByText("Username must be between 3 and 255 characters")).toBeTruthy();
    expect(screen.getByText("Enter a valid email address")).toBeTruthy();
    expect(screen.getByText("Password must be between 8 and 255 characters")).toBeTruthy();
    expect(mockedAuthApi.signup).not.toHaveBeenCalled();
  });

  it("shows a mismatch error when password confirmation does not match", async () => {
    await renderSignupScreen();

    await user.type(screen.getByLabelText("Username"), "john");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "different123");
    await user.press(screen.getByText("Sign up"));

    expect(screen.getByText("Passwords do not match")).toBeTruthy();
    expect(mockedAuthApi.signup).not.toHaveBeenCalled();
  });

  it("dispatches the signup thunk and navigates to Products on success", async () => {
    mockedAuthApi.signup.mockResolvedValue({
      token: "token-xyz",
      tokenType: "Bearer",
      expiresIn: "1h",
      user: { id: "1", username: "john", email: "john@example.com" },
    });

    const { navigation, store } = await renderSignupScreen();

    await user.type(screen.getByLabelText("Username"), "john");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.press(screen.getByText("Sign up"));

    expect(mockedAuthApi.signup).toHaveBeenCalledWith({
      username: "john",
      email: "john@example.com",
      password: "password123",
    });
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: "Products" }],
    });
    expect(mockedTokenStorage.setToken).toHaveBeenCalledWith("token-xyz");
    expect(store.getState().auth.status).toBe("authenticated");
  });

  it("shows the server error message in a banner when signup fails (duplicate username)", async () => {
    mockedAuthApi.signup.mockRejectedValue(
      new ApiError("Username already exists.", 409, "409"),
    );

    await renderSignupScreen();

    await user.type(screen.getByLabelText("Username"), "john");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.press(screen.getByText("Sign up"));

    expect(screen.getByText("Username already exists.")).toBeTruthy();
  });

  it("navigates to Login when the login link is pressed", async () => {
    const { navigation } = await renderSignupScreen();

    await user.press(screen.getByText("Already have an account? Log in"));

    expect(navigation.navigate).toHaveBeenCalledWith("Login");
  });

  it("clears a stale auth error left over from another screen on mount", async () => {
    const { store } = await renderSignupScreen(
      {},
      {
        auth: {
          status: "unauthenticated",
          user: null,
          token: null,
          error: "Invalid username or password.",
        } as AuthState,
      },
    );

    expect(screen.queryByText("Invalid username or password.")).toBeNull();
    expect(store.getState().auth.error).toBeNull();
  });

  it("clears the auth error on unmount so it does not leak to the next screen", async () => {
    mockedAuthApi.signup.mockRejectedValue(
      new ApiError("Username already exists.", 409, "409"),
    );

    const { store, view } = await renderSignupScreen();

    await user.type(screen.getByLabelText("Username"), "john");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.press(screen.getByText("Sign up"));

    expect(store.getState().auth.error).toBe("Username already exists.");

    await view.unmount();

    expect(store.getState().auth.error).toBeNull();
  });
});
