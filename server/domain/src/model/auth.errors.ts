export class UsernameAlreadyExistsError extends Error {
  constructor(username: string) {
    super(`Username "${username}" is already taken.`);
    this.name = "UsernameAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid username or password.");
    this.name = "InvalidCredentialsError";
  }
}
