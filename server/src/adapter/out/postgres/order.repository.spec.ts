import { MockProxy, mock } from "jest-mock-extended";
import { DataSource, EntityManager, Repository } from "typeorm";
import { OrderEntity } from "./order.entity";
import { DeliveryEntity } from "./delivery.entity";
import { OrderRepository } from "./order.repository";

describe("OrderRepository", () => {
  let orderRepository: OrderRepository;
  let dataSource: MockProxy<DataSource>;
  let entityManager: MockProxy<EntityManager>;
  let orderRepo: MockProxy<Repository<OrderEntity>>;
  let deliveryRepo: MockProxy<Repository<DeliveryEntity>>;

  const orderParams = {
    userId: "11111111-1111-1111-1111-111111111111",
    productId: "22222222-2222-2222-2222-222222222222",
    quantity: 2,
    total: 200000,
    status: "PENDING" as const,
    paymentGatewayTransactionId: null,
    acceptanceTokenEndUserPolicy: "end-user-policy-token",
    acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
  };

  const deliveryParams = {
    personName: "John Doe",
    address: "123 Main St",
    country: "CO",
    city: "Bogota",
    region: "Bogota D.C.",
    postalCode: "110111",
    phoneNumber: "+573000000000",
    fee: null,
  };

  const buildOrderEntity = (): OrderEntity => {
    const entity = new OrderEntity();
    Object.assign(entity, {
      id: "33333333-3333-3333-3333-333333333333",
      ...orderParams,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });
    return entity;
  };

  const buildDeliveryEntity = (): DeliveryEntity => {
    const entity = new DeliveryEntity();
    Object.assign(entity, {
      id: "44444444-4444-4444-4444-444444444444",
      orderId: "33333333-3333-3333-3333-333333333333",
      ...deliveryParams,
    });
    return entity;
  };

  beforeEach(() => {
    dataSource = mock<DataSource>();
    entityManager = mock<EntityManager>();
    orderRepo = mock<Repository<OrderEntity>>();
    deliveryRepo = mock<Repository<DeliveryEntity>>();

    entityManager.getRepository.mockImplementation((target: unknown) => {
      if (target === OrderEntity) return orderRepo;
      if (target === DeliveryEntity) return deliveryRepo;
      throw new Error("Unexpected repository requested");
    });

    dataSource.transaction.mockImplementation(async (fn: unknown) => {
      return (fn as (manager: EntityManager) => Promise<unknown>)(
        entityManager,
      );
    });

    orderRepository = new OrderRepository(dataSource);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("should persist the order and delivery within a single transaction", async () => {
      const orderEntity = buildOrderEntity();
      const deliveryEntity = buildDeliveryEntity();

      orderRepo.create.mockReturnValue(orderEntity);
      orderRepo.save.mockResolvedValue(orderEntity);
      deliveryRepo.create.mockReturnValue(deliveryEntity);
      deliveryRepo.save.mockResolvedValue(deliveryEntity);

      await orderRepository.create({
        order: orderParams,
        delivery: deliveryParams,
      });

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(orderRepo.create).toHaveBeenCalledWith(orderParams);
      expect(orderRepo.save).toHaveBeenCalledWith(orderEntity);
    });

    it("should persist the delivery linked to the created order's id", async () => {
      const orderEntity = buildOrderEntity();
      const deliveryEntity = buildDeliveryEntity();

      orderRepo.create.mockReturnValue(orderEntity);
      orderRepo.save.mockResolvedValue(orderEntity);
      deliveryRepo.create.mockReturnValue(deliveryEntity);
      deliveryRepo.save.mockResolvedValue(deliveryEntity);

      await orderRepository.create({
        order: orderParams,
        delivery: deliveryParams,
      });

      expect(deliveryRepo.create).toHaveBeenCalledWith({
        ...deliveryParams,
        orderId: orderEntity.id,
      });
      expect(deliveryRepo.save).toHaveBeenCalledWith(deliveryEntity);
    });

    it("should return the mapped domain order and delivery", async () => {
      const orderEntity = buildOrderEntity();
      const deliveryEntity = buildDeliveryEntity();

      orderRepo.create.mockReturnValue(orderEntity);
      orderRepo.save.mockResolvedValue(orderEntity);
      deliveryRepo.create.mockReturnValue(deliveryEntity);
      deliveryRepo.save.mockResolvedValue(deliveryEntity);

      const result = await orderRepository.create({
        order: orderParams,
        delivery: deliveryParams,
      });

      expect(result.order).toMatchObject({
        id: orderEntity.id,
        userId: orderParams.userId,
        total: orderParams.total,
        status: "PENDING",
      });
      expect(result.delivery).toMatchObject({
        id: deliveryEntity.id,
        orderId: orderEntity.id,
        personName: deliveryParams.personName,
      });
    });
  });
});
