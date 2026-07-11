import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { AuthenticatedUser } from "domain/src/model/auth.type";
import { ITokenGenerator } from "domain/src/interface/token-generator";

const DEFAULT_EXPIRES_IN = "1h";

@Injectable()
export class JwtTokenGeneratorAdapter implements ITokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sign(
    payload: AuthenticatedUser,
  ): Promise<{ token: string; expiresIn: string }> {
    const expiresIn =
      this.configService.get<string>("JWT_EXPIRES_IN") ?? DEFAULT_EXPIRES_IN;

    const token = await this.jwtService.signAsync(payload, {
      expiresIn,
    } as JwtSignOptions);

    return { token, expiresIn };
  }
}
