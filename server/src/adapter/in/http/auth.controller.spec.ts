import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { HandlerSignup } from "src/handler/signup.handler";
import { HandlerLogin } from "src/handler/login.handler";
import { HTTPResponse } from "src/model/dto/http-response.model";
import { SignupRequest, LoginRequest } from "src/model/dto/auth.type";

describe("AuthController", () => {
  let controller: AuthController;
  let handlerSignup: HandlerSignup;
  let handlerLogin: HandlerLogin;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: HandlerSignup,
          useValue: {
            execute: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: HandlerLogin,
          useValue: {
            execute: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    handlerSignup = module.get<HandlerSignup>(HandlerSignup);
    handlerLogin = module.get<HandlerLogin>(HandlerLogin);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call handlerSignup.execute with the signup request", async () => {
    const request: SignupRequest = {
      username: "johndoe",
      password: "password123",
    };
    const result = {} as HTTPResponse;

    jest.spyOn(handlerSignup, "execute").mockResolvedValue(result);

    const response = await controller.signup(request);

    expect(handlerSignup.execute).toHaveBeenCalledWith(request);
    expect(response).toBe(result);
  });

  it("should call handlerLogin.execute with the login request", async () => {
    const request: LoginRequest = {
      username: "johndoe",
      password: "password123",
    };
    const result = {} as HTTPResponse;

    jest.spyOn(handlerLogin, "execute").mockResolvedValue(result);

    const response = await controller.login(request);

    expect(handlerLogin.execute).toHaveBeenCalledWith(request);
    expect(response).toBe(result);
  });
});
