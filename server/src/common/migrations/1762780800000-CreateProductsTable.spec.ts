import { MockProxy, mock } from "jest-mock-extended";
import { QueryRunner, Table } from "typeorm";
import { CreateProductsTable1762780800000 } from "./1762780800000-CreateProductsTable";

describe("CreateProductsTable1762780800000", () => {
  let migration: CreateProductsTable1762780800000;
  let queryRunner: MockProxy<QueryRunner>;

  beforeEach(() => {
    migration = new CreateProductsTable1762780800000();
    queryRunner = mock<QueryRunner>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("up", () => {
    it("should enable the pgcrypto extension", async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',
      );
    });

    it("should create the products table with the expected columns", async () => {
      await migration.up(queryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
      const [table, ifNotExists] = queryRunner.createTable.mock.calls[0] as [
        Table,
        boolean,
      ];

      expect(table.name).toBe("products");
      expect(ifNotExists).toBe(true);

      const columnNames = table.columns.map((column) => column.name);
      expect(columnNames).toEqual([
        "id",
        "name",
        "description",
        "price",
        "stock",
        "image",
        "created_at",
        "updated_at",
      ]);

      const idColumn = table.columns.find((column) => column.name === "id");
      expect(idColumn?.isPrimary).toBe(true);
      expect(idColumn?.default).toBe("gen_random_uuid()");

      const stockColumn = table.columns.find(
        (column) => column.name === "stock",
      );
      expect(stockColumn?.default).toBe(0);

      expect(table.checks[0]?.expression).toBe('"stock" >= 0');
    });
  });

  describe("down", () => {
    it("should drop the products table", async () => {
      await migration.down(queryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith("products", true);
    });
  });
});
