export const CURRENCY = "AED";

// Fixed demo customer, held as integer fils (1 AED = 100 fils) so nothing
// downstream ever needs to touch floating-point arithmetic on money.
export const DAILY_LIMIT_FILS = 2_500_000; // AED 25,000.00
export const DEPOSITED_TODAY_FILS = 680_000; // AED 6,800.00
