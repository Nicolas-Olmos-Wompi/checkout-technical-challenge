import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IOrderRepository } from "domain/src/interface/order.repository";
import { Order } from "domain/src/model/order.entity";
import { OrderStatus } from "domain/src/model/order-status";
import { OrderEntityMapper } from "../../../model/mapper/order-entity.mapper";
import { OrderEntity } from "./order.entity";

export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
  ) {}

  async create(
    order: Omit<Order, "id" | "createdAt" | "updatedAt">,
  ): Promise<Order> {
    const entity = this.repo.create(order);
    const saved = await this.repo.save(entity);
    return OrderEntityMapper.toModel(saved);
  }

  async findById(id: string): Promise<Order | null> {
    const entity = await this.repo.findOne({ where: { id } });

    return entity ? OrderEntityMapper.toModel(entity) : null;
  }

  async updateStatus(
    id: string,
    changes: {
      status: OrderStatus;
      paymentGatewayTransactionId?: string | null;
    },
  ): Promise<Order> {
    await this.repo.update(id, changes);
    const entity = await this.repo.findOne({ where: { id } });

    return OrderEntityMapper.toModel(entity!);
  }
}
