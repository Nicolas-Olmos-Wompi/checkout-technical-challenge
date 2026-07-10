import {Controller, Get, HttpStatus} from '@nestjs/common';
import {HTTPResponse} from 'src/model/dto/http-response.model';
import {SUCCESS_STATES_MESSAGES} from '../response-states/success-states.messages';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return new HTTPResponse(
      HttpStatus.OK,
      SUCCESS_STATES_MESSAGES.Success.code,
      SUCCESS_STATES_MESSAGES.Success.message,
      "I'm alive!"
    );
  }
}
