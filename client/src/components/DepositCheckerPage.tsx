import { useEffect, useState } from "react";
import { ApiError, checkDeposit, getDepositSummary } from "../api";
import type { DepositCheckResult, DepositSummary } from "../types";
import { DepositForm } from "./DepositForm";
import { EligibilityResult } from "./EligibilityResult";
import { SummaryCard } from "./SummaryCard";

type SummaryState = "loading" | "error" | "ready";
type CheckState = "idle" | "loading" | "error" | "result";

export function DepositCheckerPage() {
  const [summary, setSummary] = useState<DepositSummary | null>(null);
  const [summaryState, setSummaryState] = useState<SummaryState>("loading");
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [checkResult, setCheckResult] = useState<DepositCheckResult | null>(
    null,
  );
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDepositSummary()
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setSummaryState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSummaryError(
          error instanceof ApiError
            ? error.message
            : "Unable to load your deposit allowance. Please try again.",
        );
        setSummaryState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCheck(amount: string) {
    setCheckState("loading");
    setCheckError(null);

    try {
      const result = await checkDeposit(amount);
      setCheckResult(result);
      setCheckState("result");
    } catch (error) {
      setCheckError(
        error instanceof ApiError
          ? error.message
          : "Unable to check eligibility. Please try again.",
      );
      setCheckState("error");
    }
  }

  return (
    <main className="page">
      <h1>AED Deposit Limit Checker</h1>

      <SummaryCard state={summaryState} summary={summary} error={summaryError} />

      <section aria-labelledby="check-heading" className="card">
        <h2 id="check-heading">Check a deposit</h2>
        <DepositForm
          onSubmit={handleCheck}
          isChecking={checkState === "loading"}
        />
        <EligibilityResult
          state={checkState}
          result={checkResult}
          error={checkError}
        />
      </section>
    </main>
  );
}
