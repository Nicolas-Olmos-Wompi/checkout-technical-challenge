import { ILogger } from "../interface/logger.interface";
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
    private readonly logger?: ILogger,
  ) {}

  public async pollUntilFinal(
    getStatus: () => Promise<TransactionResult>,
  ): Promise<PollOutcome> {
    const backoffFactor = this.config.backoffFactor ?? 2;
    let elapsedMs = 0;
    let interval = this.config.initialIntervalMs;
    let attempt = 0;

    let result = await getStatus();
    attempt++;

    this.logger?.debug("Polling transaction status", {
      attempt,
      status: result.status,
    });

    while (!this.isFinal(result.status)) {
      const remaining = this.config.maxWaitMs - elapsedMs;
      if (remaining <= 0) {
        this.logger?.warn("Transaction polling timed out", {
          elapsedMs,
          lastStatus: result.status,
          attempts: attempt,
        });
        return { result, timedOut: true };
      }

      const waitMs = Math.min(interval, remaining);
      await this.sleep(waitMs);
      elapsedMs += waitMs;
      interval *= backoffFactor;

      result = await getStatus();
      attempt++;

      this.logger?.debug("Poll attempt", {
        attempt,
        status: result.status,
        elapsedMs,
      });
    }

    this.logger?.log("Transaction reached final status", {
      status: result.status,
      attempts: attempt,
      elapsedMs,
    });

    return { result, timedOut: false };
  }

  private isFinal(status: TransactionResult["status"]): boolean {
    return FINAL_STATUSES.includes(status);
  }
}
