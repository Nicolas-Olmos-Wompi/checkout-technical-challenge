import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HandlerGetProducts } from "./get-products.handler";
import { GetProductsUseCase } from "../../domain/src/usecase/get-products.usecase";
import { ProductMapper } from "../model/mapper/product.mapper";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import {
  GetProductsRequest,
  PaginatedProductsResponse,
} from "../model/dto/product.type";
import {
  ProductFilterCriteria,
  ProductsResult,
} from "../../domain/src/model/product.type";

describe("HandlerGetProducts", () => {
  let handler: HandlerGetProducts;
  let getProductsUseCase: GetProductsUseCase;

  const domainResult: ProductsResult = {
    items: [],
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  const dtoResponse: PaginatedProductsResponse = {
    items: [],
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlerGetProducts,
        {
          provide: "GetProductsUseCase",
          useValue: {
            apply: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<HandlerGetProducts>(HandlerGetProducts);
    getProductsUseCase = module.get<GetProductsUseCase>("GetProductsUseCase");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should return a successful HTTP response", async () => {
    const request = new GetProductsRequest();
    const query: Partial<ProductFilterCriteria> = { page: 1, pageSize: 10 };

    jest.spyOn(ProductMapper, "toQuery").mockReturnValue(query);
    jest.spyOn(getProductsUseCase, "apply").mockResolvedValue(domainResult);
    jest.spyOn(ProductMapper, "toDTO").mockReturnValue(dtoResponse);

    const result = await handler.execute(request);

    expect(result).toEqual(
      new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        dtoResponse,
      ),
    );
  });

  it("should call ProductMapper.toQuery with the correct request", async () => {
    const request = new GetProductsRequest();
    const toQuerySpy = jest.spyOn(ProductMapper, "toQuery");
    jest.spyOn(getProductsUseCase, "apply").mockResolvedValue(domainResult);

    await handler.execute(request);

    expect(toQuerySpy).toHaveBeenCalledWith(request);
  });

  it("should call GetProductsUseCase.apply with the mapped query", async () => {
    const request = new GetProductsRequest();
    const query: Partial<ProductFilterCriteria> = { page: 2, pageSize: 5 };

    jest.spyOn(ProductMapper, "toQuery").mockReturnValue(query);
    jest.spyOn(getProductsUseCase, "apply").mockResolvedValue(domainResult);

    await handler.execute(request);

    expect(getProductsUseCase.apply).toHaveBeenCalledWith(query);
  });

  it("should call ProductMapper.toDTO with the use case result", async () => {
    const request = new GetProductsRequest();
    jest.spyOn(getProductsUseCase, "apply").mockResolvedValue(domainResult);
    const toDTOSpy = jest.spyOn(ProductMapper, "toDTO");

    await handler.execute(request);

    expect(toDTOSpy).toHaveBeenCalledWith(domainResult);
  });
});
