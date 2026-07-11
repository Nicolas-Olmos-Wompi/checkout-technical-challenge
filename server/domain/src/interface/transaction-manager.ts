/**
 * Port that allows domain use cases to coordinate multiple repository
 * operations within a single atomic transaction without coupling to
 * any specific persistence framework.
 */
export interface ITransactionManager {
  /**
   * Executes the given work function inside a database transaction.
   * If the work function throws, the transaction is rolled back.
   * @param work - an async function containing the transactional operations.
   * @returns the result of the work function.
   */
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
