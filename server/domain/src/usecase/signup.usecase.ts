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
  ) {}

  public async apply(command: SignupCommand): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByUsername(
      command.username,
    );

    if (existingUser) {
      throw new UsernameAlreadyExistsError(command.username);
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = await this.userRepository.create({
      username: command.username,
      email: command.email,
      passwordHash,
    });

    const { token, expiresIn } = await this.tokenService.sign({
      id: user.id,
      username: user.username,
    });

    return { user, token, expiresIn };
  }
}
