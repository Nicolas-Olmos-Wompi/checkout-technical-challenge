import {
  validatePersonName,
  validateAddress,
  validateCity,
  validateRegion,
  validatePostalCode,
  validatePhoneNumber,
  validateDeliveryForm,
  type DeliveryFormFields,
} from "../deliveryValidation";

describe("validatePersonName", () => {
  it("returns undefined for a valid name", () => {
    expect(validatePersonName("John Doe")).toBeUndefined();
  });

  it("returns an error for an empty string", () => {
    expect(validatePersonName("")).toBe("Full name is required");
  });

  it("returns an error for whitespace-only input", () => {
    expect(validatePersonName("   ")).toBe("Full name is required");
  });

  it("returns an error for a name shorter than 2 characters", () => {
    expect(validatePersonName("J")).toBe("Full name must be at least 2 characters");
  });
});

describe("validateAddress", () => {
  it("returns undefined for a valid address", () => {
    expect(validateAddress("Calle 123 #45-67")).toBeUndefined();
  });

  it("returns an error for an empty string", () => {
    expect(validateAddress("")).toBe("Address is required");
  });

  it("returns an error for whitespace-only input", () => {
    expect(validateAddress("    ")).toBe("Address is required");
  });

  it("returns an error for an address shorter than 5 characters", () => {
    expect(validateAddress("Cll1")).toBe("Address must be at least 5 characters");
  });
});

describe("validateCity", () => {
  it("returns undefined for a valid city", () => {
    expect(validateCity("Bogotá")).toBeUndefined();
  });

  it("returns an error for an empty string", () => {
    expect(validateCity("")).toBe("City is required");
  });

  it("returns an error for whitespace-only input", () => {
    expect(validateCity("  ")).toBe("City is required");
  });
});

describe("validateRegion", () => {
  it("returns undefined for a valid region", () => {
    expect(validateRegion("Bogotá D.C.")).toBeUndefined();
  });

  it("returns an error for an empty string", () => {
    expect(validateRegion("")).toBe("Region is required");
  });

  it("returns an error for whitespace-only input", () => {
    expect(validateRegion("   ")).toBe("Region is required");
  });
});

describe("validatePostalCode", () => {
  it("returns undefined for a valid 6-digit postal code", () => {
    expect(validatePostalCode("110111")).toBeUndefined();
  });

  it("returns an error for an empty string", () => {
    expect(validatePostalCode("")).toBe("Postal code is required");
  });

  it("returns an error for a postal code with fewer than 6 digits", () => {
    expect(validatePostalCode("1101")).toBe(
      "Postal code must be exactly 6 digits",
    );
  });

  it("returns an error for a postal code with more than 6 digits", () => {
    expect(validatePostalCode("1101111")).toBe(
      "Postal code must be exactly 6 digits",
    );
  });

  it("returns an error for a postal code with non-numeric characters", () => {
    expect(validatePostalCode("11A111")).toBe(
      "Postal code must be exactly 6 digits",
    );
  });
});

describe("validatePhoneNumber", () => {
  it("returns undefined for a valid 10-digit phone number", () => {
    expect(validatePhoneNumber("3001234567")).toBeUndefined();
  });

  it("returns undefined for a valid phone number with +57 prefix", () => {
    expect(validatePhoneNumber("+573001234567")).toBeUndefined();
  });

  it("returns an error for an empty string", () => {
    expect(validatePhoneNumber("")).toBe("Phone number is required");
  });

  it("returns an error for a phone number with fewer than 10 digits", () => {
    expect(validatePhoneNumber("30012345")).toBe(
      "Enter a valid Colombian phone number (10 digits)",
    );
  });

  it("returns an error for a phone number with more than 10 digits (no prefix)", () => {
    expect(validatePhoneNumber("300123456789")).toBe(
      "Enter a valid Colombian phone number (10 digits)",
    );
  });

  it("returns an error for non-numeric characters", () => {
    expect(validatePhoneNumber("300abc4567")).toBe(
      "Enter a valid Colombian phone number (10 digits)",
    );
  });

  it("returns an error for +57 prefix with wrong digit count", () => {
    expect(validatePhoneNumber("+57300123")).toBe(
      "Enter a valid Colombian phone number (10 digits)",
    );
  });
});

describe("validateDeliveryForm", () => {
  const validForm: DeliveryFormFields = {
    personName: "John Doe",
    address: "Calle 123 #45-67",
    city: "Bogotá",
    region: "Bogotá D.C.",
    postalCode: "110111",
    phoneNumber: "3001234567",
  };

  it("returns an empty object for a fully valid form", () => {
    expect(validateDeliveryForm(validForm)).toEqual({});
  });

  it("returns an error keyed by field for each invalid field", () => {
    const result = validateDeliveryForm({
      ...validForm,
      personName: "",
      phoneNumber: "123",
    });

    expect(result.personName).toBe("Full name is required");
    expect(result.phoneNumber).toBe("Enter a valid Colombian phone number (10 digits)");
    expect(result.address).toBeUndefined();
  });

  it("returns errors for every field when all are empty", () => {
    const result = validateDeliveryForm({
      personName: "",
      address: "",
      city: "",
      region: "",
      postalCode: "",
      phoneNumber: "",
    });

    expect(Object.keys(result)).toEqual([
      "personName",
      "address",
      "city",
      "region",
      "postalCode",
      "phoneNumber",
    ]);
  });
});
