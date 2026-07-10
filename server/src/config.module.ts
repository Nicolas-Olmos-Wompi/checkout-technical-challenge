import { Global, Logger, Module } from "@nestjs/common";
import { dynamoDBDocumentClient } from "./adapter/out/dynamodb/client.connection";
import { HealthController } from "./common/config/health.controller";
import { DatabaseModule } from "./adapter/out/postgres/database.module";

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: "Logger",
      useValue: new Logger(),
    },
    {
      provide: "dbClient",
      useValue: dynamoDBDocumentClient,
    },
  ],
  exports: ["dbClient"],
  controllers: [HealthController],
})
export class ConfigModule {}
