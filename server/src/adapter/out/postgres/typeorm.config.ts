import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import * as dotenv from "dotenv";
import { AmazonRDSUtils } from "../../../common/utils/amazon-rds/amazon-rds.util";
import { AuthMechanism } from "../../../model/enum/auth-mechanism.enum";
import { isLocal } from "../../../common/utils/environment.util";

export const typeOrmConfig = (): PostgresConnectionOptions => {
  dotenv.config({ quiet: true });
  const {
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_NAME,
    DB_AUTH_MECHANISM,
    DB_POOL_SIZE,
    DB_MAX_CONNECTIONS,
    DB_MIN_CONNECTIONS,
    DB_CONNECTION_TIMEOUT_IN_MS,
    DB_IDLE_TIMEOUT_IN_MS,
    DB_STATEMENT_TIMEOUT_IN_MS,
    DB_QUERY_TIMEOUT_IN_MS,
  } = process.env;

  const config: PostgresConnectionOptions = {
    type: "postgres",
    host: DB_HOST,
    port: numberValueOrDefault(DB_PORT, 5432),
    username: DB_USERNAME,
    password: () => getPassword(DB_AUTH_MECHANISM as AuthMechanism),
    ssl: getSsl(),
    database: DB_NAME,
    synchronize: false,
    logging: false,
    poolSize: numberValueOrDefault(DB_POOL_SIZE, 10),
    connectTimeoutMS: numberValueOrDefault(DB_CONNECTION_TIMEOUT_IN_MS, 5000),
    extra: {
      max: numberValueOrDefault(DB_MAX_CONNECTIONS, 20),
      min: numberValueOrDefault(DB_MIN_CONNECTIONS, 5),
      idleTimeoutMillis: numberValueOrDefault(DB_IDLE_TIMEOUT_IN_MS, 10000),
      statement_timeout: numberValueOrDefault(
        DB_STATEMENT_TIMEOUT_IN_MS,
        10000,
      ),
      query_timeout: numberValueOrDefault(DB_QUERY_TIMEOUT_IN_MS, 5000),
    },
  };

  return config;
};

const getPassword = async (auth: AuthMechanism): Promise<string> => {
  if (isLocal() || auth === AuthMechanism.PASSWORD)
    return process.env.DB_PASSWORD!;

  return AmazonRDSUtils.getAuthToken();
};

const getSsl = () => {
  if (isLocal()) return undefined;

  return { rejectUnauthorized: false };
};

const numberValueOrDefault = (
  value: string | undefined,
  defaultValue: number,
): number => {
  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
};
