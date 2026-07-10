import { AuthenticatedUser } from "../model/auth.type";

export interface ITokenGenerator {
  /**
   * Signs a bearer token for the given authenticated user.
   * @param {AuthenticatedUser} payload - the user identity to embed in the token.
   * @returns an object with the signed token and its expiration string.
   */
  sign(
    payload: AuthenticatedUser,
  ): Promise<{ token: string; expiresIn: string }>;
}
