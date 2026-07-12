import { MockProxy, mock } from "jest-mock-extended";
import { IOrderRepository } from "../interface/order.repository";
import { IUserRepository } from "../interface/user.repository";
import { IPaymentMethodStrategy } from "../interface/payment-method-strategy";
import { IIntegritySignatureGenerator } from "../interface/integrity-signature-generator";
import { ITransactionGateway } from "../interface/transaction-gateway";
import { ILogger } from "../interface/logger.interface";
import { TransactionStatusPoller } from "./transaction-status-poller";
import { Order } from "../model/order.entity";
import { User } from "../model/user.entity";
import {
  CardPaymentCommand,
  PayOrderCommand,
  TransactionResult,
} from "../model/payment.type";
import {
  OrderNotFoundError,
  OrderNotPayableError,
  UnsupportedPaymentMethodError,
} from "../model/payment.errors";
import { PayOrderUseCase } from "./pay-order.usecase";

describe("PayOrderUseCase", () => {
  let payOrderUseCase: PayOrderUseCase;
  let orderRepository: MockProxy<IOrderRepository>;
  let userRepository: MockProxy<IUserRepository>;
  let cardHandler: MockProxy<IPaymentMethodStrategy<CardPaymentCommand>>;
  let signatureGenerator: MockProxy<IIntegritySignatureGenerator>;
  let transactionGateway: MockProxy<ITransactionGateway>;
  let logger: MockProxy<ILogger>;
  let poller: TransactionStatusPoller;

  const userId = "11111111-1111-1111-1111-111111111111";
  const orderId = "33333333-3333-3333-3333-333333333333";

  const buildOrder = (overrides: Partial<Order> = {}): Order =>
    Object.assign(new Order(), {
      id: orderId,
      userId,
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 1,
      totalInCents: 200000,
      status: "PENDING",
      paymentGatewayTransactionId: null,
      acceptanceTokenEndUserPolicy: "end-user-policy-token",
      acceptanceTokenPersonalDataAuth: "personal-data-auth-token",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      ...overrides,
    });

  const buildUser = (overrides: Partial<User> = {}): User =>
    Object.assign(new User(), {
      id: userId,
      username: "johndoe",
      email: "johndoe@example.com",
      passwordHash: "hashed",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      ...overrides,
    });

  const buildCommand = (
    overrides: Partial<PayOrderCommand> = {},
  ): PayOrderCommand => ({
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
    ...overrides,
  });

  const buildTransactionResult = (
    status: TransactionResult["status"],
  ): TransactionResult => ({ id: "tx-123", status });

  beforeEach(() => {
    orderRepository = mock<IOrderRepository>();
    userRepository = mock<IUserRepository>();
    cardHandler = mock<IPaymentMethodStrategy<CardPaymentCommand>>();
    Object.defineProperty(cardHandler, "type", {
      value: "CARD",
      writable: true,
    });
    signatureGenerator = mock<IIntegritySignatureGenerator>();
    transactionGateway = mock<ITransactionGateway>();
    logger = mock<ILogger>();
    poller = new TransactionStatusPoller(() => Promise.resolve(), {
      maxWaitMs: 15000,
      initialIntervalMs: 1000,
    });

    orderRepository.findById.mockResolvedValue(buildOrder());
    userRepository.findById.mockResolvedValue(buildUser());
    cardHandler.tokenize.mockResolvedValue({
      token: "tok_test_123",
      displayInfo: { brand: "VISA", lastFour: "4242" },
    });
    cardHandler.buildPaymentMethodPayload.mockReturnValue({
      type: "CARD",
      token: "tok_test_123",
      installments: 1,
    });
    signatureGenerator.generate.mockReturnValue("signature-hash");
    transactionGateway.createTransaction.mockResolvedValue(
      buildTransactionResult("PENDING"),
    );
    transactionGateway.getTransactionStatus.mockResolvedValue(
      buildTransactionResult("APPROVED"),
    );
    orderRepository.updateStatus.mockImplementation((id, changes) =>
      Promise.resolve(buildOrder({ ...changes })),
    );

    payOrderUseCase = new PayOrderUseCase(
      orderRepository,
      userRepository,
      [cardHandler],
      signatureGenerator,
      transactionGateway,
      poller,
      logger,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should complete the happy path and return the APPROVED order", async () => {
    transactionGateway.getTransactionStatus.mockResolvedValue(
      buildTransactionResult("APPROVED"),
    );

    const result = await payOrderUseCase.apply(buildCommand());

    expect(result.order.status).toBe("APPROVED");
    expect(result.timedOut).toBe(false);
    expect(result.paymentMethod).toEqual({
      type: "CARD",
      displayInfo: { brand: "VISA", lastFour: "4242" },
    });
  });

  it("should return a DECLINED order when the gateway reports DECLINED", async () => {
    transactionGateway.getTransactionStatus.mockResolvedValue(
      buildTransactionResult("DECLINED"),
    );

    const result = await payOrderUseCase.apply(buildCommand());

    expect(result.order.status).toBe("DECLINED");
    expect(result.timedOut).toBe(false);
  });

  it("should return the order still PENDING with timedOut true when polling times out", async () => {
    const timeoutPoller = new TransactionStatusPoller(() => Promise.resolve(), {
      maxWaitMs: 0,
      initialIntervalMs: 1000,
    });
    transactionGateway.getTransactionStatus.mockResolvedValue(
      buildTransactionResult("PENDING"),
    );
    payOrderUseCase = new PayOrderUseCase(
      orderRepository,
      userRepository,
      [cardHandler],
      signatureGenerator,
      transactionGateway,
      timeoutPoller,
      logger,
    );

    const result = await payOrderUseCase.apply(buildCommand());

    expect(result.order.status).toBe("PENDING");
    expect(result.timedOut).toBe(true);
    expect(orderRepository.updateStatus).toHaveBeenCalledWith(orderId, {
      status: "PENDING",
      paymentGatewayTransactionId: "tx-123",
    });
  });

  it("should throw OrderNotFoundError when the order does not exist", async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(payOrderUseCase.apply(buildCommand())).rejects.toThrow(
      OrderNotFoundError,
    );
    expect(cardHandler.tokenize).not.toHaveBeenCalled();
  });

  it("should throw OrderNotFoundError when the order belongs to another user", async () => {
    orderRepository.findById.mockResolvedValue(
      buildOrder({ userId: "99999999-9999-9999-9999-999999999999" }),
    );

    await expect(payOrderUseCase.apply(buildCommand())).rejects.toThrow(
      OrderNotFoundError,
    );
    expect(cardHandler.tokenize).not.toHaveBeenCalled();
  });

  it("should throw OrderNotPayableError when the order is not PENDING", async () => {
    orderRepository.findById.mockResolvedValue(
      buildOrder({ status: "APPROVED" }),
    );

    await expect(payOrderUseCase.apply(buildCommand())).rejects.toThrow(
      OrderNotPayableError,
    );
    expect(cardHandler.tokenize).not.toHaveBeenCalled();
  });

  it("should propagate tokenization failures", async () => {
    const tokenizationError = new Error("Card declined by issuer");
    cardHandler.tokenize.mockRejectedValue(tokenizationError);

    await expect(payOrderUseCase.apply(buildCommand())).rejects.toThrow(
      tokenizationError,
    );
    expect(transactionGateway.createTransaction).not.toHaveBeenCalled();
  });

  it("should throw UnsupportedPaymentMethodError when no handler matches the requested type", async () => {
    await expect(
      payOrderUseCase.apply(
        buildCommand({ paymentMethodType: "NEQUI" as never }),
      ),
    ).rejects.toThrow(UnsupportedPaymentMethodError);
  });

  it("should require zero changes to support a second payment method handler", async () => {
    const nequiHandler = mock<IPaymentMethodStrategy>();
    Object.defineProperty(nequiHandler, "type", {
      value: "NEQUI",
      writable: true,
    });
    nequiHandler.tokenize.mockResolvedValue({
      token: "nequi-token",
      displayInfo: { phoneNumber: "3001234567" },
    });
    nequiHandler.buildPaymentMethodPayload.mockReturnValue({
      type: "NEQUI",
      token: "nequi-token",
    });

    payOrderUseCase = new PayOrderUseCase(
      orderRepository,
      userRepository,
      [cardHandler, nequiHandler],
      signatureGenerator,
      transactionGateway,
      poller,
      logger,
    );

    const result = await payOrderUseCase.apply(
      buildCommand({ paymentMethodType: "NEQUI" as never, card: undefined }),
    );

    expect(nequiHandler.tokenize).toHaveBeenCalledTimes(1);
    expect(cardHandler.tokenize).not.toHaveBeenCalled();
    expect(result.paymentMethod.displayInfo).toEqual({
      phoneNumber: "3001234567",
    });
  });

  it("should build the transaction command using the order's stored acceptance token and the user's email", async () => {
    await payOrderUseCase.apply(buildCommand());

    expect(transactionGateway.createTransaction).toHaveBeenCalledWith({
      amountInCents: 200000,
      currency: "COP",
      reference: orderId,
      signature: "signature-hash",
      acceptanceToken: "end-user-policy-token",
      customerEmail: "johndoe@example.com",
      paymentMethodPayload: {
        type: "CARD",
        token: "tok_test_123",
        installments: 1,
      },
    });
  });

  it("should persist the paymentGatewayTransactionId before polling", async () => {
    await payOrderUseCase.apply(buildCommand());

    expect(orderRepository.updateStatus).toHaveBeenCalledWith(orderId, {
      status: "PENDING",
      paymentGatewayTransactionId: "tx-123",
    });
  });
});
