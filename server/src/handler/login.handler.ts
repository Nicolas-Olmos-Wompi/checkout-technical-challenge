import {
  Injectable,
  Inject,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { AuthMapper } from "../model/mapper/auth.mapper";
import { LoginUseCase } from "../../domain/src/usecase/login.usecase";
import { InvalidCredentialsError } from "../../domain/src/model/auth.errors";
import { LoggerService } from "../common/logger/logger.service";
import { AuthResponse, LoginRequest } from "../model/dto/auth.type";

@Injectable()
export class HandlerLogin {
  private readonly logger = new LoggerService("HandlerLogin");

  constructor(
    @Inject("LoginUseCase")
    private readonly loginUC: LoginUseCase,
  ) {}

  async execute(request: LoginRequest): Promise<HTTPResponse> {
    this.logger.log("POST /auth/login", { username: request.username });

    try {
      const command = AuthMapper.toLoginCommand(request);
      const authResult = await this.loginUC.apply(command);
      const response: AuthResponse = AuthMapper.toDTO(authResult);

      this.logger.log("Login handler completed successfully", {
        username: request.username,
      });

      return new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      );
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        this.logger.warn("Login handler: unauthorized", {
          username: request.username,
        });
        throw new UnauthorizedException(error.message);
      }
      this.logger.error(error, { username: request.username });
      throw error;
    }
  }
}
