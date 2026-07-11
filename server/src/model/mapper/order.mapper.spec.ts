import { Order } from "../../../domain/src/model/order.entity";
import { Delivery } from "../../../domain/src/model/delivery.entity";
import { CreateOrderResult } from "../../../domain/src/model/order.type";
import { CreateOrderRequest } from "../dto/order.type";
import { OrderMapper } from "./order.mapper";

describe("OrderMapper", () => {
  describe("toCreateCommand", () => {
    it("should map a CreateOrderRequest and userId to a CreateOrderCommand", () => {
      const request: CreateOrderRequest = {
        productId: "22222222-2222-2222-2222-222222222222",
        quantity: 2,
        delivery: {
          personName: "John Doe",
          address: "123 Main St",
          country: "CO",
          city: "Bogota",
          region: "Bogota D.C.",
          postalCode: "110111",
          phoneNumber: "+573000000000",
        },
      };

      const result = OrderMapper.toCreateCommand(
        "11111111-1111-1111-1111-111111111111",
        request,
      );

      expect(result).toEqual({
        userId: "11111111-1111-1111-1111-111111111111",
        productId: "22222222-2222-2222-2222-222222222222",
        quantity: 2,
        delivery: {
          personName: "John Doe",
          address: "123 Main St",
          country: "CO",
          city: "Bogota",
          region: "Bogota D.C.",
          postalCode: "110111",
          phoneNumber: "+573000000000",
          fee: undefined,
        },
      });
    });

    it("should include the delivery fee when provided", () => {
      const request: CreateOrderRequest = {
        productId: "22222222-2222-2222-2222-222222222222",
        quantity: 1,
        delivery: {
          personName: "John Doe",
          address: "123 Main St",
          country: "CO",
          city: "Bogota",
          region: "Bogota D.C.",
          postalCode: "110111",
          phoneNumber: "+573000000000",
          fee: 5000,
        },
      };

      const result = OrderMapper.toCreateCommand(
        "11111111-1111-1111-1111-111111111111",
        request,
      );

      expect(result.delivery.fee).toBe(5000);
    });
  });

  describe("toDTO", () => {
    it("should map a CreateOrderResult to a PendingOrderResponse", () => {
      const order = Object.assign(new Order(), {
        id: "33333333-3333-3333-3333-333333333333",
        userId: "11111111-1111-1111-1111-111111111111",
        productId: "22222222-2222-2222-2222-222222222222",
        quantity: 2,
        totalInCents: 200000,
        status: "PENDING",
        paymentGatewayTransactionId: null,
        acceptanceTokenEndUserPolicy: "end-user-policy-token",
        acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });

      const delivery = Object.assign(new Delivery(), {
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

      const result: CreateOrderResult = {
        order,
        delivery,
        acceptance: {
          endUserPolicy: {
            acceptanceToken: "end-user-policy-token",
            permalink: "https://wompi.com/end-user-policy.pdf",
          },
          personalDataAuth: {
            acceptanceToken: "personal-data-auth-token",
            permalink: "https://wompi.com/personal-data-auth.pdf",
          },
        },
      };

      const dto = OrderMapper.toDTO(result);

      expect(dto).toEqual({
        orderId: "33333333-3333-3333-3333-333333333333",
        reference: "33333333-3333-3333-3333-333333333333",
        status: "PENDING",
        productId: "22222222-2222-2222-2222-222222222222",
        quantity: 2,
        totalInCents: 200000,
        delivery: {
          id: "44444444-4444-4444-4444-444444444444",
          personName: "John Doe",
          address: "123 Main St",
          country: "CO",
          city: "Bogota",
          region: "Bogota D.C.",
          postalCode: "110111",
          phoneNumber: "+573000000000",
          fee: null,
        },
        presignedAcceptance: {
          endUserPolicy: {
            acceptanceToken: "end-user-policy-token",
            permalink: "https://wompi.com/end-user-policy.pdf",
          },
          personalDataAuth: {
            acceptanceToken: "personal-data-auth-token",
            permalink: "https://wompi.com/personal-data-auth.pdf",
          },
        },
      });
    });
  });
});
