import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import PaymentSummaryScreen from "../PaymentSummaryScreen";
import cardReducer, { setCard } from "../../features/card/cardSlice";
import ordersReducer from "../../features/orders/ordersSlice";
import paymentReducer from "../../features/payment/paymentSlice";
import * as paymentApi from "../../api/payment";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import type { PendingOrderResponse, PayOrderResponse } from "../../api/order.types";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("../../api/payment");

type Props = NativeStackScreenProps<RootStackParamList, "PaymentSummary">;

const order: PendingOrderResponse = {
  orderId: "order-1",
  reference: "ref-1",
  status: "PENDING",
  productId: "product-1",
  quantity: 2,
  totalInCents: 150000,
  delivery: {
    id: "delivery-1",
    personName: "John Doe",
    address: "123 Main St",
    country: "Colombia",
    city: "Bogota",
    region: "Bogota D.C.",
    postalCode: "110111",
    phoneNumber: "+573000000000",
    fee: 10000,
  },
  presignedAcceptance: {
    endUserPolicy: { acceptanceToken: "token-1", permalink: "https://example.com" },
    personalDataAuth: { acceptanceToken: "token-2", permalink: "https://example.com" },
  },
};

function createTestStore() {
  return configureStore({
    reducer: { card: cardReducer, orders: ordersReducer, payment: paymentReducer },
    preloadedState: {
      orders: {
        order,
        status: "succeeded" as const,
        error: null,
        submittedDelivery: null,
      },
    },
  });
}

async function renderPaymentSummaryScreen(store = createTestStore()) {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as Props["navigation"];

  await render(
    <Provider store={store}>
      <PaymentSummaryScreen navigation={navigation} route={{} as Props["route"]} />
    </Provider>,
  );

  return { navigation, store };
}

describe("PaymentSummaryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the order total inside the backdrop summary", async () => {
    const store = createTestStore();
    await store.dispatch(
      setCard({
        cardNumber: "4242424242424242",
        expMonth: "12",
        expYear: "29",
        cvc: "123",
        cardHolder: "John Doe",
      }),
    );
    await renderPaymentSummaryScreen(store);

    expect(screen.getByTestId("backdrop-toggle")).toBeTruthy();
    expect(screen.getByText("$1.500")).toBeTruthy();
  });

  it("shows masked card info with brand logo, last four digits, and holder name", async () => {
    const store = createTestStore();
    await store.dispatch(
      setCard({
        cardNumber: "4242424242424242",
        expMonth: "12",
        expYear: "29",
        cvc: "123",
        cardHolder: "John Doe",
      }),
    );
    await renderPaymentSummaryScreen(store);

    expect(screen.getByTestId("card-brand-logo-visa")).toBeTruthy();
    expect(screen.getByText("**** **** **** 4242")).toBeTruthy();
    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("12/29")).toBeTruthy();
  });

  it("renders an enabled Pay button when order and card data are present", async () => {
    const store = createTestStore();
    await store.dispatch(
      setCard({
        cardNumber: "4242424242424242",
        expMonth: "12",
        expYear: "29",
        cvc: "123",
        cardHolder: "John Doe",
      }),
    );
    await renderPaymentSummaryScreen(store);

    const payButton = screen.getByTestId("pay-button");
    expect(payButton).toBeTruthy();
    expect(payButton.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("dispatches the pay thunk with the full card data and navigates to PaymentResult on press", async () => {
    const response: PayOrderResponse = {
      orderId: order.orderId,
      status: "APPROVED",
      paymentGatewayTransactionId: "txn-1",
      timedOut: false,
      paymentMethod: { type: "CARD", displayInfo: { brand: "VISA", lastFour: "4242" } },
    };
    (paymentApi.payOrder as jest.Mock).mockResolvedValue(response);

    const store = createTestStore();
    await store.dispatch(
      setCard({
        cardNumber: "4242424242424242",
        expMonth: "12",
        expYear: "29",
        cvc: "123",
        cardHolder: "John Doe",
      }),
    );
    const user = userEvent.setup();
    const { navigation } = await renderPaymentSummaryScreen(store);

    await user.press(screen.getByTestId("pay-button"));

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith("PaymentResult");
    });

    expect(paymentApi.payOrder).toHaveBeenCalledWith(order.orderId, {
      paymentMethodType: "CARD",
      card: {
        cardNumber: "4242424242424242",
        expMonth: "12",
        expYear: "29",
        cvc: "123",
        cardHolder: "John Doe",
      },
    });
    expect(store.getState().payment.status).toBe("succeeded");
  });

  it("disables the Pay button and shows a loading state while paying", async () => {
    let resolvePayment: (value: PayOrderResponse) => void = () => {};
    (paymentApi.payOrder as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolvePayment = resolve;
      }),
    );

    const store = createTestStore();
    await store.dispatch(
      setCard({
        cardNumber: "4242424242424242",
        expMonth: "12",
        expYear: "29",
        cvc: "123",
        cardHolder: "John Doe",
      }),
    );
    const user = userEvent.setup();
    await renderPaymentSummaryScreen(store);

    await user.press(screen.getByTestId("pay-button"));

    await waitFor(() => {
      expect(store.getState().payment.status).toBe("paying");
    });

    resolvePayment({
      orderId: order.orderId,
      status: "APPROVED",
      paymentGatewayTransactionId: "txn-1",
      timedOut: false,
      paymentMethod: { type: "CARD", displayInfo: {} },
    });
  });
});
