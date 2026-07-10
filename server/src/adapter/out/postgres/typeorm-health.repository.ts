import { InjectDataSource } from "@nestjs/typeorm";
import { IHealthRepository } from "domain/src/interface/health.repository";

import { DataSource } from "typeorm";

export class TypeOrmHealthRepository implements IHealthRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async checkHealth(): Promise<boolean> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      const results = !!(await queryRunner.query("SELECT 1"));
      await queryRunner.release();
      return results;
    } catch (error) {
      return !error;
    }
  }
}
