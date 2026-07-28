import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DepositCheckerPage } from "../components/DepositCheckerPage";

const SUMMARY_RESPONSE = {
  currency: "AED",
  dailyLimit: "25000.00",
  depositedToday: "6800.00",
  remaining: "18200.00",
};

const CHECK_RESPONSE = {
  eligible: true,
  currency: "AED",
  requestedAmount: "10000.00",
  remainingBefore: "18200.00",
  remainingAfter: "8200.00",
  reason: null,
};

describe("DepositCheckerPage — happy path", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();

        if (url.endsWith("/api/deposit-summary")) {
          return Promise.resolve(
            new Response(JSON.stringify(SUMMARY_RESPONSE), { status: 200 }),
          );
        }

        if (url.endsWith("/api/deposit-check") && init?.method === "POST") {
          return Promise.resolve(
            new Response(JSON.stringify(CHECK_RESPONSE), { status: 200 }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the deposit summary and displays a successful eligibility result", async () => {
    render(<DepositCheckerPage />);

    expect(await screen.findByText("AED 25,000.00")).toBeInTheDocument();
    expect(screen.getByText("AED 6,800.00")).toBeInTheDocument();
    expect(screen.getByText("AED 18,200.00")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Deposit amount (AED)"), {
      target: { value: "10000" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Check eligibility" }),
    );

    expect(
      await screen.findByText(
        /Eligible — AED 10,000\.00 can be deposited\. Remaining allowance after this deposit: AED 8,200\.00\./,
      ),
    ).toBeInTheDocument();
  });
});
