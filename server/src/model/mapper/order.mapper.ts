import {
  CreateOrderCommand,
  CreateOrderResult,
} from "../../../domain/src/model/order.type";
import { CreateOrderRequest, PendingOrderResponse } from "../dto/order.type";

export class OrderMapper {
  public static toCreateCommand(
    userId: string,
    request: CreateOrderRequest,
  ): CreateOrderCommand {
    return {
      userId,
      productId: request.productId,
      quantity: request.quantity,
      delivery: {
        personName: request.delivery.personName,
        address: request.delivery.address,
        country: request.delivery.country,
        city: request.delivery.city,
        region: request.delivery.region,
        postalCode: request.delivery.postalCode,
        phoneNumber: request.delivery.phoneNumber,
        fee: request.delivery.fee,
      },
    };
  }

  public static toDTO(result: CreateOrderResult): PendingOrderResponse {
    return {
      orderId: result.order.id,
      reference: result.order.id,
      status: result.order.status,
      productId: result.order.productId,
      quantity: result.order.quantity,
      total: result.order.total,
      delivery: {
        id: result.delivery.id,
        personName: result.delivery.personName,
        address: result.delivery.address,
        country: result.delivery.country,
        city: result.delivery.city,
        region: result.delivery.region,
        postalCode: result.delivery.postalCode,
        phoneNumber: result.delivery.phoneNumber,
        fee: result.delivery.fee,
      },
      presignedAcceptance: {
        endUserPolicy: result.acceptance.endUserPolicy,
        personalDataAuth: result.acceptance.personalDataAuth,
      },
    };
  }
}
