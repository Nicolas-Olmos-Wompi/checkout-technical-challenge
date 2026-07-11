import {
  PollOutcome,
  TransactionResult,
  TransactionStatusPollerConfig,
} from "../model/payment.type";

const FINAL_STATUSES: readonly TransactionResult["status"][] = [
  "APPROVED",
  "DECLINED",
  "VOIDED",
  "ERROR",
];

/**
 * Polls a transaction's status with a dynamically increasing interval
 * until a final status is reached or the configured total wait budget
 * is exhausted. The `sleep` function is injected so tests can run
 * deterministically without real waiting.
 */
export class TransactionStatusPoller {
  constructor(
    private readonly sleep: (ms: number) => Promise<void>,
    private readonly config: TransactionStatusPollerConfig,
  ) {}

  public async pollUntilFinal(
    getStatus: () => Promise<TransactionResult>,
  ): Promise<PollOutcome> {
    const backoffFactor = this.config.backoffFactor ?? 2;
    let elapsedMs = 0;
    let interval = this.config.initialIntervalMs;

    let result = await getStatus();

    while (!this.isFinal(result.status)) {
      const remaining = this.config.maxWaitMs - elapsedMs;
      if (remaining <= 0) {
        return { result, timedOut: true };
      }

      const waitMs = Math.min(interval, remaining);
      await this.sleep(waitMs);
      elapsedMs += waitMs;
      interval *= backoffFactor;

      result = await getStatus();
    }

    return { result, timedOut: false };
  }

  private isFinal(status: TransactionResult["status"]): boolean {
    return FINAL_STATUSES.includes(status);
  }
}
