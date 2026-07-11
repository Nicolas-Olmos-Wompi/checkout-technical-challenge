import { MockProxy, mock } from "jest-mock-extended";
import {
  Between,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { ProductEntity } from "./product.entity";
import { ProductRepository } from "./product.repository";

describe("ProductRepository", () => {
  let productRepository: ProductRepository;
  let repository: MockProxy<Repository<ProductEntity>>;

  const buildEntity = (id: string): ProductEntity => {
    const entity = new ProductEntity();
    entity.id = id;
    entity.name = "Product name";
    entity.description = "Product description";
    entity.price = 100000;
    entity.stock = 10;
    entity.image = null;
    entity.createdAt = new Date("2024-01-01T00:00:00.000Z");
    entity.updatedAt = new Date("2024-01-01T00:00:00.000Z");
    return entity;
  };

  beforeEach(() => {
    repository = mock<Repository<ProductEntity>>();
    productRepository = new ProductRepository(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should query with pagination and no filters when none are provided", async () => {
    repository.findAndCount.mockResolvedValue([[buildEntity("1")], 1]);

    await productRepository.findProducts({ page: 1, pageSize: 10 });

    expect(repository.findAndCount).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      order: { createdAt: "DESC" },
    });
  });

  it("should calculate skip based on page and pageSize", async () => {
    repository.findAndCount.mockResolvedValue([[], 0]);

    await productRepository.findProducts({ page: 3, pageSize: 5 });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 }),
    );
  });

  it("should filter by name using ILike", async () => {
    repository.findAndCount.mockResolvedValue([[], 0]);

    await productRepository.findProducts({
      page: 1,
      pageSize: 10,
      name: "headphones",
    });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: ILike("%headphones%") },
      }),
    );
  });

  it("should filter by price range using Between when min and max are provided", async () => {
    repository.findAndCount.mockResolvedValue([[], 0]);

    await productRepository.findProducts({
      page: 1,
      pageSize: 10,
      minPrice: 1000,
      maxPrice: 5000,
    });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { price: Between(1000, 5000) },
      }),
    );
  });

  it("should filter by MoreThanOrEqual when only minPrice is provided", async () => {
    repository.findAndCount.mockResolvedValue([[], 0]);

    await productRepository.findProducts({
      page: 1,
      pageSize: 10,
      minPrice: 1000,
    });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { price: MoreThanOrEqual(1000) },
      }),
    );
  });

  it("should filter by LessThanOrEqual when only maxPrice is provided", async () => {
    repository.findAndCount.mockResolvedValue([[], 0]);

    await productRepository.findProducts({
      page: 1,
      pageSize: 10,
      maxPrice: 5000,
    });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { price: LessThanOrEqual(5000) },
      }),
    );
  });

  it("should map returned entities to domain products and return the total", async () => {
    const entity = buildEntity("1");
    repository.findAndCount.mockResolvedValue([[entity], 1]);

    const result = await productRepository.findProducts({
      page: 1,
      pageSize: 10,
    });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe("1");
    expect(result.items[0]?.price).toBe(100000);
  });

  describe("findById", () => {
    it("should return the mapped product when found", async () => {
      const entity = buildEntity("1");
      repository.findOne.mockResolvedValue(entity);

      const result = await productRepository.findById("1");

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toMatchObject({ id: "1", price: 100000 });
    });

    it("should return null when no product matches", async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await productRepository.findById("unknown");

      expect(result).toBeNull();
    });
  });
});
