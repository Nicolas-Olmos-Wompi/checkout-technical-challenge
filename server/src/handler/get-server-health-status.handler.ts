import {HttpStatus, Inject, Injectable} from '@nestjs/common';
import {Span} from '@opentelemetry/api';
import {GetHealthUseCase} from '../../domain/src/usecase/get-health.usecase';
import {ERROR_STATES_MESSAGES} from '../../src/common/response-states/error-states.messages';
import {SUCCESS_STATES_MESSAGES} from '../../src/common/response-states/success-states.messages';
import {HTTPResponse} from '../../src/model/dto/http-response.model';
import {GetServerHealthStatusMapper} from '../model/mapper/get-server-health-status.mapper';
import {getTracer} from '../common/utils/general.util';

@Injectable()
export class HandlerGetServerHealthStatus {
  constructor(
    @Inject('GetHealthUseCase')
    private readonly getHealthUseCase: GetHealthUseCase
  ) {}
  async execute(): Promise<HTTPResponse> {
    return getTracer().startActiveSpan(
      'GetHealthUseCase.apply',
      async (span: Span): Promise<HTTPResponse> => {
        try {
          const healthStatus = await this.getHealthUseCase.apply();
          const response = GetServerHealthStatusMapper.toDTO(healthStatus);

          span.setAttributes({
            'server.health.status': healthStatus,
          });
          if (healthStatus) {
            return new HTTPResponse(
              HttpStatus.OK,
              SUCCESS_STATES_MESSAGES.Success.code,
              SUCCESS_STATES_MESSAGES.Success.message,
              response
            );
          }

          return new HTTPResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ERROR_STATES_MESSAGES.GeneralException.code,
            ERROR_STATES_MESSAGES.GeneralException.message,
            response
          );
        } finally {
          span.end();
        }
      }
    );
  }
}
