import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { GetHealthUseCase } from "../../domain/src/usecase/get-health.usecase";
import { ERROR_STATES_MESSAGES } from "../common/response-states/error-states.messages";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { LoggerService } from "../common/logger/logger.service";
import { HTTPResponse } from "../model/dto/http-response.model";
import { GetServerHealthStatusMapper } from "../model/mapper/get-server-health-status.mapper";

@Injectable()
export class HandlerGetServerHealthStatus {
  private readonly logger = new LoggerService("HandlerGetServerHealthStatus");

  constructor(
    @Inject("GetHealthUseCase")
    private readonly getHealthUseCase: GetHealthUseCase,
  ) {}

  async execute(): Promise<HTTPResponse> {
    this.logger.log("GET /health");

    const healthStatus = await this.getHealthUseCase.apply();
    const response = GetServerHealthStatusMapper.toDTO(healthStatus);

    if (healthStatus) {
      this.logger.log("Health check handler: healthy");
      return new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      );
    }

    this.logger.error("Health check handler: unhealthy");

    return new HTTPResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_STATES_MESSAGES.GeneralException.code,
      ERROR_STATES_MESSAGES.GeneralException.message,
      response,
    );
  }
}
