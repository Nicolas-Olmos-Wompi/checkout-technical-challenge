import { ProductEntity } from "../../adapter/out/postgres/product.entity";
import { ProductEntityMapper } from "./product-entity.mapper";

describe("ProductEntityMapper", () => {
  const buildEntity = (
    overrides: Partial<ProductEntity> = {},
  ): ProductEntity => {
    const entity = new ProductEntity();
    entity.id = "11111111-1111-1111-1111-111111111101";
    entity.name = "Wireless Bluetooth Headphones";
    entity.description = "Over-ear wireless headphones.";
    entity.price = 24999900;
    entity.stock = 120;
    entity.image = "https://images.example.com/products/headphones.jpg";
    entity.createdAt = new Date("2024-01-01T00:00:00.000Z");
    entity.updatedAt = new Date("2024-01-02T00:00:00.000Z");
    return Object.assign(entity, overrides);
  };

  describe("toModel", () => {
    it("should map a ProductEntity to a domain Product", () => {
      const entity = buildEntity();

      const result = ProductEntityMapper.toModel(entity);

      expect(result).toMatchObject({
        id: entity.id,
        name: entity.name,
        description: entity.description,
        price: entity.price,
        stock: entity.stock,
        image: entity.image,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    });

    it("should keep image as null when the entity has no image", () => {
      const entity = buildEntity({ image: null });

      const result = ProductEntityMapper.toModel(entity);

      expect(result.image).toBeNull();
    });

    it("should keep price as an integer (cents) without conversion", () => {
      const entity = buildEntity({ price: 100000 });

      const result = ProductEntityMapper.toModel(entity);

      expect(result.price).toBe(100000);
    });
  });

  describe("toModelList", () => {
    it("should map a list of ProductEntity to a list of domain Product", () => {
      const entities = [buildEntity({ id: "1" }), buildEntity({ id: "2" })];

      const result = ProductEntityMapper.toModelList(entities);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("1");
      expect(result[1]?.id).toBe("2");
    });

    it("should return an empty array when given an empty list", () => {
      const result = ProductEntityMapper.toModelList([]);

      expect(result).toEqual([]);
    });
  });
});
