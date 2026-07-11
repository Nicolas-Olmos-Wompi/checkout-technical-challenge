import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { PayOrderMapper } from "../model/mapper/pay-order.mapper";
import { PayOrderUseCase } from "../../domain/src/usecase/pay-order.usecase";
import {
  OrderNotFoundError,
  OrderNotPayableError,
  PaymentMethodTokenizationError,
  TransactionCreationError,
  UnsupportedPaymentMethodError,
} from "../../domain/src/model/payment.errors";
import { PayOrderRequest, PayOrderResponse } from "../model/dto/order.type";

@Injectable()
export class HandlerPayOrder {
  constructor(
    @Inject("PayOrderUseCase")
    private readonly payOrderUC: PayOrderUseCase,
  ) {}

  async execute(
    userId: string,
    orderId: string,
    request: PayOrderRequest,
  ): Promise<HTTPResponse> {
    try {
      const command = PayOrderMapper.toCommand(userId, orderId, request);
      const result = await this.payOrderUC.apply(command);
      const response: PayOrderResponse = PayOrderMapper.toDTO(result);
      return new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      );
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof OrderNotPayableError) {
        throw new ConflictException(error.message);
      }
      if (
        error instanceof PaymentMethodTokenizationError ||
        error instanceof TransactionCreationError
      ) {
        throw new UnprocessableEntityException(error.message);
      }
      if (error instanceof UnsupportedPaymentMethodError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
