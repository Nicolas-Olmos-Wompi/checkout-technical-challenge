import {
  CreateTransactionCommand,
  TransactionResult,
} from "../model/payment.type";

export interface ITransactionGateway {
  /**
   * Creates a payment transaction with the payment gateway.
   * @param command - the transaction fields, payment-method-agnostic.
   * @returns the created `TransactionResult` (id and initial status).
   */
  createTransaction(
    command: CreateTransactionCommand,
  ): Promise<TransactionResult>;

  /**
   * Fetches the current status of a previously created transaction.
   * @param transactionId - the gateway transaction id.
   * @returns the current `TransactionResult`.
   */
  getTransactionStatus(transactionId: string): Promise<TransactionResult>;
}
