import { Logger } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { IsNumber, IsOptional, IsString, validateSync } from "class-validator";

class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT!: number;

  @IsString()
  AWS_REGION!: string;

  @IsString()
  DB_HOST!: string;

  @IsNumber()
  DB_PORT!: number;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME!: string;

  @IsString()
  @IsOptional()
  SERVICE_NAME!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN!: string;

  @IsString()
  WOMPI_BASE_URL!: string;

  @IsString()
  WOMPI_PUBLIC_KEY!: string;

  @IsString()
  WOMPI_PRIVATE_KEY!: string;

  @IsString()
  WOMPI_INTEGRITY_SECRET!: string;

  @IsNumber()
  @IsOptional()
  WOMPI_MAX_POLL_WAIT_MS!: number;

  @IsNumber()
  @IsOptional()
  WOMPI_POLL_INITIAL_INTERVAL_MS!: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const variables = errors.map((error) => error.property);
    Logger.error("Configuration error.", variables);

    throw new Error(
      "You do not have the necessary configuration to run the microservice.",
    );
  }

  return validatedConfig;
}
