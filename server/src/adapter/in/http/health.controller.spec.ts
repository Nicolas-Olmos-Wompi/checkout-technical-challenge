import {MockProxy, mock} from 'jest-mock-extended';
import {GetHealthUseCase} from '../../../../domain/src/usecase/get-health.usecase';
import {HandlerGetServerHealthStatus} from '../../../handler/get-server-health-status.handler';
import {HealthController} from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;
  let handlerGetServerHealthStatus: HandlerGetServerHealthStatus;
  let getHealthUseCase: MockProxy<GetHealthUseCase>;

  beforeEach(() => {
    getHealthUseCase = mock<GetHealthUseCase>();
    handlerGetServerHealthStatus = new HandlerGetServerHealthStatus(
      getHealthUseCase
    );
    healthController = new HealthController(handlerGetServerHealthStatus);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Get healthy status', async () => {
    getHealthUseCase.apply.mockResolvedValue(true);

    const result = await healthController.check();
    expect(getHealthUseCase.apply).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        code: 'OK',
        data: "I'm alive!",
        message: 'Solicitud ejecutada correctamente.',
        status: 200,
      })
    );
  });

  test('Get an unhealthy status', async () => {
    getHealthUseCase.apply.mockResolvedValue(false);

    const result = await healthController.check();
    expect(getHealthUseCase.apply).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        code: 'EXC_001',
        data: 'Database issue. Unhealthy',
        message: 'Se presentó error interno procesando la solicitud.',
        status: 500,
      })
    );
  });
});
