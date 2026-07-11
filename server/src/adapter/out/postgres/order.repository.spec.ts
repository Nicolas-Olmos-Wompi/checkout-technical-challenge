import { MockProxy, mock } from "jest-mock-extended";
import { Repository } from "typeorm";
import { OrderEntity } from "./order.entity";
import { OrderRepository } from "./order.repository";

describe("OrderRepository", () => {
  let orderRepository: OrderRepository;
  let repo: MockProxy<Repository<OrderEntity>>;

  const orderInput = {
    userId: "11111111-1111-1111-1111-111111111111",
    productId: "22222222-2222-2222-2222-222222222222",
    quantity: 2,
    total: 200000,
    status: "PENDING" as const,
    paymentGatewayTransactionId: null,
    acceptanceTokenEndUserPolicy: "end-user-policy-token",
    acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
  };

  const buildOrderEntity = (): OrderEntity => {
    const entity = new OrderEntity();
    Object.assign(entity, {
      id: "33333333-3333-3333-3333-333333333333",
      ...orderInput,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });
    return entity;
  };

  beforeEach(() => {
    repo = mock<Repository<OrderEntity>>();
    orderRepository = new OrderRepository(repo);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("should persist the order and return the mapped domain entity", async () => {
      const orderEntity = buildOrderEntity();
      repo.create.mockReturnValue(orderEntity);
      repo.save.mockResolvedValue(orderEntity);

      const result = await orderRepository.create(orderInput);

      expect(repo.create).toHaveBeenCalledWith(orderInput);
      expect(repo.save).toHaveBeenCalledWith(orderEntity);
      expect(result).toMatchObject({
        id: "33333333-3333-3333-3333-333333333333",
        userId: orderInput.userId,
        total: orderInput.total,
        status: "PENDING",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });
});
