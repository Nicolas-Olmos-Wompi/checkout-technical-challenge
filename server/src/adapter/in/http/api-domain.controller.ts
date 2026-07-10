import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiParam, ApiTags} from '@nestjs/swagger';
import {HTTPResponse} from '../../../model/dto/http-response.model';
import {CognitoAuthGuard} from '../../../common/guards/cognito-auth.guard';
import {HandlerGetFeature} from '../../../handler/get-feature.handler';
import {GetFeatureRequest} from '../../../model/dto/feature.type';
import {GetFeaturePipe} from './get-feature.pipe';

@ApiTags('Api Domain')
@Controller('api-domain')
export class ApiDomainController {
  constructor(private readonly handlerGetFeature: HandlerGetFeature) {}

  @UseGuards(CognitoAuthGuard)
  @Get('user/:email')
  @ApiParam({
    name: 'email',
    required: true,
    description: 'Email User',
    type: String,
  })
  @ApiBearerAuth('Cognito-Auth')
  async getFeature(
    @Param(new GetFeaturePipe()) email: GetFeatureRequest
  ): Promise<HTTPResponse> {
    return this.handlerGetFeature.execute(email);
  }
}
