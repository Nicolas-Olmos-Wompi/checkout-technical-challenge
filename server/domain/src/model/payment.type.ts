import { Order } from "./order.entity";
import { OrderStatus } from "./order-status";

/**
 * Identifies which concrete payment method a pay-order request uses.
 * Adding a new payment method only requires extending this union and
 * providing a new `IPaymentMethodStrategy` implementation — no existing
 * code needs to change.
 */
export type PaymentMethodType = "CARD";

export type CardPaymentCommand = {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
};

/**
 * Generic result of tokenizing a payment method with the gateway. The
 * `displayInfo` map holds method-specific, non-sensitive fields safe to
 * echo back to the client (e.g. `{ brand, lastFour }` for cards).
 */
export type TokenizedPaymentMethod = {
  token: string;
  displayInfo: Record<string, string>;
};

export type PayOrderCommand = {
  userId: string;
  orderId: string;
  paymentMethodType: PaymentMethodType;
  card?: CardPaymentCommand;
};

export type CreateTransactionCommand = {
  amountInCents: number;
  currency: string;
  reference: string;
  signature: string;
  acceptanceToken: string;
  customerEmail: string;
  paymentMethodPayload: Record<string, unknown>;
};

export type TransactionResult = {
  id: string;
  status: OrderStatus;
};

export type PayOrderResult = {
  order: Order;
  paymentMethod: {
    type: PaymentMethodType;
    displayInfo: Record<string, string>;
  };
  timedOut: boolean;
};

export type TransactionStatusPollerConfig = {
  /** Total time budget, in milliseconds, to wait for a final status. */
  maxWaitMs: number;
  /** Interval, in milliseconds, before the first re-check. */
  initialIntervalMs: number;
  /** Multiplier applied to the interval after each attempt. Defaults to 2. */
  backoffFactor?: number;
};

export type PollOutcome = {
  result: TransactionResult;
  timedOut: boolean;
};
