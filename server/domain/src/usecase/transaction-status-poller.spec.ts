import { TransactionResult } from "../model/payment.type";
import { TransactionStatusPoller } from "./transaction-status-poller";

describe("TransactionStatusPoller", () => {
  const buildResult = (
    status: TransactionResult["status"],
  ): TransactionResult => ({
    id: "tx-123",
    status,
  });

  it("should return immediately when the first status is already final", async () => {
    const sleep = jest.fn().mockResolvedValue(undefined);
    const poller = new TransactionStatusPoller(sleep, {
      maxWaitMs: 15000,
      initialIntervalMs: 1000,
    });
    const getStatus = jest.fn().mockResolvedValue(buildResult("APPROVED"));

    const { result, timedOut } = await poller.pollUntilFinal(getStatus);

    expect(result).toEqual(buildResult("APPROVED"));
    expect(timedOut).toBe(false);
    expect(sleep).not.toHaveBeenCalled();
    expect(getStatus).toHaveBeenCalledTimes(1);
  });

  it("should keep polling with an increasing interval until a final status is reached", async () => {
    const sleep = jest
      .fn<Promise<void>, [number]>()
      .mockResolvedValue(undefined);
    const poller = new TransactionStatusPoller(sleep, {
      maxWaitMs: 15000,
      initialIntervalMs: 1000,
    });
    const getStatus = jest
      .fn()
      .mockResolvedValueOnce(buildResult("PENDING"))
      .mockResolvedValueOnce(buildResult("PENDING"))
      .mockResolvedValueOnce(buildResult("DECLINED"));

    const { result, timedOut } = await poller.pollUntilFinal(getStatus);

    expect(result).toEqual(buildResult("DECLINED"));
    expect(timedOut).toBe(false);
    expect(getStatus).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);

    const firstInterval = sleep.mock.calls[0]?.[0];
    const secondInterval = sleep.mock.calls[1]?.[0];
    expect(secondInterval).toBeGreaterThan(firstInterval);
  });

  it("should treat VOIDED and ERROR as final statuses", async () => {
    const sleep = jest.fn().mockResolvedValue(undefined);
    const poller = new TransactionStatusPoller(sleep, {
      maxWaitMs: 15000,
      initialIntervalMs: 1000,
    });

    const voidedGetStatus = jest.fn().mockResolvedValue(buildResult("VOIDED"));
    const voidedOutcome = await poller.pollUntilFinal(voidedGetStatus);
    expect(voidedOutcome.timedOut).toBe(false);

    const errorGetStatus = jest.fn().mockResolvedValue(buildResult("ERROR"));
    const errorOutcome = await poller.pollUntilFinal(errorGetStatus);
    expect(errorOutcome.timedOut).toBe(false);
  });

  it("should stop and report timedOut when the max wait is exhausted while still PENDING", async () => {
    const sleep = jest.fn().mockResolvedValue(undefined);
    const poller = new TransactionStatusPoller(sleep, {
      maxWaitMs: 3000,
      initialIntervalMs: 1000,
    });
    const getStatus = jest.fn().mockResolvedValue(buildResult("PENDING"));

    const { result, timedOut } = await poller.pollUntilFinal(getStatus);

    expect(timedOut).toBe(true);
    expect(result).toEqual(buildResult("PENDING"));
    expect(getStatus.mock.calls.length).toBeGreaterThan(1);
  });

  it("should never let the sleep interval exceed the remaining time budget", async () => {
    const sleep = jest
      .fn<Promise<void>, [number]>()
      .mockResolvedValue(undefined);
    const poller = new TransactionStatusPoller(sleep, {
      maxWaitMs: 3500,
      initialIntervalMs: 1000,
    });
    const getStatus = jest.fn().mockResolvedValue(buildResult("PENDING"));

    await poller.pollUntilFinal(getStatus);

    const totalSlept = sleep.mock.calls.reduce(
      (sum: number, call: [number]) => sum + call[0],
      0,
    );
    expect(totalSlept).toBeLessThanOrEqual(3500);
  });
});
