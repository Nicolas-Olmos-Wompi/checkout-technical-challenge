export interface ILogger {
  debug(message: string | object): void;
  warn(message: string | object): void;
  error(error: unknown): void;
  log(message: string): void;
}
