import { HttpStatus, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HandlerGetOrder } from "./get-order.handler";
import { PayOrderMapper } from "../model/mapper/pay-order.mapper";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { OrderResponse } from "../model/dto/order.type";
import { Order } from "../../domain/src/model/order.entity";
import { IOrderRepository } from "../../domain/src/interface/order.repository";

describe("HandlerGetOrder", () => {
  let handler: HandlerGetOrder;
  let orderRepository: IOrderRepository;

  const userId = "11111111-1111-1111-1111-111111111111";
  const orderId = "33333333-3333-3333-3333-333333333333";

  const buildOrder = (overrides: Partial<Order> = {}): Order =>
    Object.assign(new Order(), {
      id: orderId,
      userId,
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 1,
      totalInCents: 200000,
      status: "PENDING",
      paymentGatewayTransactionId: null,
      acceptanceTokenEndUserPolicy: "end-user-policy-token",
      acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      ...overrides,
    });

  const dtoResponse: OrderResponse = {
    orderId,
    productId: "22222222-2222-2222-2222-222222222222",
    quantity: 1,
    totalInCents: 200000,
    status: "PENDING",
    paymentGatewayTransactionId: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlerGetOrder,
        {
          provide: "OrderRepository",
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<HandlerGetOrder>(HandlerGetOrder);
    orderRepository = module.get<IOrderRepository>("OrderRepository");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should return an OK HTTP response with the order when found and owned by the user", async () => {
    jest.spyOn(orderRepository, "findById").mockResolvedValue(buildOrder());
    jest.spyOn(PayOrderMapper, "toOrderResponse").mockReturnValue(dtoResponse);

    const result = await handler.execute(userId, orderId);

    expect(result).toEqual(
      new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        dtoResponse,
      ),
    );
  });

  it("should throw NotFoundException when the order does not exist", async () => {
    jest.spyOn(orderRepository, "findById").mockResolvedValue(null);

    await expect(handler.execute(userId, orderId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException when the order belongs to another user", async () => {
    jest
      .spyOn(orderRepository, "findById")
      .mockResolvedValue(
        buildOrder({ userId: "99999999-9999-9999-9999-999999999999" }),
      );

    await expect(handler.execute(userId, orderId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
