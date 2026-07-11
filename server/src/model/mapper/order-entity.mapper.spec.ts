import { OrderEntity } from "../../adapter/out/postgres/order.entity";
import { OrderEntityMapper } from "./order-entity.mapper";

describe("OrderEntityMapper", () => {
  const buildEntity = (overrides: Partial<OrderEntity> = {}): OrderEntity => {
    const entity = new OrderEntity();
    entity.id = "33333333-3333-3333-3333-333333333333";
    entity.userId = "11111111-1111-1111-1111-111111111111";
    entity.productId = "22222222-2222-2222-2222-222222222222";
    entity.quantity = 2;
    entity.totalInCents = 200000;
    entity.status = "PENDING";
    entity.paymentGatewayTransactionId = null;
    entity.acceptanceTokenEndUserPolicy = "end-user-policy-token";
    entity.acceptanceTokenPersonalDataAuth = "personal-data-auth-token";
    entity.createdAt = new Date("2024-01-01T00:00:00.000Z");
    entity.updatedAt = new Date("2024-01-01T00:00:00.000Z");
    return Object.assign(entity, overrides);
  };

  describe("toModel", () => {
    it("should map an OrderEntity to a domain Order", () => {
      const entity = buildEntity();

      const result = OrderEntityMapper.toModel(entity);

      expect(result).toMatchObject({
        id: entity.id,
        userId: entity.userId,
        productId: entity.productId,
        quantity: entity.quantity,
        totalInCents: entity.totalInCents,
        status: entity.status,
        paymentGatewayTransactionId: entity.paymentGatewayTransactionId,
        acceptanceTokenEndUserPolicy: entity.acceptanceTokenEndUserPolicy,
        acceptanceTokenPersonalDataAuth: entity.acceptanceTokenPersonalDataAuth,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    });
  });
});
