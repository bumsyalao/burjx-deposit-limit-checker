import { type FormEvent, useState } from "react";
import { isWellFormedAmount } from "../format";

interface DepositFormProps {
  onSubmit: (amount: string) => void;
  isChecking: boolean;
}

export function DepositForm({ onSubmit, isChecking }: DepositFormProps) {
  const [amount, setAmount] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = amount.trim();
    if (!isWellFormedAmount(trimmed)) {
      setLocalError(
        'Enter a positive amount with at most two decimal places, e.g. "10" or "10.47".',
      );
      return;
    }

    setLocalError(null);
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="deposit-amount">Deposit amount (AED)</label>
        <input
          id="deposit-amount"
          name="amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-describedby={localError ? "deposit-amount-error" : undefined}
          aria-invalid={localError ? true : undefined}
        />
      </div>

      {localError && (
        <p id="deposit-amount-error" role="alert" className="message message-error">
          {localError}
        </p>
      )}

      <button type="submit" disabled={isChecking}>
        {isChecking ? "Checking…" : "Check eligibility"}
      </button>
    </form>
  );
}
