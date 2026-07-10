export interface IHealthRepository {
  checkHealth(): Promise<boolean>;
}
