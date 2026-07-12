import { ILogger } from "../interface/logger.interface";
import { IProductRepository } from "../interface/product.repository";
import { IOrderRepository } from "../interface/order.repository";
import { IDeliveryRepository } from "../interface/delivery.repository";
import { ITransactionManager } from "../interface/transaction-manager";
import { IPaymentGateway } from "../interface/payment-gateway";
import {
  CreateOrderCommand,
  CreateOrderResult,
  MerchantAcceptance,
} from "../model/order.type";
import { Order } from "../model/order.entity";
import { Delivery } from "../model/delivery.entity";
import {
  ProductNotFoundError,
  InsufficientStockError,
} from "../model/order.errors";

export class CreateOrderUseCase {
  private readonly MIN_DELIVERY_FEE = 5000;
  private readonly MAX_DELIVERY_FEE = 15000;

  constructor(
    private readonly productRepository: IProductRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly deliveryRepository: IDeliveryRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly paymentGateway: IPaymentGateway,
    private readonly logger: ILogger,
  ) {}

  public async apply(command: CreateOrderCommand): Promise<CreateOrderResult> {
    const { userId, productId, quantity } = command;

    this.logger.log("Creating order", { userId, productId, quantity });

    const product = await this.productRepository.findById(productId);

    if (!product) {
      this.logger.warn("Order creation failed: product not found", {
        productId,
      });
      throw new ProductNotFoundError(productId);
    }

    if (product.stock < quantity) {
      this.logger.warn("Order creation failed: insufficient stock", {
        productId,
        requested: quantity,
        available: product.stock,
      });
      throw new InsufficientStockError(productId, quantity, product.stock);
    }

    const deliveryFee = this.calculateDeliveryFee();
    const totalInCents = product.price * quantity + deliveryFee;

    this.logger.debug("Order pricing calculated", {
      productPrice: product.price,
      quantity,
      deliveryFee,
      totalInCents,
    });

    const acceptance = await this.paymentGateway.getAcceptanceTokens();

    const { order, delivery } = await this.transactionManager.runInTransaction(
      () =>
        this.persistOrderAndDelivery(command, {
          userId,
          productId,
          quantity,
          totalInCents,
          acceptance,
          deliveryFee,
        }),
    );

    this.logger.log("Order created successfully", {
      orderId: order.id,
      totalInCents,
    });

    return { order, delivery, acceptance };
  }

  private calculateDeliveryFee(): number {
    const min = this.MIN_DELIVERY_FEE;
    const max = this.MAX_DELIVERY_FEE;
    const rawFee = Math.floor(Math.random() * (max - min + 1)) + min;
    // Round to the nearest whole 100 cents (whole peso) since some payment
    // methods (e.g. Wompi cards) reject amounts that include sub-peso cents.
    return Math.round(rawFee / 100) * 100;
  }

  private async persistOrderAndDelivery(
    command: CreateOrderCommand,
    params: {
      userId: string;
      productId: string;
      quantity: number;
      totalInCents: number;
      acceptance: MerchantAcceptance;
      deliveryFee: number;
    },
  ): Promise<{ order: Order; delivery: Delivery }> {
    const order = await this.orderRepository.create({
      userId: params.userId,
      productId: params.productId,
      quantity: params.quantity,
      totalInCents: params.totalInCents,
      status: "PENDING",
      paymentGatewayTransactionId: null,
      acceptanceTokenEndUserPolicy:
        params.acceptance.endUserPolicy.acceptanceToken,
      acceptanceTokenPersonalDataAuth:
        params.acceptance.personalDataAuth.acceptanceToken,
    });

    const delivery = await this.deliveryRepository.create({
      orderId: order.id,
      personName: command.delivery.personName,
      address: command.delivery.address,
      country: command.delivery.country,
      city: command.delivery.city,
      region: command.delivery.region,
      postalCode: command.delivery.postalCode,
      phoneNumber: command.delivery.phoneNumber,
      fee: params.deliveryFee,
    });

    return { order, delivery };
  }
}
