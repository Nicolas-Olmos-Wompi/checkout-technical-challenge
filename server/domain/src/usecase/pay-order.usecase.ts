import { IOrderRepository } from "../interface/order.repository";
import { IUserRepository } from "../interface/user.repository";
import { IPaymentMethodStrategy } from "../interface/payment-method-strategy";
import { IIntegritySignatureGenerator } from "../interface/integrity-signature-generator";
import { ITransactionGateway } from "../interface/transaction-gateway";
import { TransactionStatusPoller } from "./transaction-status-poller";
import {
  PayOrderCommand,
  PayOrderResult,
  PaymentMethodType,
  TransactionResult,
} from "../model/payment.type";
import {
  OrderNotFoundError,
  OrderNotPayableError,
  UnsupportedPaymentMethodError,
} from "../model/payment.errors";

const CURRENCY = "COP";

export class PayOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly paymentMethodStrategies: IPaymentMethodStrategy[],
    private readonly signatureGenerator: IIntegritySignatureGenerator,
    private readonly transactionGateway: ITransactionGateway,
    private readonly poller: TransactionStatusPoller,
  ) {}

  public async apply(command: PayOrderCommand): Promise<PayOrderResult> {
    const order = await this.orderRepository.findById(command.orderId);

    if (order?.userId !== command.userId) {
      throw new OrderNotFoundError(command.orderId);
    }

    if (order.status !== "PENDING") {
      throw new OrderNotPayableError(order.id, order.status);
    }

    const user = await this.userRepository.findById(command.userId);

    const strategy = this.resolveStrategy(command);

    const paymentCommand = this.extractPaymentCommand(command);
    const tokenized = await strategy.tokenize(paymentCommand);

    const signature = this.signatureGenerator.generate(
      order.id,
      order.totalInCents,
      CURRENCY,
    );

    const paymentMethodPayload = strategy.buildPaymentMethodPayload(
      tokenized.token,
    );

    const transaction = await this.transactionGateway.createTransaction({
      amountInCents: order.totalInCents,
      currency: CURRENCY,
      reference: order.id,
      signature,
      acceptanceToken: order.acceptanceTokenEndUserPolicy,
      customerEmail: user?.email ?? "",
      paymentMethodPayload,
    });

    await this.orderRepository.updateStatus(order.id, {
      status: "PENDING",
      paymentGatewayTransactionId: transaction.id,
    });

    const { result, timedOut } = await this.poller.pollUntilFinal(() =>
      this.transactionGateway.getTransactionStatus(transaction.id),
    );

    const updatedOrder = await this.persistFinalOrderStatus(
      order.id,
      transaction.id,
      result,
      timedOut,
    );

    return {
      order: updatedOrder,
      paymentMethod: {
        type: strategy.type,
        displayInfo: tokenized.displayInfo,
      },
      timedOut,
    };
  }

  private resolveStrategy(command: PayOrderCommand): IPaymentMethodStrategy {
    const strategy = this.paymentMethodStrategies.find(
      (candidate): boolean =>
        (candidate.type as string) === (command.paymentMethodType as string),
    );

    if (!strategy) {
      throw new UnsupportedPaymentMethodError(command.paymentMethodType);
    }

    return strategy;
  }

  private async persistFinalOrderStatus(
    orderId: string,
    transactionId: string,
    result: TransactionResult,
    timedOut: boolean,
  ) {
    const status = timedOut ? "PENDING" : result.status;

    return this.orderRepository.updateStatus(orderId, {
      status,
      paymentGatewayTransactionId: transactionId,
    });
  }

  private extractPaymentCommand(command: PayOrderCommand): unknown {
    const extractors: Partial<Record<PaymentMethodType, () => unknown>> = {
      CARD: () => command.card,
    };

    return extractors[command.paymentMethodType]?.();
  }
}
