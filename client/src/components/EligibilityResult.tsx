import { formatMoney } from "../format";
import type { DepositCheckResult } from "../types";

interface EligibilityResultProps {
  state: "idle" | "loading" | "error" | "result";
  result: DepositCheckResult | null;
  error: string | null;
}

export function EligibilityResult({
  state,
  result,
  error,
}: EligibilityResultProps) {
  return (
    <div aria-live="polite" className="result">
      {state === "loading" && <p role="status">Checking eligibility…</p>}

      {state === "error" && (
        <p role="alert" className="message message-error">
          {error}
        </p>
      )}

      {state === "result" && result?.eligible && (
        <p role="status" className="message message-success">
          Eligible — {formatMoney(result.currency, result.requestedAmount)}{" "}
          can be deposited. Remaining allowance after this deposit:{" "}
          {formatMoney(result.currency, result.remainingAfter)}.
        </p>
      )}

      {state === "result" && result && !result.eligible && (
        <p role="alert" className="message message-warning">
          Not eligible —{" "}
          {formatMoney(result.currency, result.requestedAmount)} exceeds your
          remaining allowance of{" "}
          {formatMoney(result.currency, result.remainingBefore)}.
        </p>
      )}
    </div>
  );
}
