import { DataSource } from "typeorm";
import { Environment } from "../../../model/enum/environment.enum";
import { AuthMechanism } from "../../../model/enum/auth-mechanism.enum";
import { dataSource } from "./data-source";
import { ProductEntity } from "./product.entity";
import { UserEntity } from "./user.entity";

describe("dataSource", () => {
  beforeEach(() => {
    process.env.APP_ENV = Environment.LOCAL;
    process.env.DB_AUTH_MECHANISM = AuthMechanism.PASSWORD;
    process.env.DB_HOST = "test";
    process.env.DB_NAME = "test";
    process.env.DB_USERNAME = "test";
    process.env.DB_PASSWORD = "test";
  });

  it("should be an instance of DataSource", () => {
    expect(dataSource).toBeInstanceOf(DataSource);
  });

  it("should be configured with the postgres driver", () => {
    expect(dataSource.options.type).toBe("postgres");
  });

  it("should register ProductEntity", () => {
    expect(dataSource.options.entities).toContain(ProductEntity);
  });

  it("should register UserEntity", () => {
    expect(dataSource.options.entities).toContain(UserEntity);
  });

  it("should point migrations to the src/common/migrations glob, excluding spec files", () => {
    expect(dataSource.options.migrations).toEqual([
      "src/common/migrations/!(*.spec).ts",
    ]);
  });
});
