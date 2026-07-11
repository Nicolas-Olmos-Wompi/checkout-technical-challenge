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
import { IOrderRepository } from "domain/src/interface/order.repository";
import { IDeliveryRepository } from "domain/src/interface/delivery.repository";
import { ITransactionManager } from "domain/src/interface/transaction-manager";
import { IPaymentGateway } from "domain/src/interface/payment-gateway";
import { GetFeatureUseCase } from "../domain/src/usecase/get-feature.usecase";
import { GetProductsUseCase } from "../domain/src/usecase/get-products.usecase";
import { SignupUseCase } from "../domain/src/usecase/signup.usecase";
import { LoginUseCase } from "../domain/src/usecase/login.usecase";
import { CreateOrderUseCase } from "../domain/src/usecase/create-order.usecase";
import { ApiDomainController } from "./adapter/in/http/api-domain.controller";
import { HealthController } from "./adapter/in/http/health.controller";
import { ProductController } from "./adapter/in/http/product.controller";
import { AuthController } from "./adapter/in/http/auth.controller";
import { OrderController } from "./adapter/in/http/order.controller";
import { DomainDataBaseRepository } from "./adapter/out/dynamodb/domain-database.controller";
import { UtilsDomainDatabase } from "./adapter/out/dynamodb/utils";
import { TypeOrmHealthRepository } from "./adapter/out/postgres/typeorm-health.repository";
import { ProductEntity } from "./adapter/out/postgres/product.entity";
import { ProductRepository } from "./adapter/out/postgres/product.repository";
import { UserEntity } from "./adapter/out/postgres/user.entity";
import { UserRepository } from "./adapter/out/postgres/user.repository";
import { OrderEntity } from "./adapter/out/postgres/order.entity";
import { DeliveryEntity } from "./adapter/out/postgres/delivery.entity";
import { OrderRepository } from "./adapter/out/postgres/order.repository";
import { DeliveryRepository } from "./adapter/out/postgres/delivery.repository";
import { TypeOrmTransactionManager } from "./adapter/out/postgres/typeorm-transaction-manager";
import { BcryptPasswordHasherAdapter } from "./adapter/out/security/bcrypt-password-hasher.adapter";
import { JwtTokenGeneratorAdapter } from "./adapter/out/auth/jwt-token-generator.adapter";
import { WompiPaymentGatewayAdapter } from "./adapter/out/wompi/wompi-payment-gateway.adapter";
import { HandlerGetFeature } from "./handler/get-feature.handler";
import { HandlerGetProducts } from "./handler/get-products.handler";
import { HandlerSignup } from "./handler/signup.handler";
import { HandlerLogin } from "./handler/login.handler";
import { HandlerCreateOrder } from "./handler/create-order.handler";
import { HandlerGetServerHealthStatus } from "./handler/get-server-health-status.handler";
import { SlackNotification } from "./adapter/out/slack/notification.controller";
import { BackOfficeNotification } from "./adapter/out/backoffice/notification.controller";
import { IBackOfficeNotification } from "domain/src/interface/backoffice-notification.repository";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      ProductEntity,
      UserEntity,
      OrderEntity,
      DeliveryEntity,
    ]),
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
    OrderController,
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
    BcryptPasswordHasherAdapter,
    {
      provide: "PasswordHasher",
      useExisting: BcryptPasswordHasherAdapter,
    },
    JwtTokenGeneratorAdapter,
    {
      provide: "TokenGenerator",
      useExisting: JwtTokenGeneratorAdapter,
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
    OrderRepository,
    {
      provide: "OrderRepository",
      useExisting: OrderRepository,
    },
    DeliveryRepository,
    {
      provide: "DeliveryRepository",
      useExisting: DeliveryRepository,
    },
    TypeOrmTransactionManager,
    {
      provide: "TransactionManager",
      useExisting: TypeOrmTransactionManager,
    },
    WompiPaymentGatewayAdapter,
    {
      provide: "PaymentGateway",
      useExisting: WompiPaymentGatewayAdapter,
    },
    {
      provide: "CreateOrderUseCase",
      useFactory: (
        productRepository: IProductRepository,
        orderRepository: IOrderRepository,
        deliveryRepository: IDeliveryRepository,
        transactionManager: ITransactionManager,
        paymentGateway: IPaymentGateway,
      ) => {
        return new CreateOrderUseCase(
          productRepository,
          orderRepository,
          deliveryRepository,
          transactionManager,
          paymentGateway,
        );
      },
      inject: [
        "ProductRepository",
        "OrderRepository",
        "DeliveryRepository",
        "TransactionManager",
        "PaymentGateway",
      ],
    },
    HandlerGetFeature,
    HandlerGetProducts,
    HandlerSignup,
    HandlerLogin,
    HandlerCreateOrder,
    HandlerGetServerHealthStatus,
  ],
})
export class InstanceDomainModule {}
