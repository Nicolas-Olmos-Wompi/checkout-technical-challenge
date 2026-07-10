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
import { AuthResponse, LoginRequest } from "../model/dto/auth.type";

@Injectable()
export class HandlerLogin {
  constructor(
    @Inject("LoginUseCase")
    private readonly loginUC: LoginUseCase,
  ) {}

  async execute(request: LoginRequest): Promise<HTTPResponse> {
    try {
      const command = AuthMapper.toLoginCommand(request);
      const authResult = await this.loginUC.apply(command);
      const response: AuthResponse = AuthMapper.toDTO(authResult);
      return new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      );
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
