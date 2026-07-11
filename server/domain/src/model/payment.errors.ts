export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order "${orderId}" was not found.`);
    this.name = "OrderNotFoundError";
  }
}

export class OrderNotPayableError extends Error {
  constructor(orderId: string, status: string) {
    super(
      `Order "${orderId}" cannot be paid because its status is "${status}".`,
    );
    this.name = "OrderNotPayableError";
  }
}

export class PaymentMethodTokenizationError extends Error {
  constructor(reason: string) {
    super(`Payment method tokenization failed: ${reason}`);
    this.name = "PaymentMethodTokenizationError";
  }
}

export class TransactionCreationError extends Error {
  constructor(reason: string) {
    super(`Transaction creation failed: ${reason}`);
    this.name = "TransactionCreationError";
  }
}

export class UnsupportedPaymentMethodError extends Error {
  constructor(paymentMethodType: string) {
    super(`Payment method "${paymentMethodType}" is not supported.`);
    this.name = "UnsupportedPaymentMethodError";
  }
}
