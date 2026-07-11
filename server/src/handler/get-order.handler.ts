import {
  Injectable,
  Inject,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { PayOrderMapper } from "../model/mapper/pay-order.mapper";
import type { IOrderRepository } from "../../domain/src/interface/order.repository";
import { OrderResponse } from "../model/dto/order.type";

@Injectable()
export class HandlerGetOrder {
  constructor(
    @Inject("OrderRepository")
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(userId: string, orderId: string): Promise<HTTPResponse> {
    const order = await this.orderRepository.findById(orderId);

    if (order?.userId !== userId) {
      throw new NotFoundException(`Order "${orderId}" was not found.`);
    }

    const response: OrderResponse = PayOrderMapper.toOrderResponse(order);

    return new HTTPResponse(
      HttpStatus.OK,
      SUCCESS_STATES_MESSAGES.Success.code,
      SUCCESS_STATES_MESSAGES.Success.message,
      response,
    );
  }
}
