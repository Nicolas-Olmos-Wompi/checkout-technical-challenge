import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, userEvent } from "@testing-library/react-native";
import PaymentResultScreen from "../PaymentResultScreen";
import cardReducer, { setCard } from "../../features/card/cardSlice";
import ordersReducer from "../../features/orders/ordersSlice";
import paymentReducer from "../../features/payment/paymentSlice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import type { PaymentState } from "../../features/payment/paymentSlice";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

type Props = NativeStackScreenProps<RootStackParamList, "PaymentResult">;

function createTestStore(paymentState: PaymentState) {
  return configureStore({
    reducer: { card: cardReducer, orders: ordersReducer, payment: paymentReducer },
    preloadedState: {
      payment: paymentState,
    },
  });
}

async function renderPaymentResultScreen(paymentState: PaymentState) {
  const store = createTestStore(paymentState);
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
    reset: jest.fn(),
  } as unknown as Props["navigation"];

  await render(
    <Provider store={store}>
      <PaymentResultScreen navigation={navigation} route={{} as Props["route"]} />
    </Provider>,
  );

  return { navigation, store };
}

describe("PaymentResultScreen", () => {
  it("shows a success state when the order was approved", async () => {
    await renderPaymentResultScreen({
      status: "succeeded",
      result: { orderId: "order-1", status: "APPROVED", paymentGatewayTransactionId: "txn-1" },
      error: null,
    });

    expect(screen.getByTestId("payment-result-success")).toBeTruthy();
    expect(screen.getByText("Payment approved")).toBeTruthy();
  });

  it("shows a failure state when the order was declined", async () => {
    await renderPaymentResultScreen({
      status: "failed",
      result: { orderId: "order-1", status: "DECLINED", paymentGatewayTransactionId: "txn-1" },
      error: null,
    });

    expect(screen.getByTestId("payment-result-failure")).toBeTruthy();
  });

  it("shows a failure state with the error message when the API call failed outright", async () => {
    await renderPaymentResultScreen({
      status: "failed",
      result: null,
      error: "the card could not be tokenized",
    });

    expect(screen.getByTestId("payment-result-failure")).toBeTruthy();
    expect(screen.getByText("the card could not be tokenized")).toBeTruthy();
  });

  it("shows a pending/verifying state while polling", async () => {
    await renderPaymentResultScreen({
      status: "polling",
      result: null,
      error: null,
    });

    expect(screen.getByTestId("payment-result-pending")).toBeTruthy();
  });

  it("shows a still-processing terminal state after polling attempts are exhausted", async () => {
    await renderPaymentResultScreen({
      status: "stillPending",
      result: { orderId: "order-1", status: "PENDING", paymentGatewayTransactionId: "txn-1" },
      error: null,
    });

    expect(screen.getByTestId("payment-result-still-pending")).toBeTruthy();
  });

  it("resets order, card, and payment state and navigates to Products on Back to Products", async () => {
    const store = createTestStore({
      status: "succeeded",
      result: { orderId: "order-1", status: "APPROVED", paymentGatewayTransactionId: "txn-1" },
      error: null,
    });
    await store.dispatch(
      setCard({
        cardNumber: "4242424242424242",
        expMonth: "12",
        expYear: "29",
        cvc: "123",
        cardHolder: "John Doe",
      }),
    );

    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      reset: jest.fn(),
    } as unknown as Props["navigation"];

    const user = userEvent.setup();
    await render(
      <Provider store={store}>
        <PaymentResultScreen navigation={navigation} route={{} as Props["route"]} />
      </Provider>,
    );

    await user.press(screen.getByTestId("back-to-products-button"));

    expect(store.getState().card.status).toBe("idle");
    expect(store.getState().card.cardNumber).toBe("");
    expect(store.getState().payment.status).toBe("idle");
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: "Products" }],
    });
  });
});
