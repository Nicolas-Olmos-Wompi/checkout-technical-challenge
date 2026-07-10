import {IHealthRepository} from '../interface/health.repository';

class GetHealthUseCase {
  constructor(private readonly healthRepository: IHealthRepository) {}

  public async apply(): Promise<boolean> {
    return this.healthRepository.checkHealth();
  }
}

export {GetHealthUseCase};
