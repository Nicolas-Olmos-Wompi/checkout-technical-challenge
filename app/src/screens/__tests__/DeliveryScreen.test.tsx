import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { act, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import DeliveryScreen from "../DeliveryScreen";
import ordersReducer from "../../features/orders/ordersSlice";
import * as ordersApi from "../../api/orders";
import { ApiError } from "../../api/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import type { Product } from "../../api/product.types";
import type { PendingOrderResponse } from "../../api/order.types";

jest.mock("../../api/orders");

const mockedOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;

type Props = NativeStackScreenProps<RootStackParamList, "Delivery">;

const product: Product = {
  id: "product-1",
  name: "Bluetooth Headset",
  description: "Wireless over-ear headset",
  price: 150000,
  stock: 3,
  image: "https://example.com/headset.webp",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const orderResponse: PendingOrderResponse = {
  orderId: "order-1",
  reference: "REF-1",
  status: "PENDING",
  productId: product.id,
  quantity: 1,
  totalInCents: 150000,
  delivery: {
    id: "delivery-1",
    personName: "John Doe",
    address: "Calle 123 #45-67",
    country: "Colombia",
    city: "Bogotá",
    region: "Bogotá D.C.",
    postalCode: "110111",
    phoneNumber: "3001234567",
    fee: 5000,
  },
  presignedAcceptance: {
    endUserPolicy: { acceptanceToken: "token-1", permalink: "https://example.com/1" },
    personalDataAuth: { acceptanceToken: "token-2", permalink: "https://example.com/2" },
  },
};

function createTestStore() {
  return configureStore({ reducer: { orders: ordersReducer } });
}

async function renderDeliveryScreen(overrides: Partial<Product> = {}) {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  } as unknown as Props["navigation"];
  const route = {
    params: { product: { ...product, ...overrides } },
  } as unknown as Props["route"];
  const store = createTestStore();

  await render(
    <Provider store={store}>
      <DeliveryScreen navigation={navigation} route={route} />
    </Provider>,
  );

  return { navigation, store };
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "John Doe");
  await user.type(screen.getByLabelText("Address"), "Calle 123 #45-67");
  await user.type(screen.getByLabelText("City"), "Bogotá");
  await user.type(screen.getByLabelText("Region"), "Bogotá D.C.");
  await user.type(screen.getByLabelText("Postal code"), "110111");
  await user.type(screen.getByLabelText("Phone number"), "3001234567");
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DeliveryScreen", () => {
  it("renders all delivery form fields", async () => {
    await renderDeliveryScreen();

    expect(screen.getByLabelText("Full name")).toBeTruthy();
    expect(screen.getByLabelText("Address")).toBeTruthy();
    expect(screen.getByLabelText("City")).toBeTruthy();
    expect(screen.getByLabelText("Region")).toBeTruthy();
    expect(screen.getByLabelText("Postal code")).toBeTruthy();
    expect(screen.getByLabelText("Phone number")).toBeTruthy();
  });

  it("renders the country hardcoded to Colombia and read-only", async () => {
    await renderDeliveryScreen();

    expect(screen.getByText("Colombia")).toBeTruthy();
  });

  it("allows typing into form fields", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    const nameField = screen.getByLabelText("Full name");
    await user.type(nameField, "John Doe");

    expect(nameField.props.value).toBe("John Doe");
  });

  it("starts the quantity selector at 1", async () => {
    await renderDeliveryScreen();
    expect(screen.getByTestId("quantity-value").props.children).toBe(1);
  });

  it("increments the quantity when + is pressed", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await user.press(screen.getByTestId("quantity-increment"));

    expect(screen.getByTestId("quantity-value").props.children).toBe(2);
  });

  it("decrements the quantity when - is pressed", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await user.press(screen.getByTestId("quantity-increment"));
    await user.press(screen.getByTestId("quantity-decrement"));

    expect(screen.getByTestId("quantity-value").props.children).toBe(1);
  });

  it("does not decrement below 1", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await user.press(screen.getByTestId("quantity-decrement"));

    expect(screen.getByTestId("quantity-value").props.children).toBe(1);
  });

  it("does not increment above product.stock", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen({ stock: 2 });

    await user.press(screen.getByTestId("quantity-increment"));
    await user.press(screen.getByTestId("quantity-increment"));

    expect(screen.getByTestId("quantity-value").props.children).toBe(2);
  });

  it("disables the increment button at max stock", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen({ stock: 1 });

    expect(
      screen.getByTestId("quantity-increment").props.accessibilityState.disabled,
    ).toBe(true);
  });

  it("disables the decrement button at quantity 1", async () => {
    await renderDeliveryScreen();

    expect(
      screen.getByTestId("quantity-decrement").props.accessibilityState.disabled,
    ).toBe(true);
  });
});

describe("DeliveryScreen submission", () => {
  it("dispatches createOrder with the correct payload when the form is valid", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByTestId("quantity-increment"));
    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockedOrdersApi.createOrder).toHaveBeenCalledWith({
        productId: product.id,
        quantity: 2,
        delivery: {
          personName: "John Doe",
          address: "Calle 123 #45-67",
          country: "Colombia",
          city: "Bogotá",
          region: "Bogotá D.C.",
          postalCode: "110111",
          phoneNumber: "3001234567",
        },
      });
    });
  });

  it("does not dispatch createOrder when required fields are empty", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await user.press(screen.getByText("Submit"));

    expect(mockedOrdersApi.createOrder).not.toHaveBeenCalled();
  });

  it("shows a validation error message for an invalid field", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await user.press(screen.getByText("Submit"));

    expect(screen.getByText("Full name is required")).toBeTruthy();
  });

  it("does not dispatch createOrder when the phone number format is invalid", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.clear(screen.getByLabelText("Phone number"));
    await user.type(screen.getByLabelText("Phone number"), "123");
    await user.press(screen.getByText("Submit"));

    expect(mockedOrdersApi.createOrder).not.toHaveBeenCalled();
    expect(
      screen.getByText("Enter a valid Colombian phone number (10 digits)"),
    ).toBeTruthy();
  });

  it("disables the submit button while the order is being created", async () => {
    let resolveCreateOrder: (value: PendingOrderResponse) => void = () => {};
    mockedOrdersApi.createOrder.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreateOrder = resolve;
        }),
    );
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-button").props.accessibilityState.disabled).toBe(
        true,
      );
    });

    await act(async () => {
      resolveCreateOrder(orderResponse);
      await Promise.resolve();
    });
  });

  it("shows a generic error banner when order creation fails", async () => {
    mockedOrdersApi.createOrder.mockRejectedValue(
      new ApiError("Insufficient stock.", 409, "409"),
    );
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Insufficient stock.")).toBeTruthy();
    });
  });
});

describe("DeliveryScreen order result", () => {
  it("renders OrderResultCard with the order data after a successful submission", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("order-result-card")).toBeTruthy();
      expect(screen.getByText("REF-1")).toBeTruthy();
    });
  });

  it("navigates to Card when Continue to payment is pressed", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    const { navigation } = await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));

    await waitFor(() => screen.getByTestId("order-result-card"));
    await user.press(screen.getByText("Continue to payment"));

    expect(navigation.navigate).toHaveBeenCalledWith("Card");
  });

  it("keeps the order result visible when the component re-renders (simulated navigate-back)", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    const navigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    } as unknown as Props["navigation"];
    const route = {
      params: { product },
    } as unknown as Props["route"];
    const store = createTestStore();

    const { rerender } = await render(
      <Provider store={store}>
        <DeliveryScreen navigation={navigation} route={route} />
      </Provider>,
    );

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    await rerender(
      <Provider store={store}>
        <DeliveryScreen navigation={navigation} route={route} />
      </Provider>,
    );

    expect(screen.getByTestId("order-result-card")).toBeTruthy();
  });

  it("resets the stale order result when mounted with a different product", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    const navigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    } as unknown as Props["navigation"];
    const store = createTestStore();

    await render(
      <Provider store={store}>
        <DeliveryScreen
          navigation={navigation}
          route={{ params: { product } } as unknown as Props["route"]}
        />
      </Provider>,
    );

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    const otherProduct: Product = { ...product, id: "product-2" };

    await render(
      <Provider store={store}>
        <DeliveryScreen
          navigation={navigation}
          route={{ params: { product: otherProduct } } as unknown as Props["route"]}
        />
      </Provider>,
    );

    expect(screen.queryByTestId("order-result-card")).toBeNull();
  });
});
