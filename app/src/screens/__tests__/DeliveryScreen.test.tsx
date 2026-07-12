import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
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
    const user = userEvent.setup();
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
    const user = userEvent.setup();
    await renderDeliveryScreen();

    expect(
      screen.getByTestId("quantity-decrement").props.accessibilityState.disabled,
    ).toBe(true);
  });

  it("shows the subtotal reflecting product price times quantity on initial render", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    // product.price 150000 * quantity 1 = 150000 -> $1.500
    expect(screen.getByText("Subtotal (excl. delivery fee): $1.500")).toBeTruthy();
  });

  it("updates the subtotal when the quantity is incremented", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await user.press(screen.getByTestId("quantity-increment"));

    // product.price 150000 * quantity 2 = 300000 -> $3.000
    expect(screen.getByText("Subtotal (excl. delivery fee): $3.000")).toBeTruthy();
  });

  it("updates the subtotal when the quantity is decremented", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await user.press(screen.getByTestId("quantity-increment"));
    await user.press(screen.getByTestId("quantity-increment"));
    await user.press(screen.getByTestId("quantity-decrement"));

    // product.price 150000 * quantity 2 = 300000 -> $3.000
    expect(screen.getByText("Subtotal (excl. delivery fee): $3.000")).toBeTruthy();
  });

  it("renders the quantity stepper and subtotal inside the Backdrop back layer", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    const backLayer = screen.getByTestId("backdrop-back-layer");

    expect(within(backLayer).getByTestId("quantity-decrement")).toBeTruthy();
    expect(within(backLayer).getByTestId("quantity-value")).toBeTruthy();
    expect(within(backLayer).getByTestId("quantity-increment")).toBeTruthy();
  });

  it("renders the submit button inside the sticky footer, outside the Backdrop", async () => {
    await renderDeliveryScreen();

    const footer = screen.getByTestId("delivery-footer");

    expect(within(footer).getByTestId("submit-button")).toBeTruthy();
  });

  it("does not render the quantity stepper inside the scrollable form content", async () => {
    const user = userEvent.setup();
    await renderDeliveryScreen();

    const formContent = screen.getByTestId("delivery-form-content");

    expect(within(formContent).queryByTestId("quantity-increment")).toBeNull();
  });

  it("shows the quantity stepper and subtotal by default, without needing to toggle Order summary", async () => {
    await renderDeliveryScreen();

    expect(screen.getByTestId("quantity-increment")).toBeTruthy();
    expect(
      screen.getByText("Subtotal (excl. delivery fee): $1.500"),
    ).toBeTruthy();
  });

  it("renders the product name inside the scrollable form content", async () => {
    await renderDeliveryScreen();

    const formContent = screen.getByTestId("delivery-form-content");

    expect(within(formContent).getByText(product.name)).toBeTruthy();
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

  it("disables the submit button while status is succeeded, preventing duplicate orders", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-button").props.accessibilityState.disabled).toBe(
        true,
      );
    });
  });

  it("re-enables the submit button after dismissing the modal and editing the form", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    await user.type(screen.getByLabelText("Full name"), " Jr.");
    const backdrop = screen.queryByTestId("receipt-backdrop");
    if (backdrop) {
      await user.press(backdrop);
    }

    expect(
      screen.getByTestId("submit-button").props.accessibilityState.disabled,
    ).toBe(false);
  });

  it("re-enables the submit button when the quantity is incremented after a successful submission", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    await user.press(screen.getByTestId("quantity-increment"));

    await waitFor(() => {
      expect(
        screen.getByTestId("submit-button").props.accessibilityState.disabled,
      ).toBe(false);
    });
  });

  it("re-enables the submit button when a text field is edited after a successful submission, without dismissing the modal", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    await user.type(screen.getByLabelText("Full name"), " Jr.");

    await waitFor(() => {
      expect(
        screen.getByTestId("submit-button").props.accessibilityState.disabled,
      ).toBe(false);
    });
  });

  it("keeps the submit button disabled and the receipt intact when nothing is edited after success", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    const { store } = await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    expect(
      screen.getByTestId("submit-button").props.accessibilityState.disabled,
    ).toBe(true);
    expect(screen.getByTestId("order-result-card")).toBeTruthy();
    expect(store.getState().orders.order).not.toBeNull();
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
      expect(screen.getByText("PENDING")).toBeTruthy();
    });
  });

  it("shows the receipt modal as visible after a successful submission", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("receipt-backdrop")).toBeTruthy();
    });
  });

  it("does not show the receipt modal when status is not succeeded", async () => {
    await renderDeliveryScreen();

    expect(screen.queryByTestId("receipt-backdrop")).toBeNull();
  });

  it("hides the modal when the backdrop is pressed", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    await user.press(screen.getByTestId("receipt-backdrop"));

    expect(screen.queryByTestId("receipt-backdrop")).toBeNull();
  });

  it("resets the order in the store when the backdrop is dismissed, even without editing the form", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    const { store } = await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    await user.press(screen.getByTestId("receipt-backdrop"));

    expect(store.getState().orders.order).toBeNull();
    expect(store.getState().orders.status).toBe("idle");
  });

  it("resets the order in the store when the backdrop is dismissed after editing the form", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    const { store } = await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    await user.type(screen.getByLabelText("Full name"), " Jr.");
    const backdrop = screen.queryByTestId("receipt-backdrop");
    if (backdrop) {
      await user.press(backdrop);
    }

    expect(store.getState().orders.order).toBeNull();
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

  it("BUG REPRO: allows submitting a new order when mounted fresh with a stale succeeded order for the same product still in the store", async () => {
    // Simulates: user completed a payment for this product, then navigated
    // back to Products via the hardware back button (or any path other than
    // PaymentResultScreen's "Back to Products"), bypassing the resetOrder()
    // call. A brand new DeliveryScreen instance is then mounted for the same
    // product, but Redux still holds the old succeeded order.
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const navigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    } as unknown as Props["navigation"];
    const route = {
      params: { product },
    } as unknown as Props["route"];
    const store = createTestStore();
    store.dispatch({
      type: "orders/createOrder/fulfilled",
      payload: orderResponse,
      meta: {
        arg: {
          productId: product.id,
          quantity: 1,
          delivery: {
            personName: "John Doe",
            address: "Calle 123 #45-67",
            country: "Colombia",
            city: "Bogotá",
            region: "Bogotá D.C.",
            postalCode: "110111",
            phoneNumber: "3001234567",
          },
        },
      },
    });

    const user = userEvent.setup();
    await render(
      <Provider store={store}>
        <DeliveryScreen navigation={navigation} route={route} />
      </Provider>,
    );

    // On a fresh mount, submittedQuantity/isModalDismissed reinitialize to
    // their defaults, so quantity (1) !== submittedQuantity (null) trips the
    // "form changed since submission" effect and clears the stale order
    // before the receipt would ever render — this path self-heals.
    await waitFor(() => {
      expect(store.getState().orders.status).toBe("idle");
    });
    expect(screen.queryByTestId("order-result-card")).toBeNull();

    await fillValidForm(user);

    await waitFor(() => {
      expect(
        screen.getByTestId("submit-button").props.accessibilityState.disabled,
      ).toBe(false);
    });

    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockedOrdersApi.createOrder).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByTestId("order-result-card")).toBeTruthy();
  });

  it("re-enables the submit button after dismissing the receipt without changing the form", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    const { store } = await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    // Dismiss the receipt without touching any field or the quantity —
    // the user just wants to close the confirmation and place another order.
    await user.press(screen.getByTestId("receipt-backdrop"));

    expect(screen.queryByTestId("receipt-backdrop")).toBeNull();
    // Dismissing the receipt always clears the completed order, regardless
    // of whether the form changed, so Submit is usable again.
    expect(store.getState().orders.status).toBe("idle");

    // The user now tries to submit again (e.g. to place a second order).
    expect(
      screen.getByTestId("submit-button").props.accessibilityState.disabled,
    ).toBe(false);

    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockedOrdersApi.createOrder).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByTestId("order-result-card")).toBeTruthy();
  });

  it("allows submitting a new order after returning from Card without dismissing the receipt", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(orderResponse);
    const user = userEvent.setup();
    const { store } = await renderDeliveryScreen();

    await fillValidForm(user);
    await user.press(screen.getByText("Submit"));
    await waitFor(() => screen.getByTestId("order-result-card"));

    // Simulate the user going Delivery -> Card -> Back (goBack), without ever
    // dismissing the receipt modal (e.g. by tapping the backdrop or editing
    // the form). The same DeliveryScreen instance remains mounted the whole
    // time, so its local state (isModalDismissed, submittedQuantity) and the
    // Redux orders state are untouched by this round trip.

    const secondOrderResponse: PendingOrderResponse = {
      ...orderResponse,
      orderId: "order-2",
      reference: "REF-2",
    };
    mockedOrdersApi.createOrder.mockResolvedValue(secondOrderResponse);

    // The user now wants to place a second, separate order for more units
    // of the same product and expects Submit to work again.
    await user.press(screen.getByTestId("quantity-increment"));

    await waitFor(() => {
      expect(
        screen.getByTestId("submit-button").props.accessibilityState.disabled,
      ).toBe(false);
    });

    await user.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockedOrdersApi.createOrder).toHaveBeenCalledTimes(2);
    });
    expect(store.getState().orders.order?.orderId).toBe("order-2");
    expect(screen.getByTestId("order-result-card")).toBeTruthy();
  });
});
