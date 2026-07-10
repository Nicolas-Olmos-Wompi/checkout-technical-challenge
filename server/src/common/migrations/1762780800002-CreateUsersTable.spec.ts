import { MockProxy, mock } from "jest-mock-extended";
import { QueryRunner, Table } from "typeorm";
import { CreateUsersTable1762780800002 } from "./1762780800002-CreateUsersTable";

describe("CreateUsersTable1762780800002", () => {
  let migration: CreateUsersTable1762780800002;
  let queryRunner: MockProxy<QueryRunner>;

  beforeEach(() => {
    migration = new CreateUsersTable1762780800002();
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

    it("should create the users table with the expected columns", async () => {
      await migration.up(queryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
      const [table, ifNotExists] = queryRunner.createTable.mock.calls[0] as [
        Table,
        boolean,
      ];

      expect(table.name).toBe("users");
      expect(ifNotExists).toBe(true);

      const columnNames = table.columns.map((column) => column.name);
      expect(columnNames).toEqual([
        "id",
        "username",
        "password_hash",
        "created_at",
        "updated_at",
      ]);

      const idColumn = table.columns.find((column) => column.name === "id");
      expect(idColumn?.isPrimary).toBe(true);
      expect(idColumn?.default).toBe("gen_random_uuid()");

      const usernameColumn = table.columns.find(
        (column) => column.name === "username",
      );
      expect(usernameColumn?.isUnique).toBe(true);
    });
  });

  describe("down", () => {
    it("should drop the users table", async () => {
      await migration.down(queryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith("users", true);
    });
  });
});
