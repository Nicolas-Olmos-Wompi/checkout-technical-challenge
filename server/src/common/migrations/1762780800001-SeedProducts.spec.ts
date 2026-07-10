import { MockProxy, mock } from "jest-mock-extended";
import { QueryRunner } from "typeorm";
import {
  SEED_PRODUCTS,
  SeedProducts1762780800001,
} from "./1762780800001-SeedProducts";

describe("SeedProducts1762780800001", () => {
  let migration: SeedProducts1762780800001;
  let queryRunner: MockProxy<QueryRunner>;

  beforeEach(() => {
    migration = new SeedProducts1762780800001();
    queryRunner = mock<QueryRunner>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("up", () => {
    it("should insert exactly 10 products", async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledTimes(10);
      expect(SEED_PRODUCTS).toHaveLength(10);
    });

    it("should insert every seed product with its data", async () => {
      await migration.up(queryRunner);

      for (const product of SEED_PRODUCTS) {
        expect(queryRunner.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO "products"'),
          [
            product.id,
            product.name,
            product.description,
            product.price,
            product.stock,
            product.image,
          ],
        );
      }
    });

    it("should store all prices as positive integers (cents)", () => {
      for (const product of SEED_PRODUCTS) {
        expect(Number.isInteger(product.price)).toBe(true);
        expect(product.price).toBeGreaterThan(0);
      }
    });
  });

  describe("down", () => {
    it("should delete exactly the seeded product ids", async () => {
      await migration.down(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        'DELETE FROM "products" WHERE "id" = ANY($1)',
        [SEED_PRODUCTS.map((product) => product.id)],
      );
    });
  });
});
