import { DataSource } from "typeorm";
import { typeOrmConfig } from "./typeorm.config";
import { ProductEntity } from "./product.entity";

export const dataSource = new DataSource({
  ...typeOrmConfig(),
  entities: [ProductEntity],
  migrations: ["src/common/migrations/!(*.spec).ts"],
});
