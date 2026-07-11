import { Order } from "../../../domain/src/model/order.entity";
import {
  PayOrderCommand,
  PayOrderResult,
} from "../../../domain/src/model/payment.type";
import {
  OrderResponse,
  PayOrderRequest,
  PayOrderResponse,
} from "../dto/order.type";

export class PayOrderMapper {
  public static toCommand(
    userId: string,
    orderId: string,
    request: PayOrderRequest,
  ): PayOrderCommand {
    return {
      userId,
      orderId,
      paymentMethodType: request.paymentMethodType,
      card: {
        cardNumber: request.card.cardNumber,
        expMonth: request.card.expMonth,
        expYear: request.card.expYear,
        cvc: request.card.cvc,
        cardHolder: request.card.cardHolder,
      },
    };
  }

  public static toDTO(result: PayOrderResult): PayOrderResponse {
    return {
      orderId: result.order.id,
      status: result.order.status,
      paymentGatewayTransactionId: result.order.paymentGatewayTransactionId,
      timedOut: result.timedOut,
      paymentMethod: {
        type: result.paymentMethod.type,
        displayInfo: result.paymentMethod.displayInfo,
      },
    };
  }

  public static toOrderResponse(order: Order): OrderResponse {
    return {
      orderId: order.id,
      productId: order.productId,
      quantity: order.quantity,
      totalInCents: order.totalInCents,
      status: order.status,
      paymentGatewayTransactionId: order.paymentGatewayTransactionId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
