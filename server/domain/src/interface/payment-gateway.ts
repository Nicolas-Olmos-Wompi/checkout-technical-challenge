import { MerchantAcceptance } from "../model/order.type";

export interface IPaymentGateway {
  /**
   * Fetches the merchant's presigned acceptance tokens (end-user policy and
   * personal data authorization) required to create a transaction.
   * @returns the `MerchantAcceptance` with both presigned tokens.
   */
  getAcceptanceTokens(): Promise<MerchantAcceptance>;
}
