import { MockProxy, mock } from "jest-mock-extended";
import { DataSource } from "typeorm";
import { TypeOrmTransactionManager } from "./typeorm-transaction-manager";

describe("TypeOrmTransactionManager", () => {
  let transactionManager: TypeOrmTransactionManager;
  let dataSource: MockProxy<DataSource>;

  beforeEach(() => {
    dataSource = mock<DataSource>();
    transactionManager = new TypeOrmTransactionManager(dataSource);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should execute the work function inside a DataSource transaction", async () => {
    const expectedResult = { id: "some-id" };
    dataSource.transaction.mockImplementation(async (fn: unknown) => {
      return (fn as () => Promise<unknown>)();
    });

    const work = jest.fn().mockResolvedValue(expectedResult);

    const result = await transactionManager.runInTransaction(work);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(work).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });

  it("should propagate errors thrown by the work function", async () => {
    dataSource.transaction.mockImplementation(async (fn: unknown) => {
      return (fn as () => Promise<unknown>)();
    });

    const error = new Error("Something went wrong");
    const work = jest.fn().mockRejectedValue(error);

    await expect(transactionManager.runInTransaction(work)).rejects.toThrow(
      "Something went wrong",
    );
  });
});
