import { ILogger } from "../interface/logger.interface";
import { IUserRepository } from "../interface/user.repository";
import { IPasswordHasher } from "../interface/password-hasher";
import { ITokenGenerator } from "../interface/token-generator";
import { AuthResult, LoginCommand } from "../model/auth.type";
import { InvalidCredentialsError } from "../model/auth.errors";

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenGenerator,
    private readonly logger: ILogger,
  ) {}

  public async apply(command: LoginCommand): Promise<AuthResult> {
    this.logger.log("Login attempt", { username: command.username });

    const user = await this.userRepository.findByUsername(command.username);

    if (!user) {
      this.logger.warn("Login failed: user not found", {
        username: command.username,
      });
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      this.logger.warn("Login failed: invalid password", {
        username: command.username,
      });
      throw new InvalidCredentialsError();
    }

    const { token, expiresIn } = await this.tokenService.sign({
      id: user.id,
      username: user.username,
    });

    this.logger.log("Login successful", {
      userId: user.id,
      username: user.username,
    });

    return { user, token, expiresIn };
  }
}
