import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { Provider, useSelector } from "react-redux";
import { createStore } from "../store";

describe("store", () => {
  it("initializes with the expected slice shapes", () => {
    const store = createStore();
    const state = store.getState();

    expect(state.auth).toEqual({
      status: "idle",
      user: null,
      token: null,
      error: null,
    });
    expect(state.loginForm).toEqual({
      username: "",
      password: "",
      fieldErrors: {},
    });
    expect(state.signupForm).toEqual({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fieldErrors: {},
    });
    expect(state.products).toEqual({
      items: [],
      page: 1,
      pageSize: 6,
      total: 0,
      totalPages: 0,
      filters: { name: "", minPrice: "", maxPrice: "" },
      status: "idle",
      error: null,
    });
    expect(state.orders).toEqual({
      order: null,
      status: "idle",
      error: null,
    });
  });

  it("makes state available to descendants via Provider", async () => {
    const store = createStore();

    function Probe() {
      const status = useSelector((state: ReturnType<typeof store.getState>) => state.auth.status);
      return <Text>{status}</Text>;
    }

    await render(
      <Provider store={store}>
        <Probe />
      </Provider>,
    );

    expect(screen.getByText("idle")).toBeTruthy();
  });
});
