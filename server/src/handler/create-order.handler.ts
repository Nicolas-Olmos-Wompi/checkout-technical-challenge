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
import {
  CreateOrderRequest,
  PendingOrderResponse,
} from "../model/dto/order.type";

@Injectable()
export class HandlerCreateOrder {
  constructor(
    @Inject("CreateOrderUseCase")
    private readonly createOrderUC: CreateOrderUseCase,
  ) {}

  async execute(
    userId: string,
    request: CreateOrderRequest,
  ): Promise<HTTPResponse> {
    try {
      const command = OrderMapper.toCreateCommand(userId, request);
      const result = await this.createOrderUC.apply(command);
      const response: PendingOrderResponse = OrderMapper.toDTO(result);
      return new HTTPResponse(
        HttpStatus.CREATED,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      );
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InsufficientStockError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
