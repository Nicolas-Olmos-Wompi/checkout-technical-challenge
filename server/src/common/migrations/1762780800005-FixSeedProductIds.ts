import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_PRODUCTS } from "./1762780800001-SeedProducts";

export class FixSeedProductIds1762780800005 implements MigrationInterface {
  name = "FixSeedProductIds1762780800005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const ids = SEED_PRODUCTS.map((product) => product.id);
    await queryRunner.query('DELETE FROM "products" WHERE "id" = ANY($1)', [
      ids,
    ]);

    for (const product of SEED_PRODUCTS) {
      await queryRunner.query(
        `INSERT INTO "products" ("id", "name", "description", "price", "stock", "image")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          product.image,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const names = SEED_PRODUCTS.map((product) => product.name);
    await queryRunner.query('DELETE FROM "products" WHERE "name" = ANY($1)', [
      names,
    ]);

    for (const product of SEED_PRODUCTS) {
      await queryRunner.query(
        `INSERT INTO "products" ("id", "name", "description", "price", "stock", "image")
         VALUES ($1, $2, $3, $4, $5, $6)`,
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
  }
}
