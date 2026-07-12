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
import { LoggerService } from "../common/logger/logger.service";
import { PayOrderRequest, PayOrderResponse } from "../model/dto/order.type";

@Injectable()
export class HandlerPayOrder {
  private readonly logger = new LoggerService("HandlerPayOrder");

  constructor(
    @Inject("PayOrderUseCase")
    private readonly payOrderUC: PayOrderUseCase,
  ) {}

  async execute(
    userId: string,
    orderId: string,
    request: PayOrderRequest,
  ): Promise<HTTPResponse> {
    this.logger.log("POST /orders/:id/pay", {
      userId,
      orderId,
      paymentMethodType: request.paymentMethodType,
    });

    try {
      const command = PayOrderMapper.toCommand(userId, orderId, request);
      const result = await this.payOrderUC.apply(command);
      const response: PayOrderResponse = PayOrderMapper.toDTO(result);

      this.logger.log("Pay order handler completed", {
        userId,
        orderId,
        finalStatus: result.order.status,
        timedOut: result.timedOut,
      });

      return new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      );
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        this.logger.warn("Pay order: order not found", { userId, orderId });
        throw new NotFoundException(error.message);
      }
      if (error instanceof OrderNotPayableError) {
        this.logger.warn("Pay order: order not payable", { userId, orderId });
        throw new ConflictException(error.message);
      }
      if (
        error instanceof PaymentMethodTokenizationError ||
        error instanceof TransactionCreationError
      ) {
        this.logger.warn("Pay order: payment processing error", {
          userId,
          orderId,
          error: error.message,
        });
        throw new UnprocessableEntityException(error.message);
      }
      if (error instanceof UnsupportedPaymentMethodError) {
        this.logger.warn("Pay order: unsupported payment method", {
          userId,
          orderId,
          paymentMethodType: request.paymentMethodType,
        });
        throw new BadRequestException(error.message);
      }
      this.logger.error(error, { userId, orderId });
      throw error;
    }
  }
}
