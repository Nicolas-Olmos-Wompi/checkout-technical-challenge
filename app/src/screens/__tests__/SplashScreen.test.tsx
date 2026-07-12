import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render } from "@testing-library/react-native";
import SplashScreen from "../SplashScreen";
import authReducer, { type AuthState } from "../../features/auth/authSlice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

function createTestStore(authState: Partial<AuthState>) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        status: "idle",
        user: null,
        token: null,
        error: null,
        ...authState,
      } as AuthState,
    },
  });
}

async function renderSplashScreen(authState: Partial<AuthState>) {
  const navigation = { replace: jest.fn() } as unknown as Props["navigation"];
  const store = createTestStore(authState);

  await render(
    <Provider store={store}>
      <SplashScreen navigation={navigation} route={{} as Props["route"]} />
    </Provider>,
  );

  return { navigation };
}

describe("SplashScreen", () => {
  it("does not navigate while the auth status is idle", async () => {
    const { navigation } = await renderSplashScreen({ status: "idle" });
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("does not navigate while the auth status is loading", async () => {
    const { navigation } = await renderSplashScreen({ status: "loading" });
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("replaces with Products when authenticated", async () => {
    const { navigation } = await renderSplashScreen({ status: "authenticated" });
    expect(navigation.replace).toHaveBeenCalledWith("Products");
  });

  it("replaces with Login when unauthenticated", async () => {
    const { navigation } = await renderSplashScreen({ status: "unauthenticated" });
    expect(navigation.replace).toHaveBeenCalledWith("Login");
  });
});
