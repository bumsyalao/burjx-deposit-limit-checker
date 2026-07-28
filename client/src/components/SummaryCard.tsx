import { formatMoney } from "../format";
import type { DepositSummary } from "../types";

interface SummaryCardProps {
  state: "loading" | "error" | "ready";
  summary: DepositSummary | null;
  error: string | null;
}

export function SummaryCard({ state, summary, error }: SummaryCardProps) {
  return (
    <section aria-labelledby="summary-heading" className="card">
      <h2 id="summary-heading">Your daily deposit allowance</h2>

      {state === "loading" && <p role="status">Loading your allowance…</p>}

      {state === "error" && (
        <p role="alert" className="message message-error">
          {error}
        </p>
      )}

      {state === "ready" && summary && (
        <dl className="summary-grid">
          <div>
            <dt>Daily limit</dt>
            <dd>{formatMoney(summary.currency, summary.dailyLimit)}</dd>
          </div>
          <div>
            <dt>Deposited today</dt>
            <dd>{formatMoney(summary.currency, summary.depositedToday)}</dd>
          </div>
          <div>
            <dt>Remaining allowance</dt>
            <dd>{formatMoney(summary.currency, summary.remaining)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
