import { User } from "../model/user.entity";

export interface IUserRepository {
  /**
   * Finds a user by their unique username.
   * @param {string} username - the username to search for.
   * @returns the matching `User`, or `null` if none exists.
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Persists a new user with an already-hashed password.
   * @param {string} username - the unique username.
   * @param {string} passwordHash - the hashed password.
   * @returns the created `User`.
   */
  create(username: string, passwordHash: string): Promise<User>;
}
