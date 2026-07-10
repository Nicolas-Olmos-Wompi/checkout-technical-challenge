import { MockProxy, mock } from "jest-mock-extended";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { AuthenticatedUser } from "domain/src/model/auth.type";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let configService: MockProxy<ConfigService>;

  beforeEach(() => {
    configService = mock<ConfigService>();
    configService.get.mockReturnValue("test-secret");
    strategy = new JwtStrategy(configService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("validate", () => {
    it("should return the authenticated user payload from the token", () => {
      const payload: AuthenticatedUser = {
        id: "11111111-1111-1111-1111-111111111111",
        username: "johndoe",
      };

      const result = strategy.validate(payload);

      expect(result).toEqual(payload);
    });
  });
});
