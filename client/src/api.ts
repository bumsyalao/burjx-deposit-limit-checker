import type { DepositCheckResult, DepositSummary } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorBody(response: Response): Promise<ApiError> {
  try {
    const body = await response.json();
    return new ApiError(
      body.error ?? "UNKNOWN_ERROR",
      body.message ?? "Something went wrong. Please try again.",
    );
  } catch {
    return new ApiError(
      "UNKNOWN_ERROR",
      "Something went wrong. Please try again.",
    );
  }
}

export async function getDepositSummary(): Promise<DepositSummary> {
  const response = await fetch(`${API_BASE_URL}/api/deposit-summary`);

  if (!response.ok) {
    throw await parseErrorBody(response);
  }

  return response.json();
}

export async function checkDeposit(
  amount: string,
): Promise<DepositCheckResult> {
  const response = await fetch(`${API_BASE_URL}/api/deposit-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    throw await parseErrorBody(response);
  }

  return response.json();
}
