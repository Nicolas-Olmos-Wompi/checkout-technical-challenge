import {
  Injectable,
  Inject,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { PayOrderMapper } from "../model/mapper/pay-order.mapper";
import { LoggerService } from "../common/logger/logger.service";
import type { IOrderRepository } from "../../domain/src/interface/order.repository";
import { OrderResponse } from "../model/dto/order.type";

@Injectable()
export class HandlerGetOrder {
  private readonly logger = new LoggerService("HandlerGetOrder");

  constructor(
    @Inject("OrderRepository")
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(userId: string, orderId: string): Promise<HTTPResponse> {
    this.logger.log("GET /orders/:id", { userId, orderId });

    const order = await this.orderRepository.findById(orderId);

    if (order?.userId !== userId) {
      this.logger.warn("Get order: not found or unauthorized", {
        userId,
        orderId,
      });
      throw new NotFoundException(`Order "${orderId}" was not found.`);
    }

    const response: OrderResponse = PayOrderMapper.toOrderResponse(order);

    this.logger.log("Get order completed", {
      userId,
      orderId,
      status: order.status,
    });

    return new HTTPResponse(
      HttpStatus.OK,
      SUCCESS_STATES_MESSAGES.Success.code,
      SUCCESS_STATES_MESSAGES.Success.message,
      response,
    );
  }
}
