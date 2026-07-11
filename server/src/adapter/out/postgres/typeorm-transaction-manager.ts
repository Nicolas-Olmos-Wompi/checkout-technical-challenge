import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ITransactionManager } from "domain/src/interface/transaction-manager";

export class TypeOrmTransactionManager implements ITransactionManager {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async () => {
      return work();
    });
  }
}
