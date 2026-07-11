import { Global, Logger, Module } from "@nestjs/common";
import { DatabaseModule } from "./adapter/out/postgres/database.module";

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: "Logger",
      useValue: new Logger(),
    },
  ],
  controllers: [],
})
export class ConfigModule {}
