import React from "react";
import { render, screen, userEvent } from "@testing-library/react-native";
import OrderResultCard from "../OrderResultCard";
import type { PendingOrderResponse } from "../../api/order.types";

const order: PendingOrderResponse = {
  orderId: "order-1",
  reference: "REF-12345",
  status: "PENDING",
  productId: "product-1",
  quantity: 2,
  totalInCents: 150000,
  delivery: {
    id: "delivery-1",
    personName: "John Doe",
    address: "Calle 123",
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

describe("OrderResultCard", () => {
  it("renders the order status", async () => {
    await render(<OrderResultCard order={order} onContinue={jest.fn()} />);
    expect(screen.getByText("PENDING")).toBeTruthy();
  });

  it("renders the formatted total in COP", async () => {
    await render(<OrderResultCard order={order} onContinue={jest.fn()} />);
    expect(screen.getByText("$1.500")).toBeTruthy();
  });

  it("renders the product price as total minus delivery fee", async () => {
    await render(<OrderResultCard order={order} onContinue={jest.fn()} />);
    // totalInCents 150000 - fee 5000 = 145000 -> $1.450
    expect(screen.getByText("$1.450")).toBeTruthy();
  });

  it("renders the delivery fee formatted", async () => {
    await render(<OrderResultCard order={order} onContinue={jest.fn()} />);
    expect(screen.getByText("$50")).toBeTruthy();
  });

  it("shows a fallback instead of a misleading $0 fee when fee is null", async () => {
    const orderWithoutFee: PendingOrderResponse = {
      ...order,
      delivery: { ...order.delivery, fee: null },
    };
    await render(<OrderResultCard order={orderWithoutFee} onContinue={jest.fn()} />);
    expect(screen.getByText("Calculating...")).toBeTruthy();
    expect(screen.queryByText("$0")).toBeNull();
  });

  it("renders a Continue to payment button", async () => {
    await render(<OrderResultCard order={order} onContinue={jest.fn()} />);
    expect(screen.getByText("Continue to payment")).toBeTruthy();
  });

  it("calls onContinue when the button is pressed", async () => {
    const user = userEvent.setup();
    const onContinue = jest.fn();
    await render(<OrderResultCard order={order} onContinue={onContinue} />);

    await user.press(screen.getByText("Continue to payment"));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
