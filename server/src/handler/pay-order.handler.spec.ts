import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HandlerPayOrder } from "./pay-order.handler";
import { PayOrderUseCase } from "../../domain/src/usecase/pay-order.usecase";
import { PayOrderMapper } from "../model/mapper/pay-order.mapper";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { PayOrderRequest, PayOrderResponse } from "../model/dto/order.type";
import { Order } from "../../domain/src/model/order.entity";
import { PayOrderResult } from "../../domain/src/model/payment.type";
import {
  OrderNotFoundError,
  OrderNotPayableError,
  PaymentMethodTokenizationError,
  TransactionCreationError,
  UnsupportedPaymentMethodError,
} from "../../domain/src/model/payment.errors";

describe("HandlerPayOrder", () => {
  let handler: HandlerPayOrder;
  let payOrderUseCase: PayOrderUseCase;

  const userId = "11111111-1111-1111-1111-111111111111";
  const orderId = "33333333-3333-3333-3333-333333333333";

  const request: PayOrderRequest = {
    paymentMethodType: "CARD",
    card: {
      cardNumber: "4242424242424242",
      expMonth: "06",
      expYear: "29",
      cvc: "123",
      cardHolder: "John Doe",
    },
  };

  const domainResult: PayOrderResult = {
    order: Object.assign(new Order(), {
      id: orderId,
      userId,
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 1,
      totalInCents: 200000,
      status: "APPROVED",
      paymentGatewayTransactionId: "tx-123",
      acceptanceTokenEndUserPolicy: "end-user-policy-token",
      acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    }),
    paymentMethod: {
      type: "CARD",
      displayInfo: { brand: "VISA", lastFour: "4242" },
    },
    timedOut: false,
  };

  const dtoResponse: PayOrderResponse = {
    orderId,
    status: "APPROVED",
    paymentGatewayTransactionId: "tx-123",
    timedOut: false,
    paymentMethod: {
      type: "CARD",
      displayInfo: { brand: "VISA", lastFour: "4242" },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlerPayOrder,
        {
          provide: "PayOrderUseCase",
          useValue: { apply: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<HandlerPayOrder>(HandlerPayOrder);
    payOrderUseCase = module.get<PayOrderUseCase>("PayOrderUseCase");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should return an OK HTTP response with the pay order result", async () => {
    jest.spyOn(payOrderUseCase, "apply").mockResolvedValue(domainResult);
    jest.spyOn(PayOrderMapper, "toDTO").mockReturnValue(dtoResponse);

    const result = await handler.execute(userId, orderId, request);

    expect(result).toEqual(
      new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        dtoResponse,
      ),
    );
  });

  it("should call PayOrderUseCase.apply with the mapped command", async () => {
    const applySpy = jest
      .spyOn(payOrderUseCase, "apply")
      .mockResolvedValue(domainResult);

    await handler.execute(userId, orderId, request);

    expect(applySpy).toHaveBeenCalledTimes(1);
    const callArg = applySpy.mock.calls[0]?.[0];
    expect(callArg).toMatchObject({
      userId,
      orderId,
      paymentMethodType: "CARD",
    });
  });

  it("should translate OrderNotFoundError into a NotFoundException", async () => {
    jest
      .spyOn(payOrderUseCase, "apply")
      .mockRejectedValue(new OrderNotFoundError(orderId));

    await expect(handler.execute(userId, orderId, request)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should translate OrderNotPayableError into a ConflictException", async () => {
    jest
      .spyOn(payOrderUseCase, "apply")
      .mockRejectedValue(new OrderNotPayableError(orderId, "APPROVED"));

    await expect(handler.execute(userId, orderId, request)).rejects.toThrow(
      ConflictException,
    );
  });

  it("should translate PaymentMethodTokenizationError into an UnprocessableEntityException", async () => {
    jest
      .spyOn(payOrderUseCase, "apply")
      .mockRejectedValue(new PaymentMethodTokenizationError("declined"));

    await expect(handler.execute(userId, orderId, request)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it("should translate TransactionCreationError into an UnprocessableEntityException", async () => {
    jest
      .spyOn(payOrderUseCase, "apply")
      .mockRejectedValue(new TransactionCreationError("gateway rejected"));

    await expect(handler.execute(userId, orderId, request)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it("should translate UnsupportedPaymentMethodError into a BadRequestException", async () => {
    jest
      .spyOn(payOrderUseCase, "apply")
      .mockRejectedValue(new UnsupportedPaymentMethodError("NEQUI"));

    await expect(handler.execute(userId, orderId, request)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should rethrow unknown errors that are not domain errors", async () => {
    const unknownError = new Error("database failure");
    jest.spyOn(payOrderUseCase, "apply").mockRejectedValue(unknownError);

    await expect(handler.execute(userId, orderId, request)).rejects.toThrow(unknownError);
  });
});
