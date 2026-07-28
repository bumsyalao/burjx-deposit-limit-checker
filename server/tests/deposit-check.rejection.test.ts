import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("POST /api/deposit-check — rejection cases", () => {
  it("is ineligible when the amount exceeds the remaining allowance", async () => {
    const response = await request(app)
      .post("/api/deposit-check")
      .send({ amount: "18200.01" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      eligible: false,
      currency: "AED",
      requestedAmount: "18200.01",
      remainingBefore: "18200.00",
      remainingAfter: "18200.00",
      reason: "DAILY_LIMIT_EXCEEDED",
    });
  });

  it.each([
    ["non-numeric text", "abc"],
    ["negative value", "-5"],
    ["zero", "0"],
    ["comma-formatted", "10,000"],
    ["more than two decimal places", "10.999"],
    ["empty string", ""],
    ["leading-dot decimal", ".5"],
    ["trailing-dot decimal", "10."],
  ])("rejects malformed input: %s (%j)", async (_label, amount) => {
    const response = await request(app)
      .post("/api/deposit-check")
      .send({ amount });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "INVALID_AMOUNT",
      message: expect.any(String),
    });
  });

  it("rejects a missing amount field", async () => {
    const response = await request(app).post("/api/deposit-check").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_AMOUNT");
  });

  it("rejects a JSON number instead of a decimal string", async () => {
    const response = await request(app)
      .post("/api/deposit-check")
      .send({ amount: 10000 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_AMOUNT");
  });

  it("does not mutate depositedToday across repeated checks", async () => {
    await request(app).post("/api/deposit-check").send({ amount: "5000.00" });

    const summary = await request(app).get("/api/deposit-summary");

    expect(summary.body.depositedToday).toBe("6800.00");
    expect(summary.body.remaining).toBe("18200.00");
  });
});
