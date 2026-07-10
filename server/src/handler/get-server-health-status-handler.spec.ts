import {HttpStatus} from '@nestjs/common';
import {MockProxy, mock} from 'jest-mock-extended';
import {GetHealthUseCase} from '../../domain/src/usecase/get-health.usecase';
import {SUCCESS_STATES_MESSAGES} from '../../src/common/response-states/success-states.messages';
import {ERROR_STATES_MESSAGES} from '../common/response-states/error-states.messages';
import {HTTPResponse} from '../model/dto/http-response.model';
import {HandlerGetServerHealthStatus} from './get-server-health-status.handler';

describe('HandlerGetServerHealthStatus', () => {
  let handlerGetServerHealthStatus: HandlerGetServerHealthStatus;
  let getHealthUseCase: MockProxy<GetHealthUseCase>;

  beforeEach(() => {
    getHealthUseCase = mock<GetHealthUseCase>();
    handlerGetServerHealthStatus = new HandlerGetServerHealthStatus(
      getHealthUseCase
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should return HTTPResponse with healthy database connection', async () => {
    getHealthUseCase.apply.mockResolvedValueOnce(true);

    const expectedResult = new HTTPResponse(
      HttpStatus.OK,
      SUCCESS_STATES_MESSAGES.Success.code,
      SUCCESS_STATES_MESSAGES.Success.message,
      "I'm alive!"
    );

    const result = await handlerGetServerHealthStatus.execute();

    expect(result).toEqual(expectedResult);
    expect(getHealthUseCase.apply).toHaveBeenCalledTimes(1);
  });

  test('Should return HTTPResponse with an unhealthy database connection', async () => {
    getHealthUseCase.apply.mockResolvedValueOnce(false);

    const expectedResult = new HTTPResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_STATES_MESSAGES.GeneralException.code,
      ERROR_STATES_MESSAGES.GeneralException.message,
      'Database issue. Unhealthy'
    );

    const result = await handlerGetServerHealthStatus.execute();

    expect(result).toEqual(expectedResult);
    expect(getHealthUseCase.apply).toHaveBeenCalledTimes(1);
  });
});
