import { MockProxy, mock } from "jest-mock-extended";
import { IProductRepository } from "../interface/product.repository";
import { IOrderRepository } from "../interface/order.repository";
import { IPaymentGateway } from "../interface/payment-gateway";
import { Product } from "../model/product.entity";
import { Order } from "../model/order.entity";
import { Delivery } from "../model/delivery.entity";
import { MerchantAcceptance, CreateOrderCommand } from "../model/order.type";
import {
  ProductNotFoundError,
  InsufficientStockError,
} from "../model/order.errors";
import { CreateOrderUseCase } from "./create-order.usecase";

describe("CreateOrderUseCase", () => {
  let createOrderUseCase: CreateOrderUseCase;
  let productRepository: MockProxy<IProductRepository>;
  let orderRepository: MockProxy<IOrderRepository>;
  let paymentGateway: MockProxy<IPaymentGateway>;

  const buildProduct = (overrides: Partial<Product> = {}): Product =>
    Object.assign(new Product(), {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Wireless Headphones",
      description: "Over-ear headphones",
      price: 100000,
      stock: 10,
      image: null,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      ...overrides,
    });

  const buildCommand = (
    overrides: Partial<CreateOrderCommand> = {},
  ): CreateOrderCommand => ({
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
    },
    ...overrides,
  });

  const buildAcceptance = (): MerchantAcceptance => ({
    endUserPolicy: {
      acceptanceToken: "end-user-policy-token",
      permalink: "https://wompi.com/end-user-policy.pdf",
    },
    personalDataAuth: {
      acceptanceToken: "personal-data-auth-token",
      permalink: "https://wompi.com/personal-data-auth.pdf",
    },
  });

  const buildOrder = (overrides: Partial<Order> = {}): Order =>
    Object.assign(new Order(), {
      id: "33333333-3333-3333-3333-333333333333",
      userId: "11111111-1111-1111-1111-111111111111",
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 2,
      total: 200000,
      status: "PENDING",
      paymentGatewayTransactionId: null,
      acceptanceTokenEndUserPolicy: "end-user-policy-token",
      acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      ...overrides,
    });

  const buildDelivery = (overrides: Partial<Delivery> = {}): Delivery =>
    Object.assign(new Delivery(), {
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
      ...overrides,
    });

  beforeEach(() => {
    productRepository = mock<IProductRepository>();
    orderRepository = mock<IOrderRepository>();
    paymentGateway = mock<IPaymentGateway>();
    createOrderUseCase = new CreateOrderUseCase(
      productRepository,
      orderRepository,
      paymentGateway,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw ProductNotFoundError when the product does not exist", async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(createOrderUseCase.apply(buildCommand())).rejects.toThrow(
      ProductNotFoundError,
    );

    expect(paymentGateway.getAcceptanceTokens).not.toHaveBeenCalled();
    expect(orderRepository.create).not.toHaveBeenCalled();
  });

  it("should throw InsufficientStockError when quantity exceeds stock", async () => {
    productRepository.findById.mockResolvedValue(buildProduct({ stock: 1 }));

    await expect(
      createOrderUseCase.apply(buildCommand({ quantity: 2 })),
    ).rejects.toThrow(InsufficientStockError);

    expect(paymentGateway.getAcceptanceTokens).not.toHaveBeenCalled();
    expect(orderRepository.create).not.toHaveBeenCalled();
  });

  it("should compute the total from product price times quantity plus delivery fee", async () => {
    productRepository.findById.mockResolvedValue(
      buildProduct({ price: 100000 }),
    );
    paymentGateway.getAcceptanceTokens.mockResolvedValue(buildAcceptance());
    const createResult: { order: Order; delivery: Delivery } = {
      order: buildOrder({ total: 205000 }),
      delivery: buildDelivery({ fee: 5000 }),
    };
    orderRepository.create.mockResolvedValue(createResult);

    await createOrderUseCase.apply(
      buildCommand({
        quantity: 2,
        delivery: { ...buildCommand().delivery, fee: 5000 },
      }),
    );

    expect(orderRepository.create).toHaveBeenCalledTimes(1);
    const callArg = orderRepository.create.mock.calls[0]?.[0];
    expect(callArg?.order.total).toBe(205000);
    expect(callArg?.delivery.fee).toBe(5000);
  });

  it("should fetch acceptance tokens and persist a PENDING order with both tokens", async () => {
    const product = buildProduct();
    const acceptance = buildAcceptance();
    productRepository.findById.mockResolvedValue(product);
    paymentGateway.getAcceptanceTokens.mockResolvedValue(acceptance);
    const createResult: { order: Order; delivery: Delivery } = {
      order: buildOrder(),
      delivery: buildDelivery(),
    };
    orderRepository.create.mockResolvedValue(createResult);

    await createOrderUseCase.apply(buildCommand());

    expect(paymentGateway.getAcceptanceTokens).toHaveBeenCalled();
    expect(orderRepository.create).toHaveBeenCalledTimes(1);
    const callArg = orderRepository.create.mock.calls[0]?.[0];
    expect(callArg?.order).toMatchObject({
      userId: "11111111-1111-1111-1111-111111111111",
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 2,
      total: 200000,
      status: "PENDING",
      paymentGatewayTransactionId: null,
      acceptanceTokenEndUserPolicy: "end-user-policy-token",
      acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
    });
    expect(callArg?.delivery).toMatchObject({
      personName: "John Doe",
      address: "123 Main St",
      country: "CO",
      city: "Bogota",
      region: "Bogota D.C.",
      postalCode: "110111",
      phoneNumber: "+573000000000",
    });
  });

  it("should NOT decrement product stock", async () => {
    const product = buildProduct({ stock: 10 });
    productRepository.findById.mockResolvedValue(product);
    paymentGateway.getAcceptanceTokens.mockResolvedValue(buildAcceptance());
    const createResult: { order: Order; delivery: Delivery } = {
      order: buildOrder(),
      delivery: buildDelivery(),
    };
    orderRepository.create.mockResolvedValue(createResult);

    await createOrderUseCase.apply(buildCommand());

    expect(productRepository.findById).toHaveBeenCalledTimes(1);
  });

  it("should return the created order, delivery, and merchant acceptance", async () => {
    const product = buildProduct();
    const acceptance = buildAcceptance();
    const order = buildOrder();
    const delivery = buildDelivery();
    productRepository.findById.mockResolvedValue(product);
    paymentGateway.getAcceptanceTokens.mockResolvedValue(acceptance);
    orderRepository.create.mockResolvedValue({ order, delivery });

    const result = await createOrderUseCase.apply(buildCommand());

    expect(result).toEqual({ order, delivery, acceptance });
  });
});
