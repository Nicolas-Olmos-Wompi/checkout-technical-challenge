import { BcryptPasswordHasherAdapter } from "./bcrypt-password-hasher.adapter";

describe("BcryptPasswordHasherAdapter", () => {
  let hasher: BcryptPasswordHasherAdapter;

  beforeEach(() => {
    hasher = new BcryptPasswordHasherAdapter();
  });

  describe("hash", () => {
    it("should produce a bcrypt hash different from the plain password", async () => {
      const result = await hasher.hash("password123");

      expect(result).not.toBe("password123");
      expect(result).toMatch(/^\$2[aby]\$/);
    });
  });

  describe("compare", () => {
    it("should return true when the plain password matches the hash", async () => {
      const hash = await hasher.hash("password123");

      const result = await hasher.compare("password123", hash);

      expect(result).toBe(true);
    });

    it("should return false when the plain password does not match the hash", async () => {
      const hash = await hasher.hash("password123");

      const result = await hasher.compare("wrong-password", hash);

      expect(result).toBe(false);
    });
  });
});
