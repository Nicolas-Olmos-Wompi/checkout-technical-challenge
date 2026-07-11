import { Order } from "../model/order.entity";
import { OrderStatus } from "../model/order-status";

export interface IOrderRepository {
  /**
   * Persists a new order.
   * @param order - the order fields to persist.
   * @returns the persisted Order with generated id and timestamps.
   */
  create(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order>;

  /**
   * Finds a single order by its unique id.
   * @param {string} id - the order id to search for.
   * @returns the matching `Order`, or `null` if none exists.
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Updates an order's status and, optionally, its payment gateway
   * transaction id.
   * @param {string} id - the order id to update.
   * @param {object} changes - the fields to update.
   * @param {OrderStatus} changes.status - the new order status.
   * @param {string | null} [changes.paymentGatewayTransactionId] - the
   * payment gateway transaction id to persist, if provided.
   * @returns the updated `Order`.
   */
  updateStatus(
    id: string,
    changes: {
      status: OrderStatus;
      paymentGatewayTransactionId?: string | null;
    },
  ): Promise<Order>;
}
