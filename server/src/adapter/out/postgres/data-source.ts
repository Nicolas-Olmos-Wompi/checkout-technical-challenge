import { DataSource } from "typeorm";
import { typeOrmConfig } from "./typeorm.config";
import { ProductEntity } from "./product.entity";
import { UserEntity } from "./user.entity";
import { OrderEntity } from "./order.entity";
import { DeliveryEntity } from "./delivery.entity";

export const dataSource = new DataSource({
  ...typeOrmConfig(),
  entities: [ProductEntity, UserEntity, OrderEntity, DeliveryEntity],
  migrations: ["src/common/migrations/!(*.spec).ts"],
});
