import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IDeliveryRepository } from "domain/src/interface/delivery.repository";
import { Delivery } from "domain/src/model/delivery.entity";
import { DeliveryEntityMapper } from "../../../model/mapper/delivery-entity.mapper";
import { DeliveryEntity } from "./delivery.entity";

export class DeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly repo: Repository<DeliveryEntity>,
  ) {}

  async create(delivery: Omit<Delivery, "id">): Promise<Delivery> {
    const entity = this.repo.create(delivery);
    const saved = await this.repo.save(entity);
    return DeliveryEntityMapper.toModel(saved);
  }
}
