import {isProduction, isLocal, isDevelopment, isUAT} from './environment.util';
import {Environment} from '../../model/enum/environment.enum';

describe('Environment Util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if APP_ENV is PRODUCTION', () => {
    process.env.APP_ENV = Environment.PRODUCTION;
    expect(isProduction()).toBe(true);
  });

  it('should return false if APP_ENV is not PRODUCTION', () => {
    process.env.APP_ENV = Environment.DEVELOPMENT;
    expect(isProduction()).toBe(false);
  });

  it('should return true if APP_ENV is LOCAL', () => {
    process.env.APP_ENV = Environment.LOCAL;
    expect(isLocal()).toBe(true);
  });

  it('should return false if APP_ENV is not LOCAL', () => {
    process.env.APP_ENV = Environment.UAT;
    expect(isLocal()).toBe(false);
  });

  it('should return true if APP_ENV is DEVELOPMENT', () => {
    process.env.APP_ENV = Environment.DEVELOPMENT;
    expect(isDevelopment()).toBe(true);
  });

  it('should return false if APP_ENV is not DEVELOPMENT', () => {
    process.env.APP_ENV = Environment.PRODUCTION;
    expect(isDevelopment()).toBe(false);
  });

  it('should return true if APP_ENV is UAT', () => {
    process.env.APP_ENV = Environment.UAT;
    expect(isUAT()).toBe(true);
  });

  it('should return false if APP_ENV is not UAT', () => {
    process.env.APP_ENV = Environment.LOCAL;
    expect(isUAT()).toBe(false);
  });
});
