/**
 * Client-side validation for the /products price filters (minPrice/maxPrice).
 * Prices are Colombian pesos (COP), which has no minor/decimal subunit, so
 * inputs must be non-negative whole numbers. Both fields are optional.
 */

const INTEGER_REGEX = /^\d+$/;

export function validatePrice(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }

  if (!INTEGER_REGEX.test(trimmed)) {
    return "Enter a non-negative whole number";
  }

  return undefined;
}

export function validatePriceRange(
  minValue: string,
  maxValue: string,
): string | undefined {
  const minError = validatePrice(minValue);
  const maxError = validatePrice(maxValue);
  if (minError || maxError) {
    return undefined;
  }

  const min = minValue.trim();
  const max = maxValue.trim();
  if (min === "" || max === "") {
    return undefined;
  }

  if (Number(min) > Number(max)) {
    return "Minimum price must be less than or equal to maximum price";
  }

  return undefined;
}
