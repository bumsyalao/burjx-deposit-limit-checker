export interface DepositSummary {
  currency: string;
  dailyLimit: string;
  depositedToday: string;
  remaining: string;
}

export interface DepositCheckResult {
  eligible: boolean;
  currency: string;
  requestedAmount: string;
  remainingBefore: string;
  remainingAfter: string;
  reason: string | null;
}
