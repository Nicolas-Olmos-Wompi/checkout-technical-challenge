import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpModule, HttpService } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IHealthRepository } from "domain/src/interface/health.repository";
import { GetHealthUseCase } from "domain/src/usecase/get-health.usecase";
import { IProductRepository } from "domain/src/interface/product.repository";
import { GetFeatureUseCase } from "../domain/src/usecase/get-feature.usecase";
import { GetProductsUseCase } from "../domain/src/usecase/get-products.usecase";
import { ApiDomainController } from "./adapter/in/http/api-domain.controller";
import { HealthController } from "./adapter/in/http/health.controller";
import { ProductController } from "./adapter/in/http/product.controller";
import { DomainDataBaseRepository } from "./adapter/out/dynamodb/domain-database.controller";
import { UtilsDomainDatabase } from "./adapter/out/dynamodb/utils";
import { TypeOrmHealthRepository } from "./adapter/out/postgres/typeorm-health.repository";
import { ProductEntity } from "./adapter/out/postgres/product.entity";
import { ProductRepository } from "./adapter/out/postgres/product.repository";
import { HandlerGetFeature } from "./handler/get-feature.handler";
import { HandlerGetProducts } from "./handler/get-products.handler";
import { HandlerGetServerHealthStatus } from "./handler/get-server-health-status.handler";
import { SlackNotification } from "./adapter/out/slack/notification.controller";
import { BackOfficeNotification } from "./adapter/out/backoffice/notification.controller";
import { IBackOfficeNotification } from "domain/src/interface/backoffice-notification.repository";

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ProductEntity])],
  controllers: [HealthController, ApiDomainController, ProductController],
  providers: [
    {
      provide: "TypeOrmHealthRepository",
      useClass: TypeOrmHealthRepository,
    },
    {
      provide: "GetHealthUseCase",
      useFactory: (healthRepository: IHealthRepository) => {
        return new GetHealthUseCase(healthRepository);
      },
      inject: ["TypeOrmHealthRepository"],
    },
    {
      provide: "UtilsDomainDatabase",
      useFactory: (
        dbClient: DynamoDBDocumentClient,
        configService: ConfigService,
      ) => {
        return new UtilsDomainDatabase(dbClient, configService);
      },
      inject: ["dbClient", ConfigService],
    },
    {
      provide: "DomainDataBaseRepository",
      useFactory: (utilsDomainDatabase: UtilsDomainDatabase) => {
        return new DomainDataBaseRepository(utilsDomainDatabase);
      },
      inject: ["UtilsDomainDatabase"],
    },
    {
      provide: "SlackNotification",
      useFactory: (httpService: HttpService) => {
        return new SlackNotification(httpService);
      },
      inject: [HttpService],
    },
    {
      provide: "BackOfficeNotification",
      useFactory: (
        slackNotification: SlackNotification,
        configService: ConfigService,
      ) => {
        return new BackOfficeNotification(slackNotification, configService);
      },
      inject: ["SlackNotification", ConfigService],
    },
    {
      provide: "GetFeatureUseCase",
      useFactory: (
        domainDataBaseRepository: DomainDataBaseRepository,
        backOfficeNotification: IBackOfficeNotification,
      ) => {
        return new GetFeatureUseCase(
          domainDataBaseRepository,
          backOfficeNotification,
        );
      },
      inject: ["DomainDataBaseRepository", "BackOfficeNotification"],
    },
    ProductRepository,
    {
      provide: "ProductRepository",
      useExisting: ProductRepository,
    },
    {
      provide: "GetProductsUseCase",
      useFactory: (productRepository: IProductRepository) => {
        return new GetProductsUseCase(productRepository);
      },
      inject: ["ProductRepository"],
    },
    HandlerGetFeature,
    HandlerGetProducts,
    HandlerGetServerHealthStatus,
  ],
})
export class InstanceDomainModule {}
