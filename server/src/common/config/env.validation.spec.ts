import { validate } from "./env.validation";

describe("EnvironmentVariables", () => {
  const originalEnv = process.env;

  describe("validate", () => {
    afterAll(() => {
      process.env = { ...originalEnv };
    });

    describe("when validate has require values", () => {
      let paramsEnvironmentVariables;

      const requiredParms = {
        PORT: 3000,
        AWS_REGION: "us-east-1",
        DB_HOST: "dummy",
        DB_NAME: "dummy",
        DB_PASSWORD: "dummy",
        DB_PORT: 5432,
        DB_USERNAME: "dummy",
        AWS_DYNAMODB_ENDPOINT: "http://localhost:3000",
        AWS_DYNAMODB_TABLE_DOMAIN: "dummy",
        AWS_COGNITO_USER_POOL_ID: "dummy",
        SERVICE_NAME: "dummy",
        SLACK_WEBHOOK: "dummy",
        JWT_SECRET: "dummy-secret",
        WOMPI_BASE_URL: "https://api-sandbox.co.uat.wompi.dev/v1",
        WOMPI_PUBLIC_KEY: "pub_test_dummy",
        WOMPI_PRIVATE_KEY: "prv_test_dummy",
        WOMPI_INTEGRITY_SECRET: "integrity_test_dummy",
      };

      it("should be success", () => {
        paramsEnvironmentVariables = validate(requiredParms);

        expect(paramsEnvironmentVariables).toEqual(requiredParms);
      });
    });

    describe("when JWT_SECRET is missing", () => {
      const requiredParms = {
        PORT: 3000,
        AWS_REGION: "us-east-1",
        DB_HOST: "dummy",
        DB_NAME: "dummy",
        DB_PASSWORD: "dummy",
        DB_PORT: 5432,
        DB_USERNAME: "dummy",
        AWS_DYNAMODB_ENDPOINT: "http://localhost:3000",
        AWS_DYNAMODB_TABLE_DOMAIN: "dummy",
        AWS_COGNITO_USER_POOL_ID: "dummy",
        SERVICE_NAME: "dummy",
        SLACK_WEBHOOK: "dummy",
        WOMPI_BASE_URL: "https://api-sandbox.co.uat.wompi.dev/v1",
        WOMPI_PUBLIC_KEY: "pub_test_dummy",
        WOMPI_PRIVATE_KEY: "prv_test_dummy",
        WOMPI_INTEGRITY_SECRET: "integrity_test_dummy",
      };

      it("should throw a configuration error", () => {
        expect(() => validate(requiredParms)).toThrow(
          "You do not have the necessary configuration to run the microservice.",
        );
      });
    });

    describe("when a Wompi variable is missing", () => {
      const requiredParms = {
        PORT: 3000,
        AWS_REGION: "us-east-1",
        DB_HOST: "dummy",
        DB_NAME: "dummy",
        DB_PASSWORD: "dummy",
        DB_PORT: 5432,
        DB_USERNAME: "dummy",
        AWS_DYNAMODB_ENDPOINT: "http://localhost:3000",
        AWS_DYNAMODB_TABLE_DOMAIN: "dummy",
        AWS_COGNITO_USER_POOL_ID: "dummy",
        SERVICE_NAME: "dummy",
        SLACK_WEBHOOK: "dummy",
        JWT_SECRET: "dummy-secret",
        WOMPI_BASE_URL: "https://api-sandbox.co.uat.wompi.dev/v1",
        WOMPI_PRIVATE_KEY: "prv_test_dummy",
        WOMPI_INTEGRITY_SECRET: "integrity_test_dummy",
      };

      it("should throw a configuration error", () => {
        expect(() => validate(requiredParms)).toThrow(
          "You do not have the necessary configuration to run the microservice.",
        );
      });
    });

    describe("when JWT_EXPIRES_IN is provided", () => {
      const requiredParms = {
        PORT: 3000,
        AWS_REGION: "us-east-1",
        DB_HOST: "dummy",
        DB_NAME: "dummy",
        DB_PASSWORD: "dummy",
        DB_PORT: 5432,
        DB_USERNAME: "dummy",
        AWS_DYNAMODB_ENDPOINT: "http://localhost:3000",
        AWS_DYNAMODB_TABLE_DOMAIN: "dummy",
        AWS_COGNITO_USER_POOL_ID: "dummy",
        SERVICE_NAME: "dummy",
        SLACK_WEBHOOK: "dummy",
        JWT_SECRET: "dummy-secret",
        JWT_EXPIRES_IN: "2h",
        WOMPI_BASE_URL: "https://api-sandbox.co.uat.wompi.dev/v1",
        WOMPI_PUBLIC_KEY: "pub_test_dummy",
        WOMPI_PRIVATE_KEY: "prv_test_dummy",
        WOMPI_INTEGRITY_SECRET: "integrity_test_dummy",
      };

      it("should be success", () => {
        paramsEnvironmentVariables = validate(requiredParms);

        expect(paramsEnvironmentVariables).toEqual(requiredParms);
      });
    });

    describe("when WOMPI_MAX_POLL_WAIT_MS and WOMPI_POLL_INITIAL_INTERVAL_MS are omitted", () => {
      const requiredParms = {
        PORT: 3000,
        AWS_REGION: "us-east-1",
        DB_HOST: "dummy",
        DB_NAME: "dummy",
        DB_PASSWORD: "dummy",
        DB_PORT: 5432,
        DB_USERNAME: "dummy",
        AWS_DYNAMODB_ENDPOINT: "http://localhost:3000",
        AWS_DYNAMODB_TABLE_DOMAIN: "dummy",
        AWS_COGNITO_USER_POOL_ID: "dummy",
        SERVICE_NAME: "dummy",
        SLACK_WEBHOOK: "dummy",
        JWT_SECRET: "dummy-secret",
        WOMPI_BASE_URL: "https://api-sandbox.co.uat.wompi.dev/v1",
        WOMPI_PUBLIC_KEY: "pub_test_dummy",
        WOMPI_PRIVATE_KEY: "prv_test_dummy",
        WOMPI_INTEGRITY_SECRET: "integrity_test_dummy",
      };

      it("should be success", () => {
        paramsEnvironmentVariables = validate(requiredParms);

        expect(paramsEnvironmentVariables).toEqual(requiredParms);
      });
    });

    describe("when WOMPI_MAX_POLL_WAIT_MS and WOMPI_POLL_INITIAL_INTERVAL_MS are provided", () => {
      const requiredParms = {
        PORT: 3000,
        AWS_REGION: "us-east-1",
        DB_HOST: "dummy",
        DB_NAME: "dummy",
        DB_PASSWORD: "dummy",
        DB_PORT: 5432,
        DB_USERNAME: "dummy",
        AWS_DYNAMODB_ENDPOINT: "http://localhost:3000",
        AWS_DYNAMODB_TABLE_DOMAIN: "dummy",
        AWS_COGNITO_USER_POOL_ID: "dummy",
        SERVICE_NAME: "dummy",
        SLACK_WEBHOOK: "dummy",
        JWT_SECRET: "dummy-secret",
        WOMPI_BASE_URL: "https://api-sandbox.co.uat.wompi.dev/v1",
        WOMPI_PUBLIC_KEY: "pub_test_dummy",
        WOMPI_PRIVATE_KEY: "prv_test_dummy",
        WOMPI_INTEGRITY_SECRET: "integrity_test_dummy",
        WOMPI_MAX_POLL_WAIT_MS: 20000,
        WOMPI_POLL_INITIAL_INTERVAL_MS: 500,
      };

      it("should be success", () => {
        paramsEnvironmentVariables = validate(requiredParms);

        expect(paramsEnvironmentVariables).toEqual(requiredParms);
      });
    });
  });
});
