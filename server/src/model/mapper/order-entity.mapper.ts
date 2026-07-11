import { Order } from "../../../domain/src/model/order.entity";
import { OrderEntity } from "../../adapter/out/postgres/order.entity";

export class OrderEntityMapper {
  public static toModel(orderEntity: OrderEntity): Order {
    return orderEntity;
  }
}
