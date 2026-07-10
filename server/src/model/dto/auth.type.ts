import { IsString, MaxLength, MinLength } from "class-validator";

export class SignupRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}

export class LoginRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}

export type AuthenticatedUserResponse = {
  id: string;
  username: string;
};

export type AuthResponse = {
  token: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthenticatedUserResponse;
};
