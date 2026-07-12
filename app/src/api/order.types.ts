/**
 * Mirrors server DTOs in server/src/model/dto/order.type.ts
 * `fee` is intentionally omitted from CreateDeliveryRequest — it is optional
 * server-side and we always let the server compute it.
 */
export type CreateDeliveryRequest = {
  personName: string;
  address: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  phoneNumber: string;
};

export type CreateOrderRequest = {
  productId: string;
  quantity: number;
  delivery: CreateDeliveryRequest;
};

export type DeliveryResponse = {
  id: string;
  personName: string;
  address: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  phoneNumber: string;
  fee: number | null;
};

export type AcceptanceTokenResponse = {
  acceptanceToken: string;
  permalink: string;
};

export type PendingOrderResponse = {
  orderId: string;
  reference: string;
  status: string;
  productId: string;
  quantity: number;
  totalInCents: number;
  delivery: DeliveryResponse;
  presignedAcceptance: {
    endUserPolicy: AcceptanceTokenResponse;
    personalDataAuth: AcceptanceTokenResponse;
  };
};

/**
 * Mirrors server DTOs in server/src/model/dto/order.type.ts
 */
export type CardPaymentRequest = {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
};

export type PayOrderRequest = {
  paymentMethodType: "CARD";
  card: CardPaymentRequest;
};

export type PayOrderResponse = {
  orderId: string;
  status: string;
  paymentGatewayTransactionId: string | null;
  timedOut: boolean;
  paymentMethod: {
    type: string;
    displayInfo: Record<string, string>;
  };
};

export type OrderResponse = {
  orderId: string;
  productId: string;
  quantity: number;
  totalInCents: number;
  status: string;
  paymentGatewayTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
};
