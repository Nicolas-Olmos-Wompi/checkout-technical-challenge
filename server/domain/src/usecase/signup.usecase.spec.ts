import { MockProxy, mock } from "jest-mock-extended";
import { IUserRepository } from "../interface/user.repository";
import { IPasswordHasher } from "../interface/password-hasher";
import { ITokenGenerator } from "../interface/token-generator";
import { User } from "../model/user.entity";
import { UsernameAlreadyExistsError } from "../model/auth.errors";
import { SignupUseCase } from "./signup.usecase";

describe("SignupUseCase", () => {
  let signupUseCase: SignupUseCase;
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
    signupUseCase = new SignupUseCase(
      userRepository,
      passwordHasher,
      tokenService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw UsernameAlreadyExistsError when the username is taken", async () => {
    userRepository.findByUsername.mockResolvedValue(buildUser());

    await expect(
      signupUseCase.apply({
        username: "johndoe",
        email: "johndoe@example.com",
        password: "password123",
      }),
    ).rejects.toThrow(UsernameAlreadyExistsError);

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("should hash the password before persisting the user", async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue("hashed-password");
    userRepository.create.mockResolvedValue(buildUser());
    tokenService.sign.mockResolvedValue({
      token: "signed.jwt",
      expiresIn: "1h",
    });

    await signupUseCase.apply({
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith("password123");
    expect(userRepository.create).toHaveBeenCalledWith({
      username: "johndoe",
      email: "johndoe@example.com",
      passwordHash: "hashed-password",
    });
  });

  it("should return the created user with a signed token", async () => {
    const user = buildUser();
    userRepository.findByUsername.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue("hashed-password");
    userRepository.create.mockResolvedValue(user);
    tokenService.sign.mockResolvedValue({
      token: "signed.jwt",
      expiresIn: "1h",
    });

    const result = await signupUseCase.apply({
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
    });

    expect(tokenService.sign).toHaveBeenCalledWith({
      id: user.id,
      username: user.username,
    });
    expect(result).toEqual({ user, token: "signed.jwt", expiresIn: "1h" });
  });
});
