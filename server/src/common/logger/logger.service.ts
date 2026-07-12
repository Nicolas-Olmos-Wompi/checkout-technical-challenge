import { Logger } from "@nestjs/common";
import { ILogger } from "../../../domain/src/interface/logger.interface";

export const LoggerServiceKey = Symbol();

export class LoggerService implements ILogger {
  private readonly sourceClass: string;
  private readonly logger: Logger;

  public constructor(parentClass: object | string) {
    this.sourceClass =
      typeof parentClass === "string"
        ? parentClass
        : parentClass.constructor.name;

    this.logger = new Logger(this.sourceClass);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  warn(message: string | object, context?: Record<string, unknown>): void {
    const msg = typeof message === "string" ? message : JSON.stringify(message);
    this.logger.warn(this.formatMessage(msg, context));
  }

  error(error: unknown, context?: Record<string, unknown>): void {
    if (error instanceof Error) {
      const msg = this.formatMessage(error.message, context);
      this.logger.error(msg, error.stack);
    } else if (error instanceof Object) {
      this.logger.error(this.formatMessage(JSON.stringify(error), context));
    } else {
      this.logger.error(this.formatMessage(String(error), context));
    }
  }

  log(message: string, context?: Record<string, unknown>): void {
    this.logger.log(this.formatMessage(message, context));
  }

  private formatMessage(
    message: string,
    context?: Record<string, unknown>,
  ): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }
    return `${message} | ${JSON.stringify(context)}`;
  }
}
