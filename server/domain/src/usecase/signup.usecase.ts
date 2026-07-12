import { ILogger } from "../interface/logger.interface";
import { IUserRepository } from "../interface/user.repository";
import { IPasswordHasher } from "../interface/password-hasher";
import { ITokenGenerator } from "../interface/token-generator";
import { AuthResult, SignupCommand } from "../model/auth.type";
import { UsernameAlreadyExistsError } from "../model/auth.errors";

export class SignupUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenGenerator,
    private readonly logger: ILogger,
  ) {}

  public async apply(command: SignupCommand): Promise<AuthResult> {
    this.logger.log("Signup attempt", {
      username: command.username,
      email: command.email,
    });

    const existingUser = await this.userRepository.findByUsername(
      command.username,
    );

    if (existingUser) {
      this.logger.warn("Signup failed: username already exists", {
        username: command.username,
      });
      throw new UsernameAlreadyExistsError(command.username);
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = await this.userRepository.create({
      username: command.username,
      email: command.email,
      passwordHash,
    });

    this.logger.log("User created successfully", {
      userId: user.id,
      username: user.username,
    });

    const { token, expiresIn } = await this.tokenService.sign({
      id: user.id,
      username: user.username,
    });

    this.logger.log("Signup completed, token issued", { userId: user.id });

    return { user, token, expiresIn };
  }
}
