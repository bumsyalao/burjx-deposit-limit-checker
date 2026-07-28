export function formatMoney(currency: string, amount: string): string {
  const [whole, fraction] = amount.split(".");
  const wholeWithSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${currency} ${wholeWithSeparators}.${fraction}`;
}

// Mirrors the server's validation pattern so the form can give instant
// feedback; the server is still the sole source of truth on eligibility.
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function isWellFormedAmount(input: string): boolean {
  return AMOUNT_PATTERN.test(input) && input !== "0" && Number(input) !== 0;
}
