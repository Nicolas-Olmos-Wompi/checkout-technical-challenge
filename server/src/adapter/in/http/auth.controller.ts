import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { HTTPResponse } from "../../../model/dto/http-response.model";
import { HandlerSignup } from "../../../handler/signup.handler";
import { HandlerLogin } from "../../../handler/login.handler";
import { LoginRequest, SignupRequest } from "../../../model/dto/auth.type";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly handlerSignup: HandlerSignup,
    private readonly handlerLogin: HandlerLogin,
  ) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "User created and authenticated" })
  async signup(@Body() request: SignupRequest): Promise<HTTPResponse> {
    return this.handlerSignup.execute(request);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Authenticated user" })
  async login(@Body() request: LoginRequest): Promise<HTTPResponse> {
    return this.handlerLogin.execute(request);
  }
}
