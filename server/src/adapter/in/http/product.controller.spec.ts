import { Test, TestingModule } from "@nestjs/testing";
import { ProductController } from "./product.controller";
import { HandlerGetProducts } from "src/handler/get-products.handler";
import { HTTPResponse } from "src/model/dto/http-response.model";
import { GetProductsRequest } from "src/model/dto/product.type";

describe("ProductController", () => {
  let controller: ProductController;
  let handlerGetProducts: HandlerGetProducts;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: HandlerGetProducts,
          useValue: {
            execute: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    handlerGetProducts = module.get<HandlerGetProducts>(HandlerGetProducts);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call handlerGetProducts.execute with the correct query", async () => {
    const query: GetProductsRequest = { page: 1, pageSize: 10 };
    const result = {} as HTTPResponse;

    jest.spyOn(handlerGetProducts, "execute").mockResolvedValue(result);

    const response = await controller.getProducts(query);

    expect(handlerGetProducts.execute).toHaveBeenCalledWith(query);
    expect(response).toBe(result);
  });
});
