import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpModule, HttpService } from "@nestjs/axios";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IHealthRepository } from "domain/src/interface/health.repository";
import { GetHealthUseCase } from "domain/src/usecase/get-health.usecase";
import { IProductRepository } from "domain/src/interface/product.repository";
import { IUserRepository } from "domain/src/interface/user.repository";
import { IPasswordHasher } from "domain/src/interface/password-hasher";
import { ITokenGenerator } from "domain/src/interface/token-generator";
import { GetFeatureUseCase } from "../domain/src/usecase/get-feature.usecase";
import { GetProductsUseCase } from "../domain/src/usecase/get-products.usecase";
import { SignupUseCase } from "../domain/src/usecase/signup.usecase";
import { LoginUseCase } from "../domain/src/usecase/login.usecase";
import { ApiDomainController } from "./adapter/in/http/api-domain.controller";
import { HealthController } from "./adapter/in/http/health.controller";
import { ProductController } from "./adapter/in/http/product.controller";
import { AuthController } from "./adapter/in/http/auth.controller";
import { DomainDataBaseRepository } from "./adapter/out/dynamodb/domain-database.controller";
import { UtilsDomainDatabase } from "./adapter/out/dynamodb/utils";
import { TypeOrmHealthRepository } from "./adapter/out/postgres/typeorm-health.repository";
import { ProductEntity } from "./adapter/out/postgres/product.entity";
import { ProductRepository } from "./adapter/out/postgres/product.repository";
import { UserEntity } from "./adapter/out/postgres/user.entity";
import { UserRepository } from "./adapter/out/postgres/user.repository";
import { BcryptPasswordHasher } from "./adapter/out/security/bcrypt-password-hasher";
import { JwtTokenGenerator } from "./adapter/out/auth/jwt-token-generator";
import { HandlerGetFeature } from "./handler/get-feature.handler";
import { HandlerGetProducts } from "./handler/get-products.handler";
import { HandlerSignup } from "./handler/signup.handler";
import { HandlerLogin } from "./handler/login.handler";
import { HandlerGetServerHealthStatus } from "./handler/get-server-health-status.handler";
import { SlackNotification } from "./adapter/out/slack/notification.controller";
import { BackOfficeNotification } from "./adapter/out/backoffice/notification.controller";
import { IBackOfficeNotification } from "domain/src/interface/backoffice-notification.repository";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ProductEntity, UserEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN") ?? "1h",
        } as JwtModuleOptions["signOptions"],
      }),
    }),
  ],
  controllers: [
    HealthController,
    ApiDomainController,
    ProductController,
    AuthController,
  ],
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
    UserRepository,
    {
      provide: "UserRepository",
      useExisting: UserRepository,
    },
    BcryptPasswordHasher,
    {
      provide: "PasswordHasher",
      useExisting: BcryptPasswordHasher,
    },
    JwtTokenGenerator,
    {
      provide: "TokenGenerator",
      useExisting: JwtTokenGenerator,
    },
    {
      provide: "SignupUseCase",
      useFactory: (
        userRepository: IUserRepository,
        passwordHasher: IPasswordHasher,
        tokenService: ITokenGenerator,
      ) => {
        return new SignupUseCase(userRepository, passwordHasher, tokenService);
      },
      inject: ["UserRepository", "PasswordHasher", "TokenGenerator"],
    },
    {
      provide: "LoginUseCase",
      useFactory: (
        userRepository: IUserRepository,
        passwordHasher: IPasswordHasher,
        tokenService: ITokenGenerator,
      ) => {
        return new LoginUseCase(userRepository, passwordHasher, tokenService);
      },
      inject: ["UserRepository", "PasswordHasher", "TokenGenerator"],
    },
    HandlerGetFeature,
    HandlerGetProducts,
    HandlerSignup,
    HandlerLogin,
    HandlerGetServerHealthStatus,
  ],
})
export class InstanceDomainModule {}
