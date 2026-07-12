import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from "../validation";

describe("validateUsername", () => {
  it("rejects usernames shorter than 3 characters", () => {
    expect(validateUsername("ab")).toBeDefined();
  });

  it("accepts a username exactly 3 characters long", () => {
    expect(validateUsername("abc")).toBeUndefined();
  });

  it("accepts a username exactly 255 characters long", () => {
    expect(validateUsername("a".repeat(255))).toBeUndefined();
  });

  it("rejects usernames longer than 255 characters", () => {
    expect(validateUsername("a".repeat(256))).toBeDefined();
  });

  it("accepts a typical username", () => {
    expect(validateUsername("john_doe")).toBeUndefined();
  });
});

describe("validateEmail", () => {
  it("accepts a well-formed email", () => {
    expect(validateEmail("user@example.com")).toBeUndefined();
  });

  it("rejects an email missing the @ symbol", () => {
    expect(validateEmail("userexample.com")).toBeDefined();
  });

  it("rejects an email missing a domain", () => {
    expect(validateEmail("user@")).toBeDefined();
  });

  it("rejects an email with spaces", () => {
    expect(validateEmail("user name@example.com")).toBeDefined();
  });

  it("rejects an email longer than 255 characters", () => {
    const longLocalPart = "a".repeat(250);
    expect(validateEmail(`${longLocalPart}@example.com`)).toBeDefined();
  });
});

describe("validatePassword", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePassword("short1")).toBeDefined();
  });

  it("accepts a password exactly 8 characters long", () => {
    expect(validatePassword("12345678")).toBeUndefined();
  });

  it("accepts a password exactly 255 characters long", () => {
    expect(validatePassword("a".repeat(255))).toBeUndefined();
  });

  it("rejects passwords longer than 255 characters", () => {
    expect(validatePassword("a".repeat(256))).toBeDefined();
  });
});

describe("validatePasswordConfirmation", () => {
  it("accepts matching passwords", () => {
    expect(validatePasswordConfirmation("secret123", "secret123")).toBeUndefined();
  });

  it("rejects non-matching passwords", () => {
    expect(validatePasswordConfirmation("secret123", "secret124")).toBeDefined();
  });

  it("rejects when confirmation is empty", () => {
    expect(validatePasswordConfirmation("secret123", "")).toBeDefined();
  });
});
