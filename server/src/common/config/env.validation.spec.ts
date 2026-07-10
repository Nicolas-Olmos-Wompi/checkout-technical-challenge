import {validate} from './env.validation';

describe('EnvironmentVariables', () => {
  const originalEnv = process.env;

  describe('validate', () => {
    afterAll(() => {
      process.env = {...originalEnv};
    });

    describe('when validate has require values', () => {
      let paramsEnvironmentVariables;

      const requiredParms = {
        PORT: 3000,
        AWS_REGION: 'us-east-1',
        DB_HOST: 'dummy',
        DB_NAME: 'dummy',
        DB_PASSWORD: 'dummy',
        DB_PORT: 5432,
        DB_USERNAME: 'dummy',
        AWS_DYNAMODB_ENDPOINT: 'http://localhost:3000',
        AWS_DYNAMODB_TABLE_DOMAIN: 'dummy',
        AWS_COGNITO_USER_POOL_ID: 'dummy',
        SERVICE_NAME: 'dummy',
        SLACK_WEBHOOK: 'dummy',
      };

      it('should be success', () => {
        paramsEnvironmentVariables = validate(requiredParms);

        expect(paramsEnvironmentVariables).toEqual(requiredParms);
      });
    });
  });
});
