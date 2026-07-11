import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEmailToUsersTable1762780800003 implements MigrationInterface {
  name = "AddEmailToUsersTable1762780800003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "email",
        type: "varchar",
        length: "255",
        isNullable: true,
      }),
    );

    await queryRunner.query(
      "UPDATE users SET email = username || '@example.com' WHERE email IS NULL",
    );

    await queryRunner.changeColumn(
      "users",
      "email",
      new TableColumn({
        name: "email",
        type: "varchar",
        length: "255",
        isNullable: false,
      }),
    );

    await queryRunner.query(
      "ALTER TABLE users ADD CONSTRAINT UQ_users_email UNIQUE (email)",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "email");
  }
}
