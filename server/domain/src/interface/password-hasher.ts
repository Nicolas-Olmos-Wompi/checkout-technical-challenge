export interface IPasswordHasher {
  /**
   * Hashes a plain-text password.
   * @param {string} plainPassword - the plain-text password.
   * @returns the resulting hash.
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * Compares a plain-text password against a previously generated hash.
   * @param {string} plainPassword - the plain-text password.
   * @param {string} passwordHash - the previously generated hash.
   * @returns `true` if they match, `false` otherwise.
   */
  compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}
