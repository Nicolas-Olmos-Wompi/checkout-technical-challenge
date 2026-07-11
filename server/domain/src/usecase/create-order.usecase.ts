import { IProductRepository } from "../interface/product.repository";
import { IOrderRepository } from "../interface/order.repository";
import { IPaymentGateway } from "../interface/payment-gateway";
import { CreateOrderCommand, CreateOrderResult } from "../model/order.type";
import {
  ProductNotFoundError,
  InsufficientStockError,
} from "../model/order.errors";

export class CreateOrderUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  public async apply(command: CreateOrderCommand): Promise<CreateOrderResult> {
    const product = await this.productRepository.findById(command.productId);

    if (!product) {
      throw new ProductNotFoundError(command.productId);
    }

    if (product.stock < command.quantity) {
      throw new InsufficientStockError(
        command.productId,
        command.quantity,
        product.stock,
      );
    }

    const fee = command.delivery.fee ?? 0;
    const total = product.price * command.quantity + fee;

    const acceptance = await this.paymentGateway.getAcceptanceTokens();

    const { order, delivery } = await this.orderRepository.create({
      order: {
        userId: command.userId,
        productId: command.productId,
        quantity: command.quantity,
        total,
        status: "PENDING",
        paymentGatewayTransactionId: null,
        acceptanceTokenEndUserPolicy: acceptance.endUserPolicy.acceptanceToken,
        acceptanceTokenPersonalDataAuth:
          acceptance.personalDataAuth.acceptanceToken,
      },
      delivery: {
        personName: command.delivery.personName,
        address: command.delivery.address,
        country: command.delivery.country,
        city: command.delivery.city,
        region: command.delivery.region,
        postalCode: command.delivery.postalCode,
        phoneNumber: command.delivery.phoneNumber,
        fee: command.delivery.fee ?? null,
      },
    });

    return { order, delivery, acceptance };
  }
}
