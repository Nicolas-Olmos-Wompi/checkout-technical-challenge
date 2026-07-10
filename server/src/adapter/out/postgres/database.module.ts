import { Module, Global, OnModuleDestroy, Logger } from "@nestjs/common";
import { InjectDataSource, TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { typeOrmConfig } from "./typeorm.config";
@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({ ...typeOrmConfig(), autoLoadEntities: true }),
  ],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleDestroy() {
    if (this.dataSource.isInitialized) {
      try {
        Logger.log("Closing database connections...", DatabaseModule.name);
        await this.dataSource.destroy();
      } catch (error) {
        Logger.error(
          "Error closing database connections",
          (error as Error).message,
          DatabaseModule.name,
        );
      }
    }
  }
}
