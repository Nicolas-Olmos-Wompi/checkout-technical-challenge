import { configureStore } from "@reduxjs/toolkit";
import * as paymentApi from "../../../api/payment";
import paymentReducer, { payOrder, resetPayment } from "../paymentSlice";
import type { PayOrderRequest, PayOrderResponse, OrderResponse } from "../../../api/order.types";
import { ApiError } from "../../../api/types";

jest.mock("../../../api/payment");

function createTestStore() {
  return configureStore({ reducer: { payment: paymentReducer } });
}

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

function makePayResponse(overrides: Partial<PayOrderResponse>): PayOrderResponse {
  return {
    orderId: "order-1",
    status: "PENDING",
    paymentGatewayTransactionId: "txn-1",
    timedOut: false,
    paymentMethod: { type: "CARD", displayInfo: { brand: "VISA", lastFour: "4242" } },
    ...overrides,
  };
}

function makeOrderResponse(overrides: Partial<OrderResponse>): OrderResponse {
  return {
    orderId: "order-1",
    productId: "product-1",
    quantity: 1,
    totalInCents: 10000,
    status: "PENDING",
    paymentGatewayTransactionId: "txn-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("paymentSlice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("has an idle initial state", () => {
    const store = createTestStore();
    expect(store.getState().payment.status).toBe("idle");
  });

  it("happy path: resolves immediately with APPROVED status when timedOut is false", async () => {
    (paymentApi.payOrder as jest.Mock).mockResolvedValue(
      makePayResponse({ status: "APPROVED", timedOut: false }),
    );
    const store = createTestStore();

    await store.dispatch(payOrder({ orderId: "order-1", request }));

    const state = store.getState().payment;
    expect(state.status).toBe("succeeded");
    expect(state.result?.status).toBe("APPROVED");
    expect(paymentApi.getOrder).not.toHaveBeenCalled();
  });

  it("unhappy path: resolves as failed with an error message when the API call rejects", async () => {
    (paymentApi.payOrder as jest.Mock).mockRejectedValue(
      new ApiError("the card could not be tokenized", 422),
    );
    const store = createTestStore();

    await store.dispatch(payOrder({ orderId: "order-1", request }));

    const state = store.getState().payment;
    expect(state.status).toBe("failed");
    expect(state.error).toBe("the card could not be tokenized");
  });

  it("unhappy path: resolves as failed when the final status is DECLINED", async () => {
    (paymentApi.payOrder as jest.Mock).mockResolvedValue(
      makePayResponse({ status: "DECLINED", timedOut: false }),
    );
    const store = createTestStore();

    await store.dispatch(payOrder({ orderId: "order-1", request }));

    const state = store.getState().payment;
    expect(state.status).toBe("failed");
    expect(state.result?.status).toBe("DECLINED");
  });

  it("polls getOrder every 3s (max 4 attempts) and resolves once a final status is reached", async () => {
    jest.useFakeTimers();
    (paymentApi.payOrder as jest.Mock).mockResolvedValue(
      makePayResponse({ status: "PENDING", timedOut: true }),
    );
    (paymentApi.getOrder as jest.Mock)
      .mockResolvedValueOnce(makeOrderResponse({ status: "PENDING" }))
      .mockResolvedValueOnce(makeOrderResponse({ status: "APPROVED" }));

    const store = createTestStore();
    const dispatchPromise = store.dispatch(payOrder({ orderId: "order-1", request }));

    await jest.advanceTimersByTimeAsync(3000);
    await jest.advanceTimersByTimeAsync(3000);
    await dispatchPromise;

    const state = store.getState().payment;
    expect(paymentApi.getOrder).toHaveBeenCalledTimes(2);
    expect(state.status).toBe("succeeded");
    expect(state.result?.status).toBe("APPROVED");
  });

  it("stops polling and reports stillPending after 4 attempts with no final status", async () => {
    jest.useFakeTimers();
    (paymentApi.payOrder as jest.Mock).mockResolvedValue(
      makePayResponse({ status: "PENDING", timedOut: true }),
    );
    (paymentApi.getOrder as jest.Mock).mockResolvedValue(
      makeOrderResponse({ status: "PENDING" }),
    );

    const store = createTestStore();
    const dispatchPromise = store.dispatch(payOrder({ orderId: "order-1", request }));

    await jest.advanceTimersByTimeAsync(3000);
    await jest.advanceTimersByTimeAsync(3000);
    await jest.advanceTimersByTimeAsync(3000);
    await jest.advanceTimersByTimeAsync(3000);
    await dispatchPromise;

    const state = store.getState().payment;
    expect(paymentApi.getOrder).toHaveBeenCalledTimes(4);
    expect(state.status).toBe("stillPending");
  });

  it("sets status to polling while awaiting a pending poll attempt", async () => {
    jest.useFakeTimers();
    (paymentApi.payOrder as jest.Mock).mockResolvedValue(
      makePayResponse({ status: "PENDING", timedOut: true }),
    );
    (paymentApi.getOrder as jest.Mock).mockResolvedValue(
      makeOrderResponse({ status: "PENDING" }),
    );

    const store = createTestStore();
    const dispatchPromise = store.dispatch(payOrder({ orderId: "order-1", request }));
    await Promise.resolve();

    expect(store.getState().payment.status).toBe("polling");

    await jest.advanceTimersByTimeAsync(3000 * 4);
    await dispatchPromise;
  });

  it("resets payment state", async () => {
    (paymentApi.payOrder as jest.Mock).mockResolvedValue(
      makePayResponse({ status: "APPROVED", timedOut: false }),
    );
    const store = createTestStore();
    await store.dispatch(payOrder({ orderId: "order-1", request }));

    store.dispatch(resetPayment());

    expect(store.getState().payment.status).toBe("idle");
    expect(store.getState().payment.result).toBeNull();
  });
});
