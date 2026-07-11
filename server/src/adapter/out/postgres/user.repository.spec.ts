import { MockProxy, mock } from "jest-mock-extended";
import { Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import { UserRepository } from "./user.repository";

describe("UserRepository", () => {
  let userRepository: UserRepository;
  let repository: MockProxy<Repository<UserEntity>>;

  const buildEntity = (overrides: Partial<UserEntity> = {}): UserEntity => {
    const entity = new UserEntity();
    entity.id = "11111111-1111-1111-1111-111111111111";
    entity.username = "johndoe";
    entity.email = "johndoe@example.com";
    entity.passwordHash = "hashed-password";
    entity.createdAt = new Date("2024-01-01T00:00:00.000Z");
    entity.updatedAt = new Date("2024-01-01T00:00:00.000Z");
    return Object.assign(entity, overrides);
  };

  beforeEach(() => {
    repository = mock<Repository<UserEntity>>();
    userRepository = new UserRepository(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("findByUsername", () => {
    it("should return the mapped user when found", async () => {
      repository.findOne.mockResolvedValue(buildEntity());

      const result = await userRepository.findByUsername("johndoe");

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: "johndoe" },
      });
      expect(result).toMatchObject({
        id: "11111111-1111-1111-1111-111111111111",
        username: "johndoe",
      });
    });

    it("should return null when no user matches", async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await userRepository.findByUsername("unknown");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should persist and return the mapped user", async () => {
      const entity = buildEntity();
      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await userRepository.create({
        username: "johndoe",
        email: "johndoe@example.com",
        passwordHash: "hashed-password",
      });

      expect(repository.create).toHaveBeenCalledWith({
        username: "johndoe",
        email: "johndoe@example.com",
        passwordHash: "hashed-password",
      });
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toMatchObject({
        username: "johndoe",
        email: "johndoe@example.com",
      });
    });
  });
});
