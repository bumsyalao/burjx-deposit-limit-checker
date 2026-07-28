import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("POST /api/deposit-check — exact allowance boundary", () => {
  it("is eligible when the amount exactly equals the remaining allowance", async () => {
    const response = await request(app)
      .post("/api/deposit-check")
      .send({ amount: "18200.00" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      eligible: true,
      currency: "AED",
      requestedAmount: "18200.00",
      remainingBefore: "18200.00",
      remainingAfter: "0.00",
      reason: null,
    });
  });
});
