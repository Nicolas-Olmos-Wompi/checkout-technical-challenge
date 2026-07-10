import { ArgumentMetadata } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import * as classTransformer from "class-transformer";
import { GetProductsPipe } from "./get-products.pipe";
import { GetProductsRequest } from "src/model/dto/product.type";

describe("GetProductsPipe", () => {
  let getProductsPipe: GetProductsPipe;

  beforeEach(() => {
    getProductsPipe = new GetProductsPipe();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return the dto if metatype is not provided", () => {
    const dto: GetProductsRequest = { page: 1, pageSize: 10 };
    const metadata: ArgumentMetadata = {
      metatype: undefined,
      type: "query",
    };

    const result = getProductsPipe.transform(dto, metadata);

    expect(result).toBe(dto);
  });

  it("should transform the dto if metatype is provided", () => {
    const dto: GetProductsRequest = { page: 1, pageSize: 10 };
    const metadata: ArgumentMetadata = {
      metatype: GetProductsRequest,
      type: "query",
    };
    jest.spyOn(classTransformer, "plainToInstance").mockReturnValue(dto);

    const result = getProductsPipe.transform(dto, metadata);

    expect(result).toEqual(dto);
    expect(plainToInstance).toHaveBeenCalledWith(GetProductsRequest, dto);
  });
});
