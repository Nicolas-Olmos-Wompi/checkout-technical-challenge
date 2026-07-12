import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, userEvent } from "@testing-library/react-native";
import CardScreen from "../CardScreen";
import cardReducer from "../../features/card/cardSlice";
import ordersReducer from "../../features/orders/ordersSlice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

type Props = NativeStackScreenProps<RootStackParamList, "Card">;

function createTestStore() {
  return configureStore({
    reducer: { card: cardReducer, orders: ordersReducer },
  });
}

async function renderCardScreen() {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as Props["navigation"];
  const store = createTestStore();

  await render(
    <Provider store={store}>
      <CardScreen navigation={navigation} route={{} as Props["route"]} />
    </Provider>,
  );

  return { navigation, store };
}

describe("CardScreen", () => {
  it("renders the card entry form", async () => {
    await renderCardScreen();

    expect(screen.getByLabelText("Card number")).toBeTruthy();
    expect(screen.getByLabelText("Expiry (MM/YY)")).toBeTruthy();
    expect(screen.getByLabelText("CVC")).toBeTruthy();
    expect(screen.getByLabelText("Cardholder name")).toBeTruthy();
  });

  it("shows the Visa brand logo as a valid Visa number is typed", async () => {
    const user = userEvent.setup();
    await renderCardScreen();

    await user.type(screen.getByLabelText("Card number"), "4242424242424242");

    expect(screen.getByTestId("card-brand-logo-visa")).toBeTruthy();
  });

  it("shows the Mastercard brand logo as a valid Mastercard number is typed", async () => {
    const user = userEvent.setup();
    await renderCardScreen();

    await user.type(screen.getByLabelText("Card number"), "5555555555554444");

    expect(screen.getByTestId("card-brand-logo-mastercard")).toBeTruthy();
  });

  it("shows a generic placeholder logo when no number has been entered", async () => {
    await renderCardScreen();

    expect(screen.getByTestId("card-brand-logo-unknown")).toBeTruthy();
  });

  it("shows field errors and blocks submission for an invalid form", async () => {
    const user = userEvent.setup();
    const { navigation } = await renderCardScreen();

    await user.press(screen.getByTestId("card-submit-button"));

    expect(screen.getByText("Card number is required")).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("dispatches setCard and navigates to PaymentSummary on a valid submission", async () => {
    const user = userEvent.setup();
    const { navigation, store } = await renderCardScreen();

    await user.type(screen.getByLabelText("Card number"), "4242424242424242");
    await user.type(screen.getByLabelText("Expiry (MM/YY)"), "12/99");
    await user.type(screen.getByLabelText("CVC"), "123");
    await user.type(screen.getByLabelText("Cardholder name"), "John Doe");

    await user.press(screen.getByTestId("card-submit-button"));

    expect(store.getState().card.status).toBe("succeeded");
    expect(store.getState().card.brand).toBe("VISA");
    expect(navigation.navigate).toHaveBeenCalledWith("PaymentSummary");
  });

  it("navigates back when the Back button is pressed", async () => {
    const user = userEvent.setup();
    const { navigation } = await renderCardScreen();

    await user.press(screen.getByText("Back"));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
