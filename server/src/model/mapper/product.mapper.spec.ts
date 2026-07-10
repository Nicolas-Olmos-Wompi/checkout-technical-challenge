import { Product } from "../../../domain/src/model/product.entity";
import { ProductsResult } from "../../../domain/src/model/product.type";
import { GetProductsRequest } from "../dto/product.type";
import { ProductMapper } from "./product.mapper";

describe("ProductMapper", () => {
  describe("toQuery", () => {
    it("should map a request with all fields to domain criteria", () => {
      const request = new GetProductsRequest();
      request.page = 2;
      request.pageSize = 20;
      request.name = "headphones";
      request.minPrice = 1000;
      request.maxPrice = 5000;

      const result = ProductMapper.toQuery(request);

      expect(result).toEqual({
        page: 2,
        pageSize: 20,
        name: "headphones",
        minPrice: 1000,
        maxPrice: 5000,
      });
    });

    it("should default page to 1 and pageSize to 10 when not provided", () => {
      const request = new GetProductsRequest();

      const result = ProductMapper.toQuery(request);

      expect(result).toMatchObject({ page: 1, pageSize: 10 });
      expect(result.name).toBeUndefined();
      expect(result.minPrice).toBeUndefined();
      expect(result.maxPrice).toBeUndefined();
    });
  });

  describe("toDTO", () => {
    it("should map a domain ProductsResult to a PaginatedProductsResponse", () => {
      const product = new Product(
        "11111111-1111-1111-1111-111111111101",
        "Wireless Bluetooth Headphones",
        "Over-ear wireless headphones.",
        24999900,
        120,
        "https://images.example.com/products/headphones.jpg",
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      );
      const domainResult: ProductsResult = {
        items: [product],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      };

      const result = ProductMapper.toDTO(domainResult);

      expect(result).toEqual({
        items: [
          {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.image,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("should keep price as an integer (cents) with no conversion", () => {
      const product = new Product(
        "1",
        "name",
        "description",
        100000,
        5,
        null,
        new Date(),
        new Date(),
      );
      const domainResult: ProductsResult = {
        items: [product],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      };

      const result = ProductMapper.toDTO(domainResult);

      expect(result.items[0]?.price).toBe(100000);
    });

    it("should map an empty result to an empty items array", () => {
      const domainResult: ProductsResult = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      };

      const result = ProductMapper.toDTO(domainResult);

      expect(result).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });
});
