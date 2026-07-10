import {Logger} from '@nestjs/common';
import {plainToClass} from 'class-transformer';
import {IsNumber, IsOptional, IsString, validateSync} from 'class-validator';

/* Por favor incluye todas las variables de entorno necesarias para ejecutar el proyecto */
class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT!: number;

  @IsString()
  AWS_REGION!: string;

  @IsString()
  @IsOptional()
  AWS_DYNAMODB_ENDPOINT!: string;

  @IsString()
  AWS_DYNAMODB_TABLE_DOMAIN!: string;

  @IsString()
  AWS_COGNITO_USER_POOL_ID!: string;

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
  GRAFANA_AGENT_URL!: string;

  @IsString()
  SERVICE_NAME!: string;

  @IsString()
  SLACK_WEBHOOK!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const variables = errors.map(error => error.property);
    Logger.error('Configuration error.', variables);

    throw new Error(
      'You do not have the necessary configuration to run the microservice.'
    );
  }

  return validatedConfig;
}
