import {
  detectCardBrand,
  validateCardNumber,
  validateExpiry,
  validateCvc,
  validateCardHolder,
  validateCardForm,
  type CardFormFields,
} from "../cardValidation";

describe("detectCardBrand", () => {
  it("detects Visa numbers (prefix 4)", () => {
    expect(detectCardBrand("4242424242424242")).toBe("VISA");
    expect(detectCardBrand("4111 1111 1111 1111")).toBe("VISA");
  });

  it("detects Mastercard numbers (51-55 and 2221-2720)", () => {
    expect(detectCardBrand("5555555555554444")).toBe("MASTERCARD");
    expect(detectCardBrand("5105105105105100")).toBe("MASTERCARD");
    expect(detectCardBrand("2221000000000009")).toBe("MASTERCARD");
    expect(detectCardBrand("2720999999999996")).toBe("MASTERCARD");
  });

  it("does not detect Mastercard just outside the 2221-2720 range", () => {
    expect(detectCardBrand("2220999999999999")).toBe("UNKNOWN");
    expect(detectCardBrand("2721000000000000")).toBe("UNKNOWN");
  });

  it("detects American Express numbers (34 or 37)", () => {
    expect(detectCardBrand("378282246310005")).toBe("AMEX");
    expect(detectCardBrand("341111111111111")).toBe("AMEX");
  });

  it("detects Diners Club numbers (300-305, 36, 38)", () => {
    expect(detectCardBrand("30569309025904")).toBe("DINERS");
    expect(detectCardBrand("36700102000000")).toBe("DINERS");
    expect(detectCardBrand("38520000023237")).toBe("DINERS");
  });

  it("detects Discover numbers (6011, 65)", () => {
    expect(detectCardBrand("6011111111111117")).toBe("DISCOVER");
    expect(detectCardBrand("6500000000000002")).toBe("DISCOVER");
  });

  it("returns UNKNOWN for unrecognized prefixes", () => {
    expect(detectCardBrand("1234567812345678")).toBe("UNKNOWN");
  });

  it("returns UNKNOWN for empty input", () => {
    expect(detectCardBrand("")).toBe("UNKNOWN");
  });

  it("ignores spaces when detecting brand", () => {
    expect(detectCardBrand("5555 5555 5555 4444")).toBe("MASTERCARD");
  });
});

describe("validateCardNumber", () => {
  it("returns undefined for a valid Visa number (Luhn valid)", () => {
    expect(validateCardNumber("4242424242424242")).toBeUndefined();
  });

  it("returns undefined for a valid Mastercard number", () => {
    expect(validateCardNumber("5555555555554444")).toBeUndefined();
  });

  it("returns undefined for a valid Amex number (15 digits)", () => {
    expect(validateCardNumber("378282246310005")).toBeUndefined();
  });

  it("accepts numbers formatted with spaces", () => {
    expect(validateCardNumber("4242 4242 4242 4242")).toBeUndefined();
  });

  it("returns an error for an empty string", () => {
    expect(validateCardNumber("")).toBe("Card number is required");
  });

  it("returns an error when Luhn check fails", () => {
    expect(validateCardNumber("4242424242424241")).toBe(
      "Enter a valid card number",
    );
  });

  it("returns an error for non-digit characters", () => {
    expect(validateCardNumber("4242abcd42424242")).toBe(
      "Card number must contain only digits",
    );
  });

  it("returns an error for a number that is too short", () => {
    expect(validateCardNumber("424242")).toBe("Enter a valid card number");
  });

  it("returns an error for an unrecognized brand", () => {
    expect(validateCardNumber("1234567812345670")).toBe(
      "Card brand is not supported",
    );
  });
});

describe("validateExpiry", () => {
  it("returns undefined for a valid future expiry", () => {
    expect(validateExpiry("12", "99")).toBeUndefined();
  });

  it("returns an error for empty month/year", () => {
    expect(validateExpiry("", "")).toBe("Expiry date is required");
  });

  it("returns an error for an invalid month", () => {
    expect(validateExpiry("13", "30")).toBe("Enter a valid expiry month");
    expect(validateExpiry("00", "30")).toBe("Enter a valid expiry month");
  });

  it("returns an error for a past expiry date", () => {
    expect(validateExpiry("01", "20")).toBe("Card has expired");
  });

  it("treats the current month/year as still valid", () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear() % 100).padStart(2, "0");
    expect(validateExpiry(month, year)).toBeUndefined();
  });
});

describe("validateCvc", () => {
  it("returns undefined for a valid 3-digit CVC on a non-Amex card", () => {
    expect(validateCvc("123", "VISA")).toBeUndefined();
    expect(validateCvc("123", "MASTERCARD")).toBeUndefined();
  });

  it("returns undefined for a valid 4-digit CVC on Amex", () => {
    expect(validateCvc("1234", "AMEX")).toBeUndefined();
  });

  it("returns an error for an empty CVC", () => {
    expect(validateCvc("", "VISA")).toBe("CVC is required");
  });

  it("returns an error for a 4-digit CVC on a non-Amex card", () => {
    expect(validateCvc("1234", "VISA")).toBe("CVC must be 3 digits");
  });

  it("returns an error for a 3-digit CVC on Amex", () => {
    expect(validateCvc("123", "AMEX")).toBe("CVC must be 4 digits");
  });

  it("returns an error for non-digit CVC", () => {
    expect(validateCvc("12a", "VISA")).toBe("CVC must contain only digits");
  });
});

describe("validateCardHolder", () => {
  it("returns undefined for a valid name", () => {
    expect(validateCardHolder("John Doe")).toBeUndefined();
  });

  it("returns an error for an empty string", () => {
    expect(validateCardHolder("")).toBe("Cardholder name is required");
  });

  it("returns an error for whitespace-only input", () => {
    expect(validateCardHolder("   ")).toBe("Cardholder name is required");
  });

  it("returns an error for a name shorter than 2 characters", () => {
    expect(validateCardHolder("J")).toBe(
      "Cardholder name must be at least 2 characters",
    );
  });
});

describe("validateCardForm", () => {
  const validFields: CardFormFields = {
    cardNumber: "4242424242424242",
    expMonth: "12",
    expYear: "99",
    cvc: "123",
    cardHolder: "John Doe",
  };

  it("returns no errors for a fully valid form", () => {
    expect(validateCardForm(validFields)).toEqual({});
  });

  it("returns an error map with all invalid fields", () => {
    const errors = validateCardForm({
      cardNumber: "",
      expMonth: "",
      expYear: "",
      cvc: "",
      cardHolder: "",
    });

    expect(errors).toEqual({
      cardNumber: "Card number is required",
      expiry: "Expiry date is required",
      cvc: "CVC is required",
      cardHolder: "Cardholder name is required",
    });
  });

  it("validates CVC length based on the detected brand", () => {
    const errors = validateCardForm({
      ...validFields,
      cardNumber: "378282246310005",
      cvc: "123",
    });

    expect(errors.cvc).toBe("CVC must be 4 digits");
  });
});
