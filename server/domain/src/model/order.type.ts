import { Delivery } from "./delivery.entity";
import { Order } from "./order.entity";

export type CreateDeliveryCommand = {
  personName: string;
  address: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  phoneNumber: string;
  fee?: number;
};

export type CreateOrderCommand = {
  userId: string;
  productId: string;
  quantity: number;
  delivery: CreateDeliveryCommand;
};

export type AcceptanceToken = {
  acceptanceToken: string;
  permalink: string;
};

export type MerchantAcceptance = {
  endUserPolicy: AcceptanceToken;
  personalDataAuth: AcceptanceToken;
};

export type CreateOrderResult = {
  order: Order;
  delivery: Delivery;
  acceptance: MerchantAcceptance;
};
