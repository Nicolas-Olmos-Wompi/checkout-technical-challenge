import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {passportJwtSecret} from 'jwks-rsa';
import {AuthUsersPayload} from 'domain/src/model/domain.type';

@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.${configService.get(
          'AWS_REGION'
        )}.amazonaws.com/${configService.get(
          'AWS_COGNITO_USER_POOL_ID'
        )}/.well-known/jwks.json`,
      }),
      issuer: `https://cognito-idp.${configService.get(
        'AWS_REGION'
      )}.amazonaws.com/${configService.get('AWS_COGNITO_USER_POOL_ID')}`,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
  }

  public validate(payload: AuthUsersPayload) {
    return payload;
  }
}
