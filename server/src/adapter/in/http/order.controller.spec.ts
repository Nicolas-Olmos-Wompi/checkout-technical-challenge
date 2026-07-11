import { Test, TestingModule } from "@nestjs/testing";
import { OrderController } from "./order.controller";
import { HandlerCreateOrder } from "src/handler/create-order.handler";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { HTTPResponse } from "src/model/dto/http-response.model";
import { CreateOrderRequest } from "src/model/dto/order.type";

describe("OrderController", () => {
  let controller: OrderController;
  let handlerCreateOrder: HandlerCreateOrder;

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
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<OrderController>(OrderController);
    handlerCreateOrder = module.get<HandlerCreateOrder>(HandlerCreateOrder);
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
});
