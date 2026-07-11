import {
  ConflictException,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HandlerCreateOrder } from "./create-order.handler";
import { CreateOrderUseCase } from "../../domain/src/usecase/create-order.usecase";
import { OrderMapper } from "../model/mapper/order.mapper";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import {
  CreateOrderRequest,
  PendingOrderResponse,
} from "../model/dto/order.type";
import { Order } from "../../domain/src/model/order.entity";
import { Delivery } from "../../domain/src/model/delivery.entity";
import { CreateOrderResult } from "../../domain/src/model/order.type";
import {
  InsufficientStockError,
  ProductNotFoundError,
} from "../../domain/src/model/order.errors";

describe("HandlerCreateOrder", () => {
  let handler: HandlerCreateOrder;
  let createOrderUseCase: CreateOrderUseCase;

  const userId = "11111111-1111-1111-1111-111111111111";

  const request: CreateOrderRequest = {
    productId: "22222222-2222-2222-2222-222222222222",
    quantity: 2,
    delivery: {
      personName: "John Doe",
      address: "123 Main St",
      country: "CO",
      city: "Bogota",
      region: "Bogota D.C.",
      postalCode: "110111",
      phoneNumber: "+573000000000",
    },
  };

  const domainResult: CreateOrderResult = {
    order: Object.assign(new Order(), {
      id: "33333333-3333-3333-3333-333333333333",
      userId,
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 2,
      totalInCents: 200000,
      status: "PENDING",
      paymentGatewayTransactionId: null,
      acceptanceTokenEndUserPolicy: "end-user-policy-token",
      acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    }),
    delivery: Object.assign(new Delivery(), {
      id: "44444444-4444-4444-4444-444444444444",
      orderId: "33333333-3333-3333-3333-333333333333",
      personName: "John Doe",
      address: "123 Main St",
      country: "CO",
      city: "Bogota",
      region: "Bogota D.C.",
      postalCode: "110111",
      phoneNumber: "+573000000000",
      fee: null,
    }),
    acceptance: {
      endUserPolicy: {
        acceptanceToken: "end-user-policy-token",
        permalink: "https://wompi.com/end-user-policy.pdf",
      },
      personalDataAuth: {
        acceptanceToken: "personal-data-auth-token",
        permalink: "https://wompi.com/personal-data-auth.pdf",
      },
    },
  };

  const dtoResponse: PendingOrderResponse = {
    orderId: "33333333-3333-3333-3333-333333333333",
    reference: "33333333-3333-3333-3333-333333333333",
    status: "PENDING",
    productId: "22222222-2222-2222-2222-222222222222",
    quantity: 2,
    totalInCents: 200000,
    delivery: {
      id: "44444444-4444-4444-4444-444444444444",
      personName: "John Doe",
      address: "123 Main St",
      country: "CO",
      city: "Bogota",
      region: "Bogota D.C.",
      postalCode: "110111",
      phoneNumber: "+573000000000",
      fee: null,
    },
    presignedAcceptance: {
      endUserPolicy: {
        acceptanceToken: "end-user-policy-token",
        permalink: "https://wompi.com/end-user-policy.pdf",
      },
      personalDataAuth: {
        acceptanceToken: "personal-data-auth-token",
        permalink: "https://wompi.com/personal-data-auth.pdf",
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlerCreateOrder,
        {
          provide: "CreateOrderUseCase",
          useValue: {
            apply: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<HandlerCreateOrder>(HandlerCreateOrder);
    createOrderUseCase = module.get<CreateOrderUseCase>("CreateOrderUseCase");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should return a CREATED HTTP response with the pending order", async () => {
    jest.spyOn(createOrderUseCase, "apply").mockResolvedValue(domainResult);
    jest.spyOn(OrderMapper, "toDTO").mockReturnValue(dtoResponse);

    const result = await handler.execute(userId, request);

    expect(result).toEqual(
      new HTTPResponse(
        HttpStatus.CREATED,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        dtoResponse,
      ),
    );
  });

  it("should call CreateOrderUseCase.apply with the mapped command", async () => {
    const applySpy = jest
      .spyOn(createOrderUseCase, "apply")
      .mockResolvedValue(domainResult);

    await handler.execute(userId, request);

    expect(applySpy).toHaveBeenCalledTimes(1);
    const callArg = applySpy.mock.calls[0]?.[0];
    expect(callArg).toMatchObject({
      userId,
      productId: request.productId,
      quantity: request.quantity,
    });
    expect(callArg?.delivery.personName).toBe("John Doe");
  });

  it("should translate ProductNotFoundError into a NotFoundException", async () => {
    jest
      .spyOn(createOrderUseCase, "apply")
      .mockRejectedValue(new ProductNotFoundError(request.productId));

    await expect(handler.execute(userId, request)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should translate InsufficientStockError into a ConflictException", async () => {
    jest
      .spyOn(createOrderUseCase, "apply")
      .mockRejectedValue(new InsufficientStockError(request.productId, 2, 1));

    await expect(handler.execute(userId, request)).rejects.toThrow(
      ConflictException,
    );
  });
});
