import {
  ConflictException,
  Injectable,
  Inject,
  HttpStatus,
} from "@nestjs/common";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { AuthMapper } from "../model/mapper/auth.mapper";
import { SignupUseCase } from "../../domain/src/usecase/signup.usecase";
import { UsernameAlreadyExistsError } from "../../domain/src/model/auth.errors";
import { AuthResponse, SignupRequest } from "../model/dto/auth.type";

@Injectable()
export class HandlerSignup {
  constructor(
    @Inject("SignupUseCase")
    private readonly signupUC: SignupUseCase,
  ) {}

  async execute(request: SignupRequest): Promise<HTTPResponse> {
    try {
      const command = AuthMapper.toSignupCommand(request);
      const authResult = await this.signupUC.apply(command);
      const response: AuthResponse = AuthMapper.toDTO(authResult);
      return new HTTPResponse(
        HttpStatus.CREATED,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      );
    } catch (error) {
      if (error instanceof UsernameAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
