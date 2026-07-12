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
