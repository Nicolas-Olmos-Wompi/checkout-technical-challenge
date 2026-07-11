import { DeliveryEntity } from "../../adapter/out/postgres/delivery.entity";
import { DeliveryEntityMapper } from "./delivery-entity.mapper";

describe("DeliveryEntityMapper", () => {
  const buildEntity = (
    overrides: Partial<DeliveryEntity> = {},
  ): DeliveryEntity => {
    const entity = new DeliveryEntity();
    entity.id = "44444444-4444-4444-4444-444444444444";
    entity.orderId = "33333333-3333-3333-3333-333333333333";
    entity.personName = "John Doe";
    entity.address = "123 Main St";
    entity.country = "CO";
    entity.city = "Bogota";
    entity.region = "Bogota D.C.";
    entity.postalCode = "110111";
    entity.phoneNumber = "+573000000000";
    entity.fee = null;
    return Object.assign(entity, overrides);
  };

  describe("toModel", () => {
    it("should map a DeliveryEntity to a domain Delivery", () => {
      const entity = buildEntity();

      const result = DeliveryEntityMapper.toModel(entity);

      expect(result).toMatchObject({
        id: entity.id,
        orderId: entity.orderId,
        personName: entity.personName,
        address: entity.address,
        country: entity.country,
        city: entity.city,
        region: entity.region,
        postalCode: entity.postalCode,
        phoneNumber: entity.phoneNumber,
        fee: entity.fee,
      });
    });
  });
});
