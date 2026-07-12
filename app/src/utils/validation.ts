/**
 * Mirrors server-side validation in server/src/model/dto/auth.type.ts
 * (class-validator decorators: username 3-255 chars, email format, password 8-255 chars).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(username: string): string | undefined {
  if (username.length < 3 || username.length > 255) {
    return "Username must be between 3 and 255 characters";
  }
  return undefined;
}

export function validateEmail(email: string): string | undefined {
  if (email.length > 255 || !EMAIL_REGEX.test(email)) {
    return "Enter a valid email address";
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8 || password.length > 255) {
    return "Password must be between 8 and 255 characters";
  }
  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (password !== confirmation) {
    return "Passwords do not match";
  }
  return undefined;
}
