import { Logger, Module, OnApplicationShutdown } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { randomUUID } from "node:crypto";
import { Request } from "express";
import { CommonsModule } from "./common/common.module";
import { ConfigModule } from "./config.module";
import { InstanceDomainModule } from "./instance-domain.module";
import sdk from "./instrumentation";

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => {
          const headerValue = req.headers["x-request-id"] as string | undefined;
          // Generate new UUID if header is missing, undefined, or empty string
          return headerValue && headerValue.trim() !== ""
            ? headerValue
            : randomUUID();
        },
      },
    }),
    CommonsModule,
    ConfigModule,
    InstanceDomainModule,
  ],
})
export class AppModule implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    Logger.log(
      `Application shutting down (Signal: ${signal}). Shutting down OpenTelemetry SDK...`,
      AppModule.name,
    );
    try {
      await sdk.shutdown();
      Logger.log("OpenTelemetry SDK shutdown successfully", AppModule.name);
    } catch (error) {
      Logger.error(
        "Error shutting down OpenTelemetry SDK",
        (error as Error).message,
        AppModule.name,
      );
    }
  }
}
