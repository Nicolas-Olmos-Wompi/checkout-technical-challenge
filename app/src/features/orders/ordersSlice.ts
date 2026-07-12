import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createOrder as createOrderApi } from "../../api/orders";
import type { CreateOrderRequest, PendingOrderResponse } from "../../api/order.types";
import { ApiError } from "../../api/types";
import type { DeliveryFormFields } from "../../utils/deliveryValidation";

export type OrdersStatus = "idle" | "loading" | "succeeded" | "failed";

export type OrdersState = {
  order: PendingOrderResponse | null;
  status: OrdersStatus;
  error: string | null;
  submittedDelivery: DeliveryFormFields | null;
  acceptedEndUserPolicy: boolean;
  acceptedPersonalDataAuth: boolean;
};

const initialState: OrdersState = {
  order: null,
  status: "idle",
  error: null,
  submittedDelivery: null,
  acceptedEndUserPolicy: false,
  acceptedPersonalDataAuth: false,
};

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

export const createOrder = createAsyncThunk<
  PendingOrderResponse,
  CreateOrderRequest,
  { rejectValue: string }
>("orders/createOrder", async (request, { rejectWithValue }) => {
  try {
    return await createOrderApi(request);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrder(state) {
      state.order = null;
      state.status = "idle";
      state.error = null;
      state.submittedDelivery = null;
      state.acceptedEndUserPolicy = false;
      state.acceptedPersonalDataAuth = false;
    },
    setAcceptedEndUserPolicy(state, action: PayloadAction<boolean>) {
      state.acceptedEndUserPolicy = action.payload;
    },
    setAcceptedPersonalDataAuth(state, action: PayloadAction<boolean>) {
      state.acceptedPersonalDataAuth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        createOrder.fulfilled,
        (state, action: PayloadAction<PendingOrderResponse, string, { arg: CreateOrderRequest }>) => {
          state.status = "succeeded";
          state.order = action.payload;
          state.error = null;
          state.acceptedEndUserPolicy = false;
          state.acceptedPersonalDataAuth = false;
          const { delivery } = action.meta.arg;
          state.submittedDelivery = {
            personName: delivery.personName,
            address: delivery.address,
            city: delivery.city,
            region: delivery.region,
            postalCode: delivery.postalCode,
            phoneNumber: delivery.phoneNumber,
          };
        },
      )
      .addCase(createOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong. Please try again.";
      });
  },
});

export const { resetOrder, setAcceptedEndUserPolicy, setAcceptedPersonalDataAuth } =
  ordersSlice.actions;
export default ordersSlice.reducer;
