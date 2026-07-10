import {registerAs} from '@nestjs/config';

export default registerAs('general', () => ({
  version: process.env.PORT ?? '3001',
}));
