import * as bcrypt from "bcrypt";
import { IPasswordHasher } from "domain/src/interface/password-hasher";

const SALT_ROUNDS = 12;

export class BcryptPasswordHasherAdapter implements IPasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}
