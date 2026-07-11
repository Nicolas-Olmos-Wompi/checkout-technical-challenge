import { Order } from "../model/order.entity";

export interface IOrderRepository {
  /**
   * Persists a new order.
   * @param order - the order fields to persist.
   * @returns the persisted Order with generated id and timestamps.
   */
  create(
    order: Omit<Order, "id" | "createdAt" | "updatedAt">,
  ): Promise<Order>;
}
