import { HttpStatus, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HandlerLogin } from "./login.handler";
import { LoginUseCase } from "../../domain/src/usecase/login.usecase";
import { AuthMapper } from "../model/mapper/auth.mapper";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { LoginRequest, AuthResponse } from "../model/dto/auth.type";
import { AuthResult } from "../../domain/src/model/auth.type";
import { User } from "../../domain/src/model/user.entity";
import { InvalidCredentialsError } from "../../domain/src/model/auth.errors";

describe("HandlerLogin", () => {
  let handler: HandlerLogin;
  let loginUseCase: LoginUseCase;

  const domainResult: AuthResult = {
    user: Object.assign(new User(), {
      id: "11111111-1111-1111-1111-111111111111",
      username: "johndoe",
      passwordHash: "hashed-password",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    }),
    token: "signed.jwt.token",
    expiresIn: "1h",
  };

  const dtoResponse: AuthResponse = {
    token: "signed.jwt.token",
    tokenType: "Bearer",
    expiresIn: "1h",
    user: { id: "11111111-1111-1111-1111-111111111111", username: "johndoe" },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlerLogin,
        {
          provide: "LoginUseCase",
          useValue: {
            apply: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<HandlerLogin>(HandlerLogin);
    loginUseCase = module.get<LoginUseCase>("LoginUseCase");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should return a successful HTTP response on login", async () => {
    const request: LoginRequest = {
      username: "johndoe",
      password: "password123",
    };
    jest.spyOn(loginUseCase, "apply").mockResolvedValue(domainResult);
    jest.spyOn(AuthMapper, "toDTO").mockReturnValue(dtoResponse);

    const result = await handler.execute(request);

    expect(result).toEqual(
      new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        dtoResponse,
      ),
    );
  });

  it("should call LoginUseCase.apply with the mapped command", async () => {
    const request: LoginRequest = {
      username: "johndoe",
      password: "password123",
    };
    jest.spyOn(loginUseCase, "apply").mockResolvedValue(domainResult);

    await handler.execute(request);

    expect(loginUseCase.apply).toHaveBeenCalledWith({
      username: "johndoe",
      password: "password123",
    });
  });

  it("should translate InvalidCredentialsError into an UnauthorizedException", async () => {
    const request: LoginRequest = { username: "johndoe", password: "wrong" };
    jest
      .spyOn(loginUseCase, "apply")
      .mockRejectedValue(new InvalidCredentialsError());

    await expect(handler.execute(request)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should rethrow unknown errors that are not InvalidCredentialsError", async () => {
    const request: LoginRequest = { username: "johndoe", password: "password123" };
    const unknownError = new Error("database failure");
    jest.spyOn(loginUseCase, "apply").mockRejectedValue(unknownError);

    await expect(handler.execute(request)).rejects.toThrow(unknownError);
  });
});
