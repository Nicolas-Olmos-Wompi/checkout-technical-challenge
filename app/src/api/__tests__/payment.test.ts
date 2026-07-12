import { apiRequest } from "../client";
import { payOrder, getOrder } from "../payment";
import type {
  PayOrderRequest,
  PayOrderResponse,
  OrderResponse,
} from "../order.types";

jest.mock("../client");

const mockedApiRequest = apiRequest as jest.Mock;

describe("payOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const request: PayOrderRequest = {
    paymentMethodType: "CARD",
    card: {
      cardNumber: "4242424242424242",
      expMonth: "12",
      expYear: "29",
      cvc: "123",
      cardHolder: "John Doe",
    },
  };

  const response: PayOrderResponse = {
    orderId: "order-1",
    status: "APPROVED",
    paymentGatewayTransactionId: "txn-1",
    timedOut: false,
    paymentMethod: {
      type: "CARD",
      displayInfo: { brand: "VISA", lastFour: "4242" },
    },
  };

  it("calls apiRequest with the correct method, path, body, and auth flag", async () => {
    mockedApiRequest.mockResolvedValue(response);

    await payOrder("order-1", request);

    expect(mockedApiRequest).toHaveBeenCalledWith("/orders/order-1/pay", {
      method: "POST",
      body: request,
      auth: true,
    });
  });

  it("resolves with the server response on success", async () => {
    mockedApiRequest.mockResolvedValue(response);

    const result = await payOrder("order-1", request);

    expect(result).toEqual(response);
  });

  it("propagates errors thrown by apiRequest", async () => {
    const error = new Error("the card could not be tokenized");
    mockedApiRequest.mockRejectedValue(error);

    await expect(payOrder("order-1", request)).rejects.toThrow(
      "the card could not be tokenized",
    );
  });
});

describe("getOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const response: OrderResponse = {
    orderId: "order-1",
    productId: "product-1",
    quantity: 2,
    totalInCents: 20000,
    status: "APPROVED",
    paymentGatewayTransactionId: "txn-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:05.000Z",
  };

  it("calls apiRequest with the correct method, path, and auth flag", async () => {
    mockedApiRequest.mockResolvedValue(response);

    await getOrder("order-1");

    expect(mockedApiRequest).toHaveBeenCalledWith("/orders/order-1", {
      method: "GET",
      auth: true,
    });
  });

  it("resolves with the server response on success", async () => {
    mockedApiRequest.mockResolvedValue(response);

    const result = await getOrder("order-1");

    expect(result).toEqual(response);
  });

  it("propagates errors thrown by apiRequest", async () => {
    const error = new Error("Order not found");
    mockedApiRequest.mockRejectedValue(error);

    await expect(getOrder("order-1")).rejects.toThrow("Order not found");
  });
});
