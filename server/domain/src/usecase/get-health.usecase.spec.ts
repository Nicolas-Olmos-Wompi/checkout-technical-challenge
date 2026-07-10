import {MockProxy, mock} from 'jest-mock-extended';
import {IHealthRepository} from '../interface/health.repository';
import {GetHealthUseCase} from './get-health.usecase';

describe('GetHealthUseCase', () => {
  let getHealthUseCase: GetHealthUseCase;
  let healthRepository: MockProxy<IHealthRepository>;

  beforeEach(() => {
    healthRepository = mock<IHealthRepository>();
    getHealthUseCase = new GetHealthUseCase(healthRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Check the health of database connection', async () => {
    await getHealthUseCase.apply();
    expect(healthRepository.checkHealth).toHaveBeenCalledTimes(1);
  });

  test('Check an unhealthy database connection', async () => {
    healthRepository.checkHealth.mockResolvedValue(false);

    const result = await getHealthUseCase.apply();

    expect(healthRepository.checkHealth).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });
});
