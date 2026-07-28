import { Router } from "express";
import { CURRENCY, DAILY_LIMIT_FILS, DEPOSITED_TODAY_FILS } from "../data";
import { filsToAedString, parseAedToFils } from "../money";

export const depositRouter = Router();

depositRouter.get("/deposit-summary", (_req, res) => {
  const remainingFils = DAILY_LIMIT_FILS - DEPOSITED_TODAY_FILS;

  res.status(200).json({
    currency: CURRENCY,
    dailyLimit: filsToAedString(DAILY_LIMIT_FILS),
    depositedToday: filsToAedString(DEPOSITED_TODAY_FILS),
    remaining: filsToAedString(remainingFils),
  });
});

depositRouter.post("/deposit-check", (req, res) => {
  const amountFils = parseAedToFils(req.body?.amount);

  if (amountFils === null) {
    return res.status(400).json({
      error: "INVALID_AMOUNT",
      message:
        'Amount must be a positive decimal string with at most two decimal places, e.g. "10", "10.4", or "10.47".',
    });
  }

  // Read-only check: deposited-today is never mutated by this endpoint.
  const remainingBeforeFils = DAILY_LIMIT_FILS - DEPOSITED_TODAY_FILS;
  const eligible = amountFils <= remainingBeforeFils;
  const remainingAfterFils = eligible
    ? remainingBeforeFils - amountFils
    : remainingBeforeFils;

  res.status(200).json({
    eligible,
    currency: CURRENCY,
    requestedAmount: filsToAedString(amountFils),
    remainingBefore: filsToAedString(remainingBeforeFils),
    remainingAfter: filsToAedString(remainingAfterFils),
    reason: eligible ? null : "DAILY_LIMIT_EXCEEDED",
  });
});
