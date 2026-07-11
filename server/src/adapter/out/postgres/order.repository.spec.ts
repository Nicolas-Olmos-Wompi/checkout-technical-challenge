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
    totalInCents: 200000,
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
        totalInCents: orderInput.totalInCents,
        status: "PENDING",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });

  describe("findById", () => {
    it("should return the mapped order when found", async () => {
      const orderEntity = buildOrderEntity();
      repo.findOne.mockResolvedValue(orderEntity);

      const result = await orderRepository.findById(
        "33333333-3333-3333-3333-333333333333",
      );

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: "33333333-3333-3333-3333-333333333333" },
      });
      expect(result).toMatchObject({
        id: "33333333-3333-3333-3333-333333333333",
        userId: orderInput.userId,
      });
    });

    it("should return null when no order matches", async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await orderRepository.findById(
        "99999999-9999-9999-9999-999999999999",
      );

      expect(result).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("should update the status and payment gateway transaction id, returning the mapped order", async () => {
      const orderEntity = buildOrderEntity();
      const updatedEntity = Object.assign(new OrderEntity(), orderEntity, {
        status: "APPROVED",
        paymentGatewayTransactionId: "tx-123",
      });
      repo.findOne.mockResolvedValue(updatedEntity);

      const result = await orderRepository.updateStatus(
        "33333333-3333-3333-3333-333333333333",
        { status: "APPROVED", paymentGatewayTransactionId: "tx-123" },
      );

      expect(repo.update).toHaveBeenCalledWith(
        "33333333-3333-3333-3333-333333333333",
        { status: "APPROVED", paymentGatewayTransactionId: "tx-123" },
      );
      expect(result).toMatchObject({
        id: "33333333-3333-3333-3333-333333333333",
        status: "APPROVED",
        paymentGatewayTransactionId: "tx-123",
      });
    });

    it("should update only the status when paymentGatewayTransactionId is not provided", async () => {
      const orderEntity = buildOrderEntity();
      repo.findOne.mockResolvedValue(orderEntity);

      await orderRepository.updateStatus(
        "33333333-3333-3333-3333-333333333333",
        { status: "PENDING" },
      );

      expect(repo.update).toHaveBeenCalledWith(
        "33333333-3333-3333-3333-333333333333",
        { status: "PENDING" },
      );
    });
  });
});
