import { MockProxy, mock } from "jest-mock-extended";
import { IHealthRepository } from "../interface/health.repository";
import { ILogger } from "../interface/logger.interface";
import { GetHealthUseCase } from "./get-health.usecase";

describe("GetHealthUseCase", () => {
  let getHealthUseCase: GetHealthUseCase;
  let healthRepository: MockProxy<IHealthRepository>;
  let logger: MockProxy<ILogger>;

  beforeEach(() => {
    healthRepository = mock<IHealthRepository>();
    logger = mock<ILogger>();
    getHealthUseCase = new GetHealthUseCase(healthRepository, logger);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Check the health of database connection", async () => {
    await getHealthUseCase.apply();
    expect(healthRepository.checkHealth).toHaveBeenCalledTimes(1);
  });

  test("Check an unhealthy database connection", async () => {
    healthRepository.checkHealth.mockResolvedValue(false);

    const result = await getHealthUseCase.apply();

    expect(healthRepository.checkHealth).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });
});
