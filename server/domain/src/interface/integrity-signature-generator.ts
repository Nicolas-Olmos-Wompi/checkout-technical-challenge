export interface IIntegritySignatureGenerator {
  /**
   * Generates the integrity signature required by Wompi to validate a
   * transaction, per their documented concatenation order:
   * `reference + amountInCents + currency + integritySecret`, hashed
   * with SHA-256.
   * @param reference - the unique transaction reference (the order id).
   * @param amountInCents - the transaction amount, in cents.
   * @param currency - the transaction currency (e.g. "COP").
   * @returns the hex-encoded SHA-256 signature.
   */
  generate(reference: string, amountInCents: number, currency: string): string;
}
