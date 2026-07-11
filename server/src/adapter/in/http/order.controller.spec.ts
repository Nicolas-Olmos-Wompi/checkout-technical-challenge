import { Test, TestingModule } from "@nestjs/testing";
import { OrderController } from "./order.controller";
import { HandlerCreateOrder } from "src/handler/create-order.handler";
import { HandlerPayOrder } from "src/handler/pay-order.handler";
import { HandlerGetOrder } from "src/handler/get-order.handler";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { HTTPResponse } from "src/model/dto/http-response.model";
import { CreateOrderRequest, PayOrderRequest } from "src/model/dto/order.type";

describe("OrderController", () => {
  let controller: OrderController;
  let handlerCreateOrder: HandlerCreateOrder;
  let handlerPayOrder: HandlerPayOrder;
  let handlerGetOrder: HandlerGetOrder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: HandlerCreateOrder,
          useValue: {
            execute: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: HandlerPayOrder,
          useValue: {
            execute: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: HandlerGetOrder,
          useValue: {
            execute: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<OrderController>(OrderController);
    handlerCreateOrder = module.get<HandlerCreateOrder>(HandlerCreateOrder);
    handlerPayOrder = module.get<HandlerPayOrder>(HandlerPayOrder);
    handlerGetOrder = module.get<HandlerGetOrder>(HandlerGetOrder);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call handlerCreateOrder.execute with the authenticated user's id and the request", async () => {
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
    const result = {} as HTTPResponse;
    const req = {
      user: { id: "11111111-1111-1111-1111-111111111111", username: "johndoe" },
    };

    jest.spyOn(handlerCreateOrder, "execute").mockResolvedValue(result);

    const response = await controller.createOrder(request, req);

    expect(handlerCreateOrder.execute).toHaveBeenCalledWith(
      "11111111-1111-1111-1111-111111111111",
      request,
    );
    expect(response).toBe(result);
  });

  it("should call handlerPayOrder.execute with the authenticated user's id, order id, and request", async () => {
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
    const result = {} as HTTPResponse;
    const req = {
      user: { id: "11111111-1111-1111-1111-111111111111", username: "johndoe" },
    };

    jest.spyOn(handlerPayOrder, "execute").mockResolvedValue(result);

    const response = await controller.payOrder(
      "33333333-3333-3333-3333-333333333333",
      request,
      req,
    );

    expect(handlerPayOrder.execute).toHaveBeenCalledWith(
      "11111111-1111-1111-1111-111111111111",
      "33333333-3333-3333-3333-333333333333",
      request,
    );
    expect(response).toBe(result);
  });

  it("should call handlerGetOrder.execute with the authenticated user's id and order id", async () => {
    const result = {} as HTTPResponse;
    const req = {
      user: { id: "11111111-1111-1111-1111-111111111111", username: "johndoe" },
    };

    jest.spyOn(handlerGetOrder, "execute").mockResolvedValue(result);

    const response = await controller.getOrder(
      "33333333-3333-3333-3333-333333333333",
      req,
    );

    expect(handlerGetOrder.execute).toHaveBeenCalledWith(
      "11111111-1111-1111-1111-111111111111",
      "33333333-3333-3333-3333-333333333333",
    );
    expect(response).toBe(result);
  });
});
