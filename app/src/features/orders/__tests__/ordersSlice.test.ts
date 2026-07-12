import { configureStore } from "@reduxjs/toolkit";
import ordersReducer, { createOrder, resetOrder } from "../ordersSlice";
import * as ordersApi from "../../../api/orders";
import { ApiError } from "../../../api/types";
import type { CreateOrderRequest, PendingOrderResponse } from "../../../api/order.types";

jest.mock("../../../api/orders");

const mockedOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;

function createTestStore() {
  return configureStore({ reducer: { orders: ordersReducer } });
}

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

const order: PendingOrderResponse = {
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

describe("ordersSlice reducer", () => {
  it("returns the initial state", () => {
    const store = createTestStore();
    expect(store.getState().orders).toEqual({
      order: null,
      status: "idle",
      error: null,
      submittedDelivery: null,
    });
  });

  describe("createOrder", () => {
    it("sets status to loading and clears previous errors while pending", () => {
      const store = createTestStore();
      store.dispatch({ type: createOrder.pending.type });
      expect(store.getState().orders.status).toBe("loading");
      expect(store.getState().orders.error).toBeNull();
    });

    it("stores the order and sets status to succeeded on fulfillment", () => {
      const store = createTestStore();
      store.dispatch({
        type: createOrder.fulfilled.type,
        payload: order,
        meta: { arg: request },
      });
      const state = store.getState().orders;
      expect(state.status).toBe("succeeded");
      expect(state.order).toEqual(order);
      expect(state.error).toBeNull();
    });

    it("stores the original request's delivery fields as submittedDelivery on fulfillment", () => {
      const store = createTestStore();
      store.dispatch({
        type: createOrder.fulfilled.type,
        payload: order,
        meta: { arg: request },
      });
      const state = store.getState().orders;
      expect(state.submittedDelivery).toEqual({
        personName: request.delivery.personName,
        address: request.delivery.address,
        city: request.delivery.city,
        region: request.delivery.region,
        postalCode: request.delivery.postalCode,
        phoneNumber: request.delivery.phoneNumber,
      });
    });

    it("sets an error message and status to failed on rejection", () => {
      const store = createTestStore();
      store.dispatch({
        type: createOrder.rejected.type,
        payload: "Insufficient stock.",
      });
      const state = store.getState().orders;
      expect(state.status).toBe("failed");
      expect(state.error).toBe("Insufficient stock.");
    });
  });

  describe("resetOrder", () => {
    it("clears the order, status, and error back to initial state", () => {
      const store = createTestStore();
      store.dispatch({
        type: createOrder.fulfilled.type,
        payload: order,
        meta: { arg: request },
      });
      store.dispatch(resetOrder());
      expect(store.getState().orders).toEqual({
        order: null,
        status: "idle",
        error: null,
        submittedDelivery: null,
      });
    });

    it("clears submittedDelivery back to null", () => {
      const store = createTestStore();
      store.dispatch({
        type: createOrder.fulfilled.type,
        payload: order,
        meta: { arg: request },
      });
      store.dispatch(resetOrder());
      expect(store.getState().orders.submittedDelivery).toBeNull();
    });
  });
});

describe("ordersSlice thunk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the API with the request payload and stores the result on success", async () => {
    mockedOrdersApi.createOrder.mockResolvedValue(order);
    const store = createTestStore();

    await store.dispatch(createOrder(request));

    expect(mockedOrdersApi.createOrder).toHaveBeenCalledWith(request);
    const state = store.getState().orders;
    expect(state.status).toBe("succeeded");
    expect(state.order).toEqual(order);
    expect(state.submittedDelivery).toEqual({
      personName: request.delivery.personName,
      address: request.delivery.address,
      city: request.delivery.city,
      region: request.delivery.region,
      postalCode: request.delivery.postalCode,
      phoneNumber: request.delivery.phoneNumber,
    });
  });

  it("stores the server error message on failure", async () => {
    mockedOrdersApi.createOrder.mockRejectedValue(
      new ApiError("Insufficient stock.", 409, "409"),
    );
    const store = createTestStore();

    await store.dispatch(createOrder(request));

    const state = store.getState().orders;
    expect(state.status).toBe("failed");
    expect(state.error).toBe("Insufficient stock.");
  });

  it("stores a generic error message when the error is not an ApiError", async () => {
    mockedOrdersApi.createOrder.mockRejectedValue(new Error("network down"));
    const store = createTestStore();

    await store.dispatch(createOrder(request));

    const state = store.getState().orders;
    expect(state.status).toBe("failed");
    expect(state.error).toBe("Something went wrong. Please try again.");
  });
});
