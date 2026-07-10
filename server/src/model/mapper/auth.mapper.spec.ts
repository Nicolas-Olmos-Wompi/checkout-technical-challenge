import { AuthResult } from "domain/src/model/auth.type";
import { User } from "domain/src/model/user.entity";
import { LoginRequest, SignupRequest } from "../dto/auth.type";
import { AuthMapper } from "./auth.mapper";

describe("AuthMapper", () => {
  describe("toSignupCommand", () => {
    it("should map a SignupRequest to a SignupCommand", () => {
      const request: SignupRequest = {
        username: "johndoe",
        password: "password123",
      };

      const result = AuthMapper.toSignupCommand(request);

      expect(result).toEqual({
        username: "johndoe",
        password: "password123",
      });
    });
  });

  describe("toLoginCommand", () => {
    it("should map a LoginRequest to a LoginCommand", () => {
      const request: LoginRequest = {
        username: "johndoe",
        password: "password123",
      };

      const result = AuthMapper.toLoginCommand(request);

      expect(result).toEqual({
        username: "johndoe",
        password: "password123",
      });
    });
  });

  describe("toDTO", () => {
    it("should map an AuthResult to an AuthResponse without exposing the password hash", () => {
      const authResult: AuthResult = {
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

      const result = AuthMapper.toDTO(authResult);

      expect(result).toEqual({
        token: "signed.jwt.token",
        tokenType: "Bearer",
        expiresIn: "1h",
        user: {
          id: "11111111-1111-1111-1111-111111111111",
          username: "johndoe",
        },
      });
      expect(result).not.toHaveProperty("user.passwordHash");
    });
  });
});
