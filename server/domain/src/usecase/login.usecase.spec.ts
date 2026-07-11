import { MockProxy, mock } from "jest-mock-extended";
import { IUserRepository } from "../interface/user.repository";
import { IPasswordHasher } from "../interface/password-hasher";
import { ITokenGenerator } from "../interface/token-generator";
import { User } from "../model/user.entity";
import { InvalidCredentialsError } from "../model/auth.errors";
import { LoginUseCase } from "./login.usecase";

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let userRepository: MockProxy<IUserRepository>;
  let passwordHasher: MockProxy<IPasswordHasher>;
  let tokenService: MockProxy<ITokenGenerator>;

  const buildUser = (): User =>
    Object.assign(new User(), {
      id: "11111111-1111-1111-1111-111111111111",
      username: "johndoe",
      email: "johndoe@example.com",
      passwordHash: "hashed-password",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });

  beforeEach(() => {
    userRepository = mock<IUserRepository>();
    passwordHasher = mock<IPasswordHasher>();
    tokenService = mock<ITokenGenerator>();
    loginUseCase = new LoginUseCase(
      userRepository,
      passwordHasher,
      tokenService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw InvalidCredentialsError when the username does not exist", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(
      loginUseCase.apply({ username: "unknown", password: "password123" }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it("should throw InvalidCredentialsError when the password does not match", async () => {
    userRepository.findByUsername.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      loginUseCase.apply({ username: "johndoe", password: "wrong-password" }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(tokenService.sign).not.toHaveBeenCalled();
  });

  it("should return the user with a signed token on valid credentials", async () => {
    const user = buildUser();
    userRepository.findByUsername.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.sign.mockResolvedValue({
      token: "signed.jwt",
      expiresIn: "1h",
    });

    const result = await loginUseCase.apply({
      username: "johndoe",
      password: "password123",
    });

    expect(passwordHasher.compare).toHaveBeenCalledWith(
      "password123",
      "hashed-password",
    );
    expect(tokenService.sign).toHaveBeenCalledWith({
      id: user.id,
      username: user.username,
    });
    expect(result).toEqual({ user, token: "signed.jwt", expiresIn: "1h" });
  });
});
