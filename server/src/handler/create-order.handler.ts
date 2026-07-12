import {
  ConflictException,
  Injectable,
  Inject,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { OrderMapper } from "../model/mapper/order.mapper";
import { CreateOrderUseCase } from "../../domain/src/usecase/create-order.usecase";
import {
  InsufficientStockError,
  ProductNotFoundError,
} from "../../domain/src/model/order.errors";
import { LoggerService } from "../common/logger/logger.service";
import {
  CreateOrderRequest,
  PendingOrderResponse,
} from "../model/dto/order.type";

@Injectable()
export class HandlerCreateOrder {
  private readonly logger = new LoggerService("HandlerCreateOrder");

  constructor(
    @Inject("CreateOrderUseCase")
    private readonly createOrderUC: CreateOrderUseCase,
  ) {}

  async execute(
    userId: string,
    request: CreateOrderRequest,
  ): Promise<HTTPResponse> {
    this.logger.log("POST /orders", {
      userId,
      productId: request.productId,
      quantity: request.quantity,
    });

    try {
      const command = OrderMapper.toCreateCommand(userId, request);
      const result = await this.createOrderUC.apply(command);
      const response: PendingOrderResponse = OrderMapper.toDTO(result);

      this.logger.log("Create order handler completed", {
        userId,
        orderId: result.order.id,
      });

      return new HTTPResponse(
        HttpStatus.CREATED,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      );
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        this.logger.warn("Create order: product not found", {
          userId,
          productId: request.productId,
        });
        throw new NotFoundException(error.message);
      }
      if (error instanceof InsufficientStockError) {
        this.logger.warn("Create order: insufficient stock", {
          userId,
          productId: request.productId,
          quantity: request.quantity,
        });
        throw new ConflictException(error.message);
      }
      this.logger.error(error, { userId });
      throw error;
    }
  }
}
