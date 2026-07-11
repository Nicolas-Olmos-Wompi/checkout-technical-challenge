import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateOrdersAndDeliveriesTables1762780800004 implements MigrationInterface {
  name = "CreateOrdersAndDeliveriesTables1762780800004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "product_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "quantity",
            type: "int",
            isNullable: false,
          },
          {
            name: "total",
            type: "int",
            isNullable: false,
            comment: "Total in cents",
          },
          {
            name: "status",
            type: "varchar",
            length: "20",
            isNullable: false,
            default: "'PENDING'",
          },
          {
            name: "payment_gateway_transaction_id",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "acceptance_token_end_user_policy",
            type: "text",
            isNullable: false,
          },
          {
            name: "acceptance_token_personal_data_auth",
            type: "text",
            isNullable: false,
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
            columnNames: ["status"],
            expression:
              "\"status\" IN ('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR')",
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            columnNames: ["product_id"],
            referencedTableName: "products",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "deliveries",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "order_id",
            type: "uuid",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "person_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "address",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "country",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "city",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "region",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "postal_code",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "phone_number",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "fee",
            type: "int",
            isNullable: true,
            comment: "Delivery fee in cents",
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["order_id"],
            referencedTableName: "orders",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("deliveries", true);
    await queryRunner.dropTable("orders", true);
  }
}
