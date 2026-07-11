import { Order } from "../../../domain/src/model/order.entity";
import { PayOrderResult } from "../../../domain/src/model/payment.type";
import { PayOrderRequest } from "../dto/order.type";
import { PayOrderMapper } from "./pay-order.mapper";

describe("PayOrderMapper", () => {
  const userId = "11111111-1111-1111-1111-111111111111";
  const orderId = "33333333-3333-3333-3333-333333333333";

  describe("toCommand", () => {
    it("should map a PayOrderRequest, userId and orderId to a PayOrderCommand", () => {
      const request: PayOrderRequest = {
        paymentMethodType: "CARD",
        card: {
          cardNumber: "4242424242424242",
          expMonth: "06",
          expYear: "29",
          cvc: "123",
          cardHolder: "John Doe",
        },
      };

      const result = PayOrderMapper.toCommand(userId, orderId, request);

      expect(result).toEqual({
        userId,
        orderId,
        paymentMethodType: "CARD",
        card: {
          cardNumber: "4242424242424242",
          expMonth: "06",
          expYear: "29",
          cvc: "123",
          cardHolder: "John Doe",
        },
      });
    });

    it("should never include raw card data outside the nested card field", () => {
      const request: PayOrderRequest = {
        paymentMethodType: "CARD",
        card: {
          cardNumber: "4242424242424242",
          expMonth: "06",
          expYear: "29",
          cvc: "123",
          cardHolder: "John Doe",
        },
      };

      const result = PayOrderMapper.toCommand(userId, orderId, request);
      const topLevelKeys = Object.keys(result);

      expect(topLevelKeys).toEqual([
        "userId",
        "orderId",
        "paymentMethodType",
        "card",
      ]);
    });
  });

  describe("toDTO", () => {
    it("should map a PayOrderResult to a PayOrderResponse without leaking raw card data", () => {
      const order = Object.assign(new Order(), {
        id: orderId,
        userId,
        productId: "22222222-2222-2222-2222-222222222222",
        quantity: 1,
        totalInCents: 200000,
        status: "APPROVED",
        paymentGatewayTransactionId: "tx-123",
        acceptanceTokenEndUserPolicy: "end-user-policy-token",
        acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });

      const result: PayOrderResult = {
        order,
        paymentMethod: {
          type: "CARD",
          displayInfo: { brand: "VISA", lastFour: "4242" },
        },
        timedOut: false,
      };

      const dto = PayOrderMapper.toDTO(result);

      expect(dto).toEqual({
        orderId,
        status: "APPROVED",
        paymentGatewayTransactionId: "tx-123",
        timedOut: false,
        paymentMethod: {
          type: "CARD",
          displayInfo: { brand: "VISA", lastFour: "4242" },
        },
      });
      expect(JSON.stringify(dto)).not.toContain("4242424242424242");
    });
  });

  describe("toOrderResponse", () => {
    it("should map a domain Order to an OrderResponse", () => {
      const order = Object.assign(new Order(), {
        id: orderId,
        userId,
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

      const dto = PayOrderMapper.toOrderResponse(order);

      expect(dto).toEqual({
        orderId,
        productId: "22222222-2222-2222-2222-222222222222",
        quantity: 2,
        totalInCents: 200000,
        status: "PENDING",
        paymentGatewayTransactionId: null,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });
});
