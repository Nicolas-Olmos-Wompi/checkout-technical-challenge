import {Controller, Get} from '@nestjs/common';
import {HandlerGetServerHealthStatus} from '../../..//handler/get-server-health-status.handler';
import {HTTPResponse} from '../../../model/dto/http-response.model';

@Controller('health')
export class HealthController {
  constructor(
    private readonly handlerGetServerHealthStatus: HandlerGetServerHealthStatus
  ) {}

  @Get()
  async check(): Promise<HTTPResponse> {
    return this.handlerGetServerHealthStatus.execute();
  }
}
