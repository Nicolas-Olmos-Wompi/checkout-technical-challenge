/**
 * Formats an integer COP amount (no decimal subunit) using dot as the
 * thousands separator, e.g. 150000 -> "$150.000".
 */
export function formatPrice(amount: number): string {
  const amountWithoutCents = amount / 100
  const formatted = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(amountWithoutCents);
  return `$${formatted}`;
}
