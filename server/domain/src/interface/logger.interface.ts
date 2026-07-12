export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  warn(message: string | object, context?: Record<string, unknown>): void;
  error(error: unknown, context?: Record<string, unknown>): void;
  log(message: string, context?: Record<string, unknown>): void;
}
