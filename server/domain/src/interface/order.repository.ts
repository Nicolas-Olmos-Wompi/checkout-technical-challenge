import { Delivery } from "../model/delivery.entity";
import { Order } from "../model/order.entity";

export interface IOrderRepository {
  /**
   * Persists a new order together with its delivery in a single transaction.
   * @param {object} params - the order and delivery data to persist.
   * @param {Omit<Order, "id" | "createdAt" | "updatedAt">} params.order - the order fields (status defaults to PENDING).
   * @param {Omit<Delivery, "id" | "orderId">} params.delivery - the delivery fields.
   * @returns the persisted `Order` and `Delivery`.
   */
  create(params: {
    order: Omit<Order, "id" | "createdAt" | "updatedAt">;
    delivery: Omit<Delivery, "id" | "orderId">;
  }): Promise<{ order: Order; delivery: Delivery }>;
}
