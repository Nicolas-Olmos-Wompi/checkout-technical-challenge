import {Logger} from '@nestjs/common';
import {ILogger} from '../../../domain/src/interface/logger.interface';

export const LoggerServiceKey = Symbol();

export class LoggerService implements ILogger {
  private readonly sourceClass: string;
  private readonly logger: Logger;

  public constructor(parentClass: object | string) {
    this.sourceClass =
      typeof parentClass === 'string'
        ? parentClass
        : parentClass.constructor.name;

    this.logger = new Logger(this.sourceClass);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }
  warn(message: string | object): void {
    this.logger.warn(message);
  }
  error(error: string | Error | object): void {
    if (error instanceof Error) {
      this.logger.error(error.message, error.stack);
    } else if (error instanceof Object) {
      this.logger.error(JSON.stringify(error));
    } else {
      this.logger.error(error);
    }
  }

  log(message: string | object): void {
    this.logger.log(message);
  }
}
