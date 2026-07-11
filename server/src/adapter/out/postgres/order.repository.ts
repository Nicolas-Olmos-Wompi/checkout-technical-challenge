import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { IOrderRepository } from "domain/src/interface/order.repository";
import { Order } from "domain/src/model/order.entity";
import { Delivery } from "domain/src/model/delivery.entity";
import { OrderEntityMapper } from "../../../model/mapper/order-entity.mapper";
import { DeliveryEntityMapper } from "../../../model/mapper/delivery-entity.mapper";
import { OrderEntity } from "./order.entity";
import { DeliveryEntity } from "./delivery.entity";

export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(params: {
    order: Omit<Order, "id" | "createdAt" | "updatedAt">;
    delivery: Omit<Delivery, "id" | "orderId">;
  }): Promise<{ order: Order; delivery: Delivery }> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(OrderEntity);
      const deliveryRepo = manager.getRepository(DeliveryEntity);

      const orderEntity = orderRepo.create(params.order);
      const savedOrder = await orderRepo.save(orderEntity);

      const deliveryEntity = deliveryRepo.create({
        ...params.delivery,
        orderId: savedOrder.id,
      });
      const savedDelivery = await deliveryRepo.save(deliveryEntity);

      return {
        order: OrderEntityMapper.toModel(savedOrder),
        delivery: DeliveryEntityMapper.toModel(savedDelivery),
      };
    });
  }
}
