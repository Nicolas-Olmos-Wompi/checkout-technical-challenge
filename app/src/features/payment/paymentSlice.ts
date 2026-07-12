import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { payOrder as payOrderApi, getOrder as getOrderApi } from "../../api/payment";
import type { OrderResponse, PayOrderRequest } from "../../api/order.types";
import { ApiError } from "../../api/types";

export type PaymentStatus =
  | "idle"
  | "paying"
  | "polling"
  | "succeeded"
  | "failed"
  | "stillPending";

const FINAL_STATUSES = ["APPROVED", "DECLINED", "VOIDED", "ERROR"] as const;

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 4;

export type PaymentResult = {
  orderId: string;
  status: string;
  paymentGatewayTransactionId: string | null;
};

export type PaymentState = {
  status: PaymentStatus;
  result: PaymentResult | null;
  error: string | null;
};

const initialState: PaymentState = {
  status: "idle",
  result: null,
  error: null,
};

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

function isFinalStatus(status: string): boolean {
  return (FINAL_STATUSES as readonly string[]).includes(status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type PayOrderThunkArg = {
  orderId: string;
  request: PayOrderRequest;
};

type PayOrderThunkResult =
  | { outcome: "final"; result: PaymentResult }
  | { outcome: "stillPending"; result: PaymentResult };

/**
 * Calls the pay API once. If the server responds with `timedOut: true`
 * (meaning the transaction was still pending when the server gave up
 * waiting on the payment gateway), this thunk polls `GET /orders/:id`
 * every 3 seconds for up to 4 attempts looking for a final status.
 * If no final status is reached within that budget, it resolves with
 * a `stillPending` outcome rather than polling indefinitely.
 */
export const payOrder = createAsyncThunk<
  PayOrderThunkResult,
  PayOrderThunkArg,
  { rejectValue: string }
>("payment/payOrder", async ({ orderId, request }, { dispatch, rejectWithValue }) => {
  try {
    const response = await payOrderApi(orderId, request);

    const result: PaymentResult = {
      orderId: response.orderId,
      status: response.status,
      paymentGatewayTransactionId: response.paymentGatewayTransactionId,
    };

    if (!response.timedOut) {
      return { outcome: "final", result };
    }

    dispatch(pollingStarted());

    let latest: OrderResponse | null = null;
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      await sleep(POLL_INTERVAL_MS);
      latest = await getOrderApi(orderId);
      if (isFinalStatus(latest.status)) {
        return {
          outcome: "final",
          result: {
            orderId: latest.orderId,
            status: latest.status,
            paymentGatewayTransactionId: latest.paymentGatewayTransactionId,
          },
        };
      }
    }

    return {
      outcome: "stillPending",
      result: latest
        ? {
            orderId: latest.orderId,
            status: latest.status,
            paymentGatewayTransactionId: latest.paymentGatewayTransactionId,
          }
        : result,
    };
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    pollingStarted(state) {
      state.status = "polling";
    },
    resetPayment() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(payOrder.pending, (state) => {
        state.status = "paying";
        state.error = null;
        state.result = null;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        const { outcome, result } = action.payload;
        state.result = result;
        state.error = null;

        if (outcome === "stillPending") {
          state.status = "stillPending";
          return;
        }

        state.status = result.status === "APPROVED" ? "succeeded" : "failed";
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong. Please try again.";
      });
  },
});

export const { pollingStarted, resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
