import { ConflictException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HandlerSignup } from "./signup.handler";
import { SignupUseCase } from "../../domain/src/usecase/signup.usecase";
import { AuthMapper } from "../model/mapper/auth.mapper";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { SignupRequest, AuthResponse } from "../model/dto/auth.type";
import { AuthResult } from "../../domain/src/model/auth.type";
import { User } from "../../domain/src/model/user.entity";
import { UsernameAlreadyExistsError } from "../../domain/src/model/auth.errors";

describe("HandlerSignup", () => {
  let handler: HandlerSignup;
  let signupUseCase: SignupUseCase;

  const domainResult: AuthResult = {
    user: Object.assign(new User(), {
      id: "11111111-1111-1111-1111-111111111111",
      username: "johndoe",
      email: "johndoe@example.com",
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
    user: {
      id: "11111111-1111-1111-1111-111111111111",
      username: "johndoe",
      email: "johndoe@example.com",
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlerSignup,
        {
          provide: "SignupUseCase",
          useValue: {
            apply: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<HandlerSignup>(HandlerSignup);
    signupUseCase = module.get<SignupUseCase>("SignupUseCase");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should return a successful HTTP response on signup", async () => {
    const request: SignupRequest = {
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
    };
    jest.spyOn(signupUseCase, "apply").mockResolvedValue(domainResult);
    jest.spyOn(AuthMapper, "toDTO").mockReturnValue(dtoResponse);

    const result = await handler.execute(request);

    expect(result).toEqual(
      new HTTPResponse(
        HttpStatus.CREATED,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        dtoResponse,
      ),
    );
  });

  it("should call SignupUseCase.apply with the mapped command", async () => {
    const request: SignupRequest = {
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
    };
    jest.spyOn(signupUseCase, "apply").mockResolvedValue(domainResult);

    await handler.execute(request);

    expect(signupUseCase.apply).toHaveBeenCalledWith({
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
    });
  });

  it("should translate UsernameAlreadyExistsError into a ConflictException", async () => {
    const request: SignupRequest = {
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
    };
    jest
      .spyOn(signupUseCase, "apply")
      .mockRejectedValue(new UsernameAlreadyExistsError("johndoe"));

    await expect(handler.execute(request)).rejects.toThrow(ConflictException);
  });

  it("should rethrow unknown errors that are not UsernameAlreadyExistsError", async () => {
    const request: SignupRequest = {
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
    };
    const unknownError = new Error("database failure");
    jest.spyOn(signupUseCase, "apply").mockRejectedValue(unknownError);

    await expect(handler.execute(request)).rejects.toThrow(unknownError);
  });
});
