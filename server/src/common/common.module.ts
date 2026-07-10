import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {validate} from './config/env.validation';
import generalConfig from './config/general.config';
import {CognitoStrategy} from './strategies/cognito.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      cache: true,
      load: [generalConfig],
    }),
  ],
  providers: [CognitoStrategy],
})
export class CommonsModule {}
