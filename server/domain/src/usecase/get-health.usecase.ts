import { ILogger } from "../interface/logger.interface";
import { IHealthRepository } from "../interface/health.repository";

class GetHealthUseCase {
  constructor(
    private readonly healthRepository: IHealthRepository,
    private readonly logger: ILogger,
  ) {}

  public async apply(): Promise<boolean> {
    this.logger.debug("Checking server health");

    const isHealthy = await this.healthRepository.checkHealth();

    if (isHealthy) {
      this.logger.log("Health check passed");
    } else {
      this.logger.error("Health check failed: database is unreachable");
    }

    return isHealthy;
  }
}

export { GetHealthUseCase };
