import { apiRequest } from "./client";
import { OrderResponse, PayOrderRequest, PayOrderResponse } from "./order.types";

export function payOrder(
  orderId: string,
  request: PayOrderRequest,
): Promise<PayOrderResponse> {
  return apiRequest<PayOrderResponse>(`/orders/${orderId}/pay`, {
    method: "POST",
    body: request,
    auth: true,
  });
}

export function getOrder(orderId: string): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/orders/${orderId}`, {
    method: "GET",
    auth: true,
  });
}
