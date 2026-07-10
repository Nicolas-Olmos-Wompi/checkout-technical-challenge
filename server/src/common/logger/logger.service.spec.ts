import {Logger} from '@nestjs/common';
import {LoggerService} from './logger.service';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  let debugSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerService = new LoggerService('TestClass');

    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call debug with the correct message', () => {
    const message = 'debug message';
    loggerService.debug(message);

    expect(debugSpy).toHaveBeenCalledWith(message);
  });

  it('should call warn with the correct message', () => {
    const message = 'warn message';
    loggerService.warn(message);

    expect(warnSpy).toHaveBeenCalledWith(message);
  });

  it('should call error with string message', () => {
    const errorMessage = 'error message';
    loggerService.error(errorMessage);

    expect(errorSpy).toHaveBeenCalledWith(errorMessage);
  });

  it('should call error with Error object', () => {
    const error = new Error('error message');
    loggerService.error(error);

    expect(errorSpy).toHaveBeenCalledWith(error.message, error.stack);
  });

  it('should call log with the correct message', () => {
    const message = 'log message';
    loggerService.log(message);

    expect(logSpy).toHaveBeenCalledWith(message);
  });

  it('should call error with an object', () => {
    const errorObject = {message: 'object error message', code: 500};
    loggerService.error(errorObject);

    expect(errorSpy).toHaveBeenCalledWith(JSON.stringify(errorObject));
  });
});
