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
  ) {}

  public async apply(command: LoginCommand): Promise<AuthResult> {
    const user = await this.userRepository.findByUsername(command.username);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const { token, expiresIn } = await this.tokenService.sign({
      id: user.id,
      username: user.username,
    });

    return { user, token, expiresIn };
  }
}
