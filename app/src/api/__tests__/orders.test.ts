import { apiRequest } from "../client";
import { createOrder } from "../orders";
import type { CreateOrderRequest, PendingOrderResponse } from "../order.types";

jest.mock("../client");

const mockedApiRequest = apiRequest as jest.Mock;

describe("createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const request: CreateOrderRequest = {
    productId: "11111111-1111-1111-1111-111111111111",
    quantity: 2,
    delivery: {
      personName: "John Doe",
      address: "Calle 123",
      country: "Colombia",
      city: "Bogotá",
      region: "Bogotá D.C.",
      postalCode: "110111",
      phoneNumber: "3001234567",
    },
  };

  const response: PendingOrderResponse = {
    orderId: "order-1",
    reference: "REF-1",
    status: "PENDING",
    productId: request.productId,
    quantity: 2,
    totalInCents: 20000,
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

  it("calls apiRequest with the correct method, path, body, and auth flag", async () => {
    mockedApiRequest.mockResolvedValue(response);

    await createOrder(request);

    expect(mockedApiRequest).toHaveBeenCalledWith("/orders", {
      method: "POST",
      body: request,
      auth: true,
    });
  });

  it("resolves with the server response on success", async () => {
    mockedApiRequest.mockResolvedValue(response);

    const result = await createOrder(request);

    expect(result).toEqual(response);
  });

  it("propagates errors thrown by apiRequest", async () => {
    const error = new Error("Insufficient stock");
    mockedApiRequest.mockRejectedValue(error);

    await expect(createOrder(request)).rejects.toThrow("Insufficient stock");
  });
});
