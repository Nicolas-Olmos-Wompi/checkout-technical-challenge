/**
 * Card brand detection follows standard IIN (Issuer Identification Number)
 * prefix ranges. Validation follows typical checkout UX: Luhn check,
 * per-brand length, expiry-not-in-past, per-brand CVC length.
 */
export type CardBrand =
  | "VISA"
  | "MASTERCARD"
  | "AMEX"
  | "DINERS"
  | "DISCOVER"
  | "UNKNOWN";

export type CardFormFields = {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
};

export type CardFormErrors = {
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  cardHolder?: string;
};

const CARD_NUMBER_LENGTHS: Record<CardBrand, number[]> = {
  VISA: [13, 16, 19],
  MASTERCARD: [16],
  AMEX: [15],
  DINERS: [14],
  DISCOVER: [16],
  UNKNOWN: [],
};

function stripSpaces(value: string): string {
  return value.replace(/\s/g, "");
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = stripSpaces(cardNumber);

  if (digits === "") {
    return "UNKNOWN";
  }

  if (/^4/.test(digits)) {
    return "VISA";
  }

  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));
  if (
    (firstTwo >= 51 && firstTwo <= 55) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "MASTERCARD";
  }

  if (firstTwo === 34 || firstTwo === 37) {
    return "AMEX";
  }

  const firstThree = Number(digits.slice(0, 3));
  if ((firstThree >= 300 && firstThree <= 305) || firstTwo === 36 || firstTwo === 38) {
    return "DINERS";
  }

  if (digits.startsWith("6011") || firstTwo === 65) {
    return "DISCOVER";
  }

  return "UNKNOWN";
}

function isValidLuhn(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateCardNumber(cardNumber: string): string | undefined {
  const digits = stripSpaces(cardNumber);

  if (digits === "") {
    return "Card number is required";
  }

  if (!/^\d+$/.test(digits)) {
    return "Card number must contain only digits";
  }

  const brand = detectCardBrand(digits);

  if (brand === "UNKNOWN") {
    return "Card brand is not supported";
  }

  const allowedLengths = CARD_NUMBER_LENGTHS[brand];
  if (!allowedLengths.includes(digits.length)) {
    return "Enter a valid card number";
  }

  if (!isValidLuhn(digits)) {
    return "Enter a valid card number";
  }

  return undefined;
}

export function validateExpiry(
  expMonth: string,
  expYear: string,
): string | undefined {
  if (expMonth.trim() === "" || expYear.trim() === "") {
    return "Expiry date is required";
  }

  if (!/^\d{1,2}$/.test(expMonth) || !/^\d{2}$/.test(expYear)) {
    return "Enter a valid expiry date";
  }

  const month = Number(expMonth);
  const year = Number(expYear);

  if (month < 1 || month > 12) {
    return "Enter a valid expiry month";
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Card has expired";
  }

  return undefined;
}

export function validateCvc(
  cvc: string,
  brand: CardBrand,
): string | undefined {
  if (cvc.trim() === "") {
    return "CVC is required";
  }

  if (!/^\d+$/.test(cvc)) {
    return "CVC must contain only digits";
  }

  const expectedLength = brand === "AMEX" ? 4 : 3;

  if (cvc.length !== expectedLength) {
    return `CVC must be ${expectedLength} digits`;
  }

  return undefined;
}

export function validateCardHolder(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "Cardholder name is required";
  }
  if (trimmed.length < 2) {
    return "Cardholder name must be at least 2 characters";
  }
  return undefined;
}

export function validateCardForm(fields: CardFormFields): CardFormErrors {
  const errors: CardFormErrors = {};

  const cardNumberError = validateCardNumber(fields.cardNumber);
  if (cardNumberError) errors.cardNumber = cardNumberError;

  const expiryError = validateExpiry(fields.expMonth, fields.expYear);
  if (expiryError) errors.expiry = expiryError;

  const brand = detectCardBrand(fields.cardNumber);
  const cvcError = validateCvc(fields.cvc, brand);
  if (cvcError) errors.cvc = cvcError;

  const cardHolderError = validateCardHolder(fields.cardHolder);
  if (cardHolderError) errors.cardHolder = cardHolderError;

  return errors;
}
