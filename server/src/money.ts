const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Parses a decimal AED amount string into an integer fils count (1 AED = 100 fils).
 * Never uses parseFloat/Number() on the raw decimal — only on the pre-validated
 * whole/fractional digit substrings — so binary floating-point never enters the
 * calculation. Returns null for anything that isn't a positive decimal string
 * with at most two decimal places.
 */
export function parseAedToFils(input: unknown): number | null {
  if (typeof input !== "string" || !AMOUNT_PATTERN.test(input)) {
    return null;
  }

  const [whole, fraction = ""] = input.split(".");
  const fils = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  return fils === 0 ? null : fils;
}

/** Formats a non-negative integer fils count back to a "X.XX" AED string. */
export function filsToAedString(fils: number): string {
  const whole = Math.floor(fils / 100);
  const fraction = (fils % 100).toString().padStart(2, "0");
  return `${whole}.${fraction}`;
}
