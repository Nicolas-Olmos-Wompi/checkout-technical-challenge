import { MockProxy, mock } from "jest-mock-extended";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtTokenGenerator } from "./jwt-token-generator";

describe("JwtTokenGenerator", () => {
  let tokenService: JwtTokenGenerator;
  let jwtService: MockProxy<JwtService>;
  let configService: MockProxy<ConfigService>;

  beforeEach(() => {
    jwtService = mock<JwtService>();
    configService = mock<ConfigService>();
    tokenService = new JwtTokenGenerator(jwtService, configService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should sign the payload and return the token with the configured expiresIn", async () => {
    configService.get.mockReturnValue("2h");
    jwtService.signAsync.mockResolvedValue("signed.jwt.token");

    const result = await tokenService.sign({
      id: "11111111-1111-1111-1111-111111111111",
      username: "johndoe",
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { id: "11111111-1111-1111-1111-111111111111", username: "johndoe" },
      { expiresIn: "2h" },
    );
    expect(result).toEqual({ token: "signed.jwt.token", expiresIn: "2h" });
  });

  it("should default expiresIn to 1h when not configured", async () => {
    configService.get.mockReturnValue(undefined);
    jwtService.signAsync.mockResolvedValue("signed.jwt.token");

    const result = await tokenService.sign({
      id: "11111111-1111-1111-1111-111111111111",
      username: "johndoe",
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { id: "11111111-1111-1111-1111-111111111111", username: "johndoe" },
      { expiresIn: "1h" },
    );
    expect(result.expiresIn).toBe("1h");
  });
});
