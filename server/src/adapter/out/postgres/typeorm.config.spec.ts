/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import { Environment } from "../../../model/enum/environment.enum";
import { typeOrmConfig } from "./typeorm.config";
import { AuthMechanism } from "../../../model/enum/auth-mechanism.enum";
import { AmazonRDSUtils } from "../../../common/utils/amazon-rds/amazon-rds.util";

jest.mock("../../../common/utils/amazon-rds/amazon-rds.util", () => ({
  AmazonRDSUtils: {
    getAuthToken: jest.fn(),
  },
}));
describe("typeOrmConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setDBEnvironmentVariables = () => {
    process.env.DB_HOST = "test";
    process.env.DB_NAME = "test";
    process.env.DB_USERNAME = "test";
    process.env.DB_PASSWORD = "test";
  };

  it("should return typeOrmConfig when is local and auth mechanism is password", () => {
    process.env.APP_ENV = Environment.LOCAL;
    process.env.DB_AUTH_MECHANISM = AuthMechanism.PASSWORD;
    setDBEnvironmentVariables();

    const expected = {
      type: "postgres",
      host: expect.any(String),
      port: expect.any(Number),
      username: expect.any(String),
      password: expect.any(Function),
      ssl: undefined,
      database: expect.any(String),
      synchronize: false,
      logging: false,
      poolSize: 10,
      connectTimeoutMS: 5000,
      extra: expect.any(Object),
    };

    const result = typeOrmConfig();

    expect(result).toMatchObject(expected);
  });

  it("should return typeOrmConfig when is local and auth mechanism is IAM auth", () => {
    process.env.APP_ENV = Environment.LOCAL;
    process.env.DB_AUTH_MECHANISM = AuthMechanism.IAM_AUTH;
    setDBEnvironmentVariables();

    const expected = {
      type: "postgres",
      host: expect.any(String),
      port: expect.any(Number),
      username: expect.any(String),
      password: expect.any(Function),
      ssl: undefined,
      database: expect.any(String),
      synchronize: false,
      logging: false,
      poolSize: 10,
      connectTimeoutMS: 5000,
      extra: expect.any(Object),
    };

    const result = typeOrmConfig();

    expect(result).toMatchObject(expected);
  });

  it("should return typeOrmConfig when is not local and auth mechanism is IAM auth", () => {
    process.env.APP_ENV = Environment.PRODUCTION;
    process.env.DB_AUTH_MECHANISM = AuthMechanism.IAM_AUTH;
    process.env.DB_POOL_SIZE = "10";
    process.env.DB_CONNECTION_TIMEOUT_IN_MS = "test";
    setDBEnvironmentVariables();

    const expected = {
      type: "postgres",
      host: expect.any(String),
      port: expect.any(Number),
      username: expect.any(String),
      password: expect.any(Function),
      ssl: { rejectUnauthorized: false },
      database: expect.any(String),
      synchronize: false,
      logging: false,
      poolSize: 10,
      connectTimeoutMS: 5000,
      extra: expect.any(Object),
    };

    const result = typeOrmConfig();

    expect(result).toMatchObject(expected);
  });
});

describe("getPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return config with DB_PASSWORD when environment is local", async () => {
    process.env.APP_ENV = Environment.LOCAL;
    process.env.DB_PASSWORD = "local-password";

    const config = typeOrmConfig();
    const password = await (config as any).password();

    expect(password).toBe("local-password");
  });

  it("should return config with DB_PASSWORD when auth mechanism is PASSWORD", async () => {
    process.env.APP_ENV = Environment.LOCAL;
    process.env.DB_PASSWORD = "password-auth";

    const config = typeOrmConfig();
    const password = await (config as any).password();

    expect(password).toBe("password-auth");
  });

  it("should call AmazonRDSUtils.getAuthToken when auth mechanism is IAM_AUTH", async () => {
    process.env.APP_ENV = Environment.PRODUCTION;
    process.env.DB_AUTH_MECHANISM = AuthMechanism.IAM_AUTH;

    (AmazonRDSUtils.getAuthToken as jest.Mock).mockResolvedValue(
      "iam-auth-token",
    );

    const config = typeOrmConfig();
    const password = await (config as any).password();

    expect(password).toBe("iam-auth-token");
    expect(AmazonRDSUtils.getAuthToken).toHaveBeenCalled();
  });

  it("should throw an error if AmazonRDSUtils.getAuthToken fails", async () => {
    process.env.APP_ENV = Environment.PRODUCTION;
    process.env.DB_AUTH_MECHANISM = AuthMechanism.IAM_AUTH;

    (AmazonRDSUtils.getAuthToken as jest.Mock).mockRejectedValue(
      new Error("Auth token error"),
    );

    const config = typeOrmConfig();
    await expect((config as any).password()).rejects.toThrow(
      "Auth token error",
    );

    expect(AmazonRDSUtils.getAuthToken).toHaveBeenCalled();
  });
});
