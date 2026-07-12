import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IHealthRepository } from "domain/src/interface/health.repository";
import { ILogger } from "domain/src/interface/logger.interface";
import { GetHealthUseCase } from "domain/src/usecase/get-health.usecase";
import { IProductRepository } from "domain/src/interface/product.repository";
import { IUserRepository } from "domain/src/interface/user.repository";
import { IPasswordHasher } from "domain/src/interface/password-hasher";
import { ITokenGenerator } from "domain/src/interface/token-generator";
import { IOrderRepository } from "domain/src/interface/order.repository";
import { IDeliveryRepository } from "domain/src/interface/delivery.repository";
import { ITransactionManager } from "domain/src/interface/transaction-manager";
import { IPaymentGateway } from "domain/src/interface/payment-gateway";
import { IPaymentMethodStrategy } from "domain/src/interface/payment-method-strategy";
import { IIntegritySignatureGenerator } from "domain/src/interface/integrity-signature-generator";
import { ITransactionGateway } from "domain/src/interface/transaction-gateway";
import { GetProductsUseCase } from "../domain/src/usecase/get-products.usecase";
import { SignupUseCase } from "../domain/src/usecase/signup.usecase";
import { LoginUseCase } from "../domain/src/usecase/login.usecase";
import { CreateOrderUseCase } from "../domain/src/usecase/create-order.usecase";
import { PayOrderUseCase } from "../domain/src/usecase/pay-order.usecase";
import { TransactionStatusPoller } from "../domain/src/usecase/transaction-status-poller";
import { LoggerService } from "./common/logger/logger.service";
import { HealthController } from "./adapter/in/http/health.controller";
import { ProductController } from "./adapter/in/http/product.controller";
import { AuthController } from "./adapter/in/http/auth.controller";
import { OrderController } from "./adapter/in/http/order.controller";
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
import { WompiCardPaymentMethodAdapter } from "./adapter/out/wompi/wompi-card-payment-method.adapter";
import { Sha256IntegritySignatureAdapter } from "./adapter/out/wompi/sha256-integrity-signature.adapter";
import { WompiTransactionGatewayAdapter } from "./adapter/out/wompi/wompi-transaction-gateway.adapter";
import { HandlerGetProducts } from "./handler/get-products.handler";
import { HandlerSignup } from "./handler/signup.handler";
import { HandlerLogin } from "./handler/login.handler";
import { HandlerCreateOrder } from "./handler/create-order.handler";
import { HandlerPayOrder } from "./handler/pay-order.handler";
import { HandlerGetOrder } from "./handler/get-order.handler";
import { HandlerGetServerHealthStatus } from "./handler/get-server-health-status.handler";

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
        const logger: ILogger = new LoggerService("GetHealthUseCase");
        return new GetHealthUseCase(healthRepository, logger);
      },
      inject: ["TypeOrmHealthRepository"],
    },
    ProductRepository,
    {
      provide: "ProductRepository",
      useExisting: ProductRepository,
    },
    {
      provide: "GetProductsUseCase",
      useFactory: (productRepository: IProductRepository) => {
        const logger: ILogger = new LoggerService("GetProductsUseCase");
        return new GetProductsUseCase(productRepository, logger);
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
        const logger: ILogger = new LoggerService("SignupUseCase");
        return new SignupUseCase(
          userRepository,
          passwordHasher,
          tokenService,
          logger,
        );
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
        const logger: ILogger = new LoggerService("LoginUseCase");
        return new LoginUseCase(
          userRepository,
          passwordHasher,
          tokenService,
          logger,
        );
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
    WompiCardPaymentMethodAdapter,
    {
      provide: "PaymentMethodHandlers",
      useFactory: (
        cardHandler: WompiCardPaymentMethodAdapter,
      ): IPaymentMethodStrategy[] => [cardHandler],
      inject: [WompiCardPaymentMethodAdapter],
    },
    Sha256IntegritySignatureAdapter,
    {
      provide: "IntegritySignatureGenerator",
      useExisting: Sha256IntegritySignatureAdapter,
    },
    WompiTransactionGatewayAdapter,
    {
      provide: "TransactionGateway",
      useExisting: WompiTransactionGatewayAdapter,
    },
    {
      provide: "TransactionStatusPoller",
      useFactory: (configService: ConfigService) => {
        const logger: ILogger = new LoggerService("TransactionStatusPoller");
        const maxWaitMs =
          configService.get<number>("WOMPI_MAX_POLL_WAIT_MS") ?? 15000;
        const initialIntervalMs =
          configService.get<number>("WOMPI_POLL_INITIAL_INTERVAL_MS") ?? 1000;
        return new TransactionStatusPoller(
          (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
          { maxWaitMs, initialIntervalMs },
          logger,
        );
      },
      inject: [ConfigService],
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
        const logger: ILogger = new LoggerService("CreateOrderUseCase");
        return new CreateOrderUseCase(
          productRepository,
          orderRepository,
          deliveryRepository,
          transactionManager,
          paymentGateway,
          logger,
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
    {
      provide: "PayOrderUseCase",
      useFactory: (
        orderRepository: IOrderRepository,
        userRepository: IUserRepository,
        paymentMethodStrategies: IPaymentMethodStrategy[],
        signatureGenerator: IIntegritySignatureGenerator,
        transactionGateway: ITransactionGateway,
        poller: TransactionStatusPoller,
      ) => {
        const logger: ILogger = new LoggerService("PayOrderUseCase");
        return new PayOrderUseCase(
          orderRepository,
          userRepository,
          paymentMethodStrategies,
          signatureGenerator,
          transactionGateway,
          poller,
          logger,
        );
      },
      inject: [
        "OrderRepository",
        "UserRepository",
        "PaymentMethodHandlers",
        "IntegritySignatureGenerator",
        "TransactionGateway",
        "TransactionStatusPoller",
      ],
    },
    HandlerGetProducts,
    HandlerSignup,
    HandlerLogin,
    HandlerCreateOrder,
    HandlerPayOrder,
    HandlerGetOrder,
    HandlerGetServerHealthStatus,
  ],
})
export class InstanceDomainModule {}
