import {
  AuthResult,
  LoginCommand,
  SignupCommand,
} from "domain/src/model/auth.type";
import { AuthResponse, LoginRequest, SignupRequest } from "../dto/auth.type";

const BEARER_TOKEN_TYPE = "Bearer";

export class AuthMapper {
  public static toSignupCommand(request: SignupRequest): SignupCommand {
    return {
      username: request.username,
      password: request.password,
    };
  }

  public static toLoginCommand(request: LoginRequest): LoginCommand {
    return {
      username: request.username,
      password: request.password,
    };
  }

  public static toDTO(authResult: AuthResult): AuthResponse {
    return {
      token: authResult.token,
      tokenType: BEARER_TOKEN_TYPE,
      expiresIn: authResult.expiresIn,
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
      },
    };
  }
}
