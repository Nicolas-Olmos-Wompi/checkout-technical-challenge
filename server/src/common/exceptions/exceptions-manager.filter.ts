import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {ILogger} from 'domain/src/interface/logger.interface';
import {Response} from 'express';
import {HTTPResponse} from '../../model/dto/http-response.model';
import {CustomException} from '../../model/exceptions/custom.model';
import {IhttpExceptionResponse} from '../../model/interfaces/http-exception-response.interface';
import {LoggerService} from '../logger/logger.service';
import {ERROR_STATES_MESSAGES} from '../response-states/error-states.messages';

@Catch()
export class ExceptionManager implements ExceptionFilter {
  private readonly logger: ILogger = new LoggerService(ExceptionManager.name);

  catch(exception: CustomException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(exception);

    const result: HTTPResponse = new HTTPResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_STATES_MESSAGES.GeneralException.code,
      ERROR_STATES_MESSAGES.GeneralException.message
    );

    this.getObjectResponse(exception, result);

    this.logger.error(
      `Error - execution finished with error ${result.message}`
    );
    response.status(result.status).json(result);
  }

  private getObjectResponse(
    exception: CustomException | HttpException | Error,
    result: HTTPResponse
  ): HTTPResponse {
    if (exception instanceof CustomException) {
      result.code = exception.code;
      result.message = exception.message;
      result.data = exception.details;
      result.type = exception.type;
      return result;
    }

    if (exception instanceof HttpException) {
      const exception_response = exception.getResponse();
      result.status = exception.getStatus();
      result.code = exception.getStatus().toString();
      result.data = exception_response;
      result.message =
        typeof exception_response === 'string'
          ? exception_response
          : (exception_response as IhttpExceptionResponse).message;

      return result;
    }

    result.message = exception.message;
    return result;
  }
}
