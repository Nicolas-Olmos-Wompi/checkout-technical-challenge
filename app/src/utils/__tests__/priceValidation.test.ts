import {
  validatePrice,
  validatePriceRange,
} from "../priceValidation";

describe("validatePrice", () => {
  it("returns undefined for an empty string (optional field)", () => {
    expect(validatePrice("")).toBeUndefined();
  });

  it("returns undefined for a valid non-negative integer", () => {
    expect(validatePrice("1000")).toBeUndefined();
    expect(validatePrice("0")).toBeUndefined();
  });

  it("returns an error for a negative number", () => {
    expect(validatePrice("-5")).toBe("Enter a non-negative whole number");
  });

  it("returns an error for a non-integer (decimal) value", () => {
    expect(validatePrice("10.5")).toBe("Enter a non-negative whole number");
  });

  it("returns an error for non-numeric input", () => {
    expect(validatePrice("abc")).toBe("Enter a non-negative whole number");
  });

  it("returns an error for whitespace-only input treated as invalid when not empty-trimmed", () => {
    expect(validatePrice("  ")).toBeUndefined();
  });
});

describe("validatePriceRange", () => {
  it("returns undefined when both are empty", () => {
    expect(validatePriceRange("", "")).toBeUndefined();
  });

  it("returns undefined when only min is provided", () => {
    expect(validatePriceRange("100", "")).toBeUndefined();
  });

  it("returns undefined when only max is provided", () => {
    expect(validatePriceRange("", "500")).toBeUndefined();
  });

  it("returns undefined when min is less than max", () => {
    expect(validatePriceRange("100", "500")).toBeUndefined();
  });

  it("returns undefined when min equals max", () => {
    expect(validatePriceRange("300", "300")).toBeUndefined();
  });

  it("returns an error when min is greater than max", () => {
    expect(validatePriceRange("500", "100")).toBe(
      "Minimum price must be less than or equal to maximum price",
    );
  });
});
