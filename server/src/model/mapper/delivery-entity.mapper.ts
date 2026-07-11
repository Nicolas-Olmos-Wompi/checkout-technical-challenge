import { Delivery } from "../../../domain/src/model/delivery.entity";
import { DeliveryEntity } from "../../adapter/out/postgres/delivery.entity";

export class DeliveryEntityMapper {
  public static toModel(deliveryEntity: DeliveryEntity): Delivery {
    return deliveryEntity;
  }
}
