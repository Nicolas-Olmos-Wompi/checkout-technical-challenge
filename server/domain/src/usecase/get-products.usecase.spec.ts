import { MockProxy, mock } from "jest-mock-extended";
import { IProductRepository } from "../interface/product.repository";
import { ILogger } from "../interface/logger.interface";
import { Product } from "../model/product.entity";
import { GetProductsUseCase } from "./get-products.usecase";

describe("GetProductsUseCase", () => {
  let getProductsUseCase: GetProductsUseCase;
  let productRepository: MockProxy<IProductRepository>;
  let logger: MockProxy<ILogger>;

  const buildProduct = (id: string): Product =>
    new Product(
      id,
      "Product name",
      "Product description",
      100000,
      10,
      null,
      new Date("2024-01-01T00:00:00.000Z"),
      new Date("2024-01-01T00:00:00.000Z"),
    );

  beforeEach(() => {
    productRepository = mock<IProductRepository>();
    logger = mock<ILogger>();
    getProductsUseCase = new GetProductsUseCase(productRepository, logger);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should forward filters and pagination to the repository", async () => {
    productRepository.findProducts.mockResolvedValue({ items: [], total: 0 });

    await getProductsUseCase.apply({
      page: 2,
      pageSize: 5,
      name: "headphones",
      minPrice: 1000,
      maxPrice: 5000,
    });

    expect(productRepository.findProducts).toHaveBeenCalledWith({
      page: 2,
      pageSize: 5,
      name: "headphones",
      minPrice: 1000,
      maxPrice: 5000,
    });
  });

  it("should default page to 1 and pageSize to 10 when not provided", async () => {
    productRepository.findProducts.mockResolvedValue({ items: [], total: 0 });

    await getProductsUseCase.apply({});

    expect(productRepository.findProducts).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      name: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it("should default page and pageSize when given non-positive values", async () => {
    productRepository.findProducts.mockResolvedValue({ items: [], total: 0 });

    await getProductsUseCase.apply({ page: 0, pageSize: -5 });

    expect(productRepository.findProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 }),
    );
  });

  it("should calculate totalPages from total and pageSize", async () => {
    const items = [buildProduct("1"), buildProduct("2")];
    productRepository.findProducts.mockResolvedValue({ items, total: 25 });

    const result = await getProductsUseCase.apply({ page: 1, pageSize: 10 });

    expect(result).toEqual({
      items,
      page: 1,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it("should return an empty list with totalPages 0 when there are no matches", async () => {
    productRepository.findProducts.mockResolvedValue({ items: [], total: 0 });

    const result = await getProductsUseCase.apply({
      page: 1,
      pageSize: 10,
      name: "non-existent",
    });

    expect(result).toEqual({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    });
  });
});
