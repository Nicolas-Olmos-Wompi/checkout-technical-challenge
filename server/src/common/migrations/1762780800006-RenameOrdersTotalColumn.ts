import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameOrdersTotalColumn1762780800006 implements MigrationInterface {
  name = "RenameOrdersTotalColumn1762780800006";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "orders" RENAME COLUMN "total" TO "total_in_cents"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "orders" RENAME COLUMN "total_in_cents" TO "total"',
    );
  }
}
