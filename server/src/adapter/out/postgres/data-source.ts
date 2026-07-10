import { DataSource } from "typeorm";
import { typeOrmConfig } from "./typeorm.config";
import { ProductEntity } from "./product.entity";
import { UserEntity } from "./user.entity";

export const dataSource = new DataSource({
  ...typeOrmConfig(),
  entities: [ProductEntity, UserEntity],
  migrations: ["src/common/migrations/!(*.spec).ts"],
});
