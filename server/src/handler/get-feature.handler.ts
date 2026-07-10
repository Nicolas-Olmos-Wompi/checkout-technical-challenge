import {Injectable, Inject, HttpStatus} from '@nestjs/common';
import {Span} from '@opentelemetry/api';
import {HTTPResponse} from '../model/dto/http-response.model';
import {SUCCESS_STATES_MESSAGES} from '../common/response-states/success-states.messages';
import {UserEmail} from 'domain/src/model/domain.type';
import {GetFeatureMapper} from '../model/mapper/feature.mapper';
import {GetFeatureUseCase} from '../../domain/src/usecase/get-feature.usecase';
import {GetFeatureRequest, GetFeatureResponse} from '../model/dto/feature.type';
import {getTracer} from '../common/utils/general.util';

@Injectable()
export class HandlerGetFeature {
  constructor(
    @Inject('GetFeatureUseCase')
    private readonly getFeatureUC: GetFeatureUseCase
  ) {}
  async execute(request: GetFeatureRequest): Promise<HTTPResponse> {
    return getTracer().startActiveSpan(
      'GetFeatureUseCase.apply',
      {attributes: {'feature.email': request.email}},
      async (span: Span): Promise<HTTPResponse> => {
        try {
          const command: UserEmail = GetFeatureMapper.toModel(request);
          const user = await this.getFeatureUC.apply(command);
          const response: GetFeatureResponse[] = GetFeatureMapper.toDTO(user);
          return new HTTPResponse(
            HttpStatus.OK,
            SUCCESS_STATES_MESSAGES.Success.code,
            SUCCESS_STATES_MESSAGES.Success.message,
            response
          );
        } finally {
          span.end();
        }
      }
    );
  }
}
