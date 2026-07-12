import { apiRequest } from "./client";
import { CreateOrderRequest, PendingOrderResponse } from "./order.types";

export function createOrder(
  request: CreateOrderRequest,
): Promise<PendingOrderResponse> {
  return apiRequest<PendingOrderResponse>("/orders", {
    method: "POST",
    body: request,
    auth: true,
  });
}
