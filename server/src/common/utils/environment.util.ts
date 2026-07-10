import {Environment} from '../../model/enum/environment.enum';

export const isProduction = () =>
  process.env.APP_ENV === Environment.PRODUCTION;

export const isLocal = () => process.env.APP_ENV === Environment.LOCAL;

export const isDevelopment = () =>
  process.env.APP_ENV === Environment.DEVELOPMENT;

export const isUAT = () => process.env.APP_ENV === Environment.UAT;
