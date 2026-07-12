/**
 * Client-side validation for the DeliveryScreen form. Country is excluded —
 * it's hardcoded to "Colombia" and not user-editable.
 *
 * postalCode and phoneNumber follow Colombian conventions:
 * - postalCode: exactly 6 numeric digits.
 * - phoneNumber: 10 digits, optionally prefixed with "+57".
 */

const POSTAL_CODE_REGEX = /^\d{6}$/;
const PHONE_REGEX = /^(\+57)?\d{10}$/;

export type DeliveryFormFields = {
  personName: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  phoneNumber: string;
};

export type DeliveryFormErrors = Partial<Record<keyof DeliveryFormFields, string>>;

export function validatePersonName(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "Full name is required";
  }
  if (trimmed.length < 2) {
    return "Full name must be at least 2 characters";
  }
  return undefined;
}

export function validateAddress(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "Address is required";
  }
  if (trimmed.length < 5) {
    return "Address must be at least 5 characters";
  }
  return undefined;
}

export function validateCity(value: string): string | undefined {
  if (value.trim() === "") {
    return "City is required";
  }
  return undefined;
}

export function validateRegion(value: string): string | undefined {
  if (value.trim() === "") {
    return "Region is required";
  }
  return undefined;
}

export function validatePostalCode(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "Postal code is required";
  }
  if (!POSTAL_CODE_REGEX.test(trimmed)) {
    return "Postal code must be exactly 6 digits";
  }
  return undefined;
}

export function validatePhoneNumber(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "Phone number is required";
  }
  if (!PHONE_REGEX.test(trimmed)) {
    return "Enter a valid Colombian phone number (10 digits)";
  }
  return undefined;
}

export function validateDeliveryForm(
  fields: DeliveryFormFields,
): DeliveryFormErrors {
  const errors: DeliveryFormErrors = {};

  const personNameError = validatePersonName(fields.personName);
  if (personNameError) errors.personName = personNameError;

  const addressError = validateAddress(fields.address);
  if (addressError) errors.address = addressError;

  const cityError = validateCity(fields.city);
  if (cityError) errors.city = cityError;

  const regionError = validateRegion(fields.region);
  if (regionError) errors.region = regionError;

  const postalCodeError = validatePostalCode(fields.postalCode);
  if (postalCodeError) errors.postalCode = postalCodeError;

  const phoneNumberError = validatePhoneNumber(fields.phoneNumber);
  if (phoneNumberError) errors.phoneNumber = phoneNumberError;

  return errors;
}
