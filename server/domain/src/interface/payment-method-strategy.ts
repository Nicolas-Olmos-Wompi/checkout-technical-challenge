import {
  PaymentMethodType,
  TokenizedPaymentMethod,
} from "../model/payment.type";

/**
 * Strategy port for a single payment method (card, Nequi, etc). Each
 * concrete payment method provides its own implementation; the
 * `PayOrderUseCase` depends only on this abstraction and resolves the
 * right strategy by `type` at runtime, so adding a new payment method
 * never requires modifying the use case.
 */
export interface IPaymentMethodStrategy<TCommand = unknown> {
  readonly type: PaymentMethodType;

  /**
   * Tokenizes the raw payment method data with the payment gateway.
   * @param command - the raw, method-specific payment data.
   * @returns the resulting gateway token plus non-sensitive display info.
   */
  tokenize(command: TCommand): Promise<TokenizedPaymentMethod>;

  /**
   * Builds the `payment_method` payload to send when creating a
   * transaction, given the token obtained from `tokenize`.
   * @param token - the gateway token for this payment method.
   * @returns a JSON-serializable payload specific to this payment method.
   */
  buildPaymentMethodPayload(token: string): Record<string, unknown>;
}
