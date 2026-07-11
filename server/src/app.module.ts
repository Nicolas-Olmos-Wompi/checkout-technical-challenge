import { Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { randomUUID } from "node:crypto";
import { Request } from "express";
import { CommonsModule } from "./common/common.module";
import { ConfigModule } from "./config.module";
import { InstanceDomainModule } from "./instance-domain.module";

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
export class AppModule {}
