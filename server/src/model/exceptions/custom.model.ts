import {HttpStatus} from '@nestjs/common';
import {ERROR_STATES_MESSAGES} from '../../common/response-states/error-states.messages';
import {IresponseCode} from '../interfaces/response-code.interface';

export class CustomException extends Error {
  public readonly code: string;
  public readonly status?: HttpStatus;
  public details?: unknown;

  constructor(
    public readonly context: Error,
    public readonly type: 'Business' | 'Technical' = 'Business',
    error: IresponseCode = ERROR_STATES_MESSAGES.GeneralException,
    details?: unknown
  ) {
    super();
    this.code = error.code;
    this.message = error.message;
    this.type = type;
    this.details = details;
  }
}
