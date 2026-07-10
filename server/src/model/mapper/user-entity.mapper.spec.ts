import { UserEntity } from "../../adapter/out/postgres/user.entity";
import { UserEntityMapper } from "./user-entity.mapper";

describe("UserEntityMapper", () => {
  const buildEntity = (overrides: Partial<UserEntity> = {}): UserEntity => {
    const entity = new UserEntity();
    entity.id = "11111111-1111-1111-1111-111111111111";
    entity.username = "johndoe";
    entity.passwordHash = "hashed-password";
    entity.createdAt = new Date("2024-01-01T00:00:00.000Z");
    entity.updatedAt = new Date("2024-01-02T00:00:00.000Z");
    return Object.assign(entity, overrides);
  };

  describe("toModel", () => {
    it("should map a UserEntity to a domain User", () => {
      const entity = buildEntity();

      const result = UserEntityMapper.toModel(entity);

      expect(result).toMatchObject({
        id: entity.id,
        username: entity.username,
        passwordHash: entity.passwordHash,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    });
  });
});
