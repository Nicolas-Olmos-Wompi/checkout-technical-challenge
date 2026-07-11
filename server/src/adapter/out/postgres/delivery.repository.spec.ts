import { MockProxy, mock } from "jest-mock-extended";
import { Repository } from "typeorm";
import { DeliveryEntity } from "./delivery.entity";
import { DeliveryRepository } from "./delivery.repository";

describe("DeliveryRepository", () => {
  let deliveryRepository: DeliveryRepository;
  let repo: MockProxy<Repository<DeliveryEntity>>;

  const deliveryInput = {
    orderId: "33333333-3333-3333-3333-333333333333",
    personName: "John Doe",
    address: "123 Main St",
    country: "CO",
    city: "Bogota",
    region: "Bogota D.C.",
    postalCode: "110111",
    phoneNumber: "+573000000000",
    fee: null,
  };

  const buildDeliveryEntity = (): DeliveryEntity => {
    const entity = new DeliveryEntity();
    Object.assign(entity, {
      id: "44444444-4444-4444-4444-444444444444",
      ...deliveryInput,
    });
    return entity;
  };

  beforeEach(() => {
    repo = mock<Repository<DeliveryEntity>>();
    deliveryRepository = new DeliveryRepository(repo);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("should persist the delivery and return the mapped domain entity", async () => {
      const deliveryEntity = buildDeliveryEntity();
      repo.create.mockReturnValue(deliveryEntity);
      repo.save.mockResolvedValue(deliveryEntity);

      const result = await deliveryRepository.create(deliveryInput);

      expect(repo.create).toHaveBeenCalledWith(deliveryInput);
      expect(repo.save).toHaveBeenCalledWith(deliveryEntity);
      expect(result).toMatchObject({
        id: "44444444-4444-4444-4444-444444444444",
        orderId: "33333333-3333-3333-3333-333333333333",
        personName: "John Doe",
        address: "123 Main St",
        country: "CO",
        city: "Bogota",
        region: "Bogota D.C.",
        postalCode: "110111",
        phoneNumber: "+573000000000",
        fee: null,
      });
    });
  });
});
