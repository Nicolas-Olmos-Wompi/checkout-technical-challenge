import { Delivery } from "../model/delivery.entity";

export interface IDeliveryRepository {
  /**
   * Persists a new delivery record.
   * @param delivery - the delivery fields (orderId must already exist).
   * @returns the persisted Delivery with its generated id.
   */
  create(delivery: Omit<Delivery, "id">): Promise<Delivery>;
}
