import React from "react";
import { Alert } from "react-native";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, act } from "@testing-library/react-native";
import type { NavigationContainerRef } from "@react-navigation/native";
import SessionExpiryListener from "../SessionExpiryListener";
import authReducer, { type AuthState } from "../../features/auth/authSlice";
import ordersReducer, { type OrdersState } from "../../features/orders/ordersSlice";
import * as tokenStorage from "../tokenStorage";
import { notifySessionExpired } from "../sessionExpiry";
import type { RootStackParamList } from "../../navigation/types";

jest.mock("../tokenStorage");

function createTestStore(authState: Partial<AuthState>, ordersState?: Partial<OrdersState>) {
  return configureStore({
    reducer: { auth: authReducer, orders: ordersReducer },
    preloadedState: {
      auth: {
        status: "authenticated",
        user: { id: "1", username: "john", email: "john@example.com" },
        token: "token-abc",
        error: null,
        ...authState,
      } as AuthState,
      orders: {
        order: null,
        status: "idle",
        error: null,
        submittedDelivery: null,
        ...ordersState,
      } as OrdersState,
    },
  });
}

/**
 * Simulates the user tapping the (single) OK-style button of the Alert
 * raised by the listener, the way RN Testing Library typically deals with
 * Alert.alert: intercept the call and manually invoke the button's onPress.
 */
function mockAlertAndAutoPressOk() {
  return jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
    const okButton = buttons?.[0];
    okButton?.onPress?.();
  });
}

function createMockNavigationRef() {
  const reset = jest.fn();
  const ref = {
    current: {
      reset,
      isReady: () => true,
    },
  } as unknown as React.RefObject<NavigationContainerRef<RootStackParamList>>;
  return { ref, reset };
}

describe("SessionExpiryListener", () => {
  const mockedClearToken = tokenStorage.clearToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedClearToken.mockResolvedValue(undefined);
  });

  it("shows a session-expired alert, then dispatches logout and resets navigation to Login when the session expires", async () => {
    const store = createTestStore({});
    const { ref, reset } = createMockNavigationRef();
    const alertSpy = mockAlertAndAutoPressOk();

    const { unmount } = await render(
      <Provider store={store}>
        <SessionExpiryListener navigationRef={ref} />
      </Provider>,
    );

    await act(async () => {
      notifySessionExpired();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Session expired",
      "Your session has expired. Please log in again.",
      expect.anything(),
    );

    const state = store.getState().auth;
    expect(mockedClearToken).toHaveBeenCalled();
    expect(state.status).toBe("unauthenticated");
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });

    await act(async () => {
      unmount();
    });
  });

  it("resets the orders state when the session expires, clearing any stale error banner", async () => {
    const store = createTestStore(
      {},
      { order: null, status: "failed", error: "Unauthorized", submittedDelivery: null },
    );
    const { ref } = createMockNavigationRef();
    mockAlertAndAutoPressOk();

    const { unmount } = await render(
      <Provider store={store}>
        <SessionExpiryListener navigationRef={ref} />
      </Provider>,
    );

    await act(async () => {
      notifySessionExpired();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(store.getState().orders).toEqual({
      order: null,
      status: "idle",
      error: null,
      submittedDelivery: null,
    });

    await act(async () => {
      unmount();
    });
  });

  it("does not dispatch logout/resetOrder or reset navigation until the alert is dismissed", async () => {
    const store = createTestStore(
      {},
      { order: null, status: "failed", error: "Unauthorized", submittedDelivery: null },
    );
    const { ref, reset } = createMockNavigationRef();
    let capturedOnPress: (() => void) | undefined;
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      capturedOnPress = buttons?.[0]?.onPress ?? undefined;
    });

    const { unmount } = await render(
      <Provider store={store}>
        <SessionExpiryListener navigationRef={ref} />
      </Provider>,
    );

    await act(async () => {
      notifySessionExpired();
      await Promise.resolve();
    });

    expect(alertSpy).toHaveBeenCalled();
    // Nothing should have happened yet: alert is shown but not dismissed.
    expect(store.getState().auth.status).toBe("authenticated");
    expect(store.getState().orders.status).toBe("failed");
    expect(reset).not.toHaveBeenCalled();

    await act(async () => {
      capturedOnPress?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(store.getState().auth.status).toBe("unauthenticated");
    expect(store.getState().orders.status).toBe("idle");
    expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });

    await act(async () => {
      unmount();
    });
  });

  it("does not react to session expiry after being unmounted", async () => {
    const store = createTestStore({});
    const { ref, reset } = createMockNavigationRef();
    const alertSpy = mockAlertAndAutoPressOk();

    const { unmount } = await render(
      <Provider store={store}>
        <SessionExpiryListener navigationRef={ref} />
      </Provider>,
    );

    await act(async () => {
      unmount();
    });

    await act(async () => {
      notifySessionExpired();
      await Promise.resolve();
    });

    expect(alertSpy).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    expect(store.getState().auth.status).toBe("authenticated");
  });
});
