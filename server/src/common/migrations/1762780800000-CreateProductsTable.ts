import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProductsTable1762780800000 implements MigrationInterface {
  name = "CreateProductsTable1762780800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "price",
            type: "int",
            isNullable: false,
            comment: "Price in cents",
          },
          {
            name: "stock",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "image",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            isNullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            isNullable: false,
            default: "now()",
          },
        ],
        checks: [
          {
            columnNames: ["stock"],
            expression: '"stock" >= 0',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("products", true);
  }
}
