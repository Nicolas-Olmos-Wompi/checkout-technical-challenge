import { User } from "../model/user.entity";

export interface IUserRepository {
  /**
   * Finds a user by their unique username.
   * @param {string} username - the username to search for.
   * @returns the matching `User`, or `null` if none exists.
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Finds a user by their unique id.
   * @param {string} id - the user id to search for.
   * @returns the matching `User`, or `null` if none exists.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Persists a new user with an already-hashed password.
   * @param {object} params - the user data to persist.
   * @param {string} params.username - the unique username.
   * @param {string} params.email - the unique email.
   * @param {string} params.passwordHash - the hashed password.
   * @returns the created `User`.
   */
  create(params: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<User>;
}
