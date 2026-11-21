import { describe, it, expect } from "vitest";
import { eventSchema, expenseSchema } from "./schemas";

const validEvent = {
  title: "My Wedding",
  type: "Wedding",
  date: "2027-03-10",
  venue: "Grand Imperial Palace",
  budget: 500000,
};

describe("eventSchema", () => {
  it("fails for a 2-letter title", () => {
    expect(eventSchema.safeParse({ ...validEvent, title: "ab" }).success).toBe(false);
  });

  it("fails for budget 0", () => {
    expect(eventSchema.safeParse({ ...validEvent, budget: 0 }).success).toBe(false);
  });

  it("passes for a correct event", () => {
    expect(eventSchema.safeParse(validEvent).success).toBe(true);
  });
});

describe("expenseSchema", () => {
  it("fails for amount -5", () => {
    expect(expenseSchema.safeParse({ category: "Catering", amount: -5, date: "2026-11-01" }).success).toBe(false);
  });

  it("passes for amount 25000", () => {
    expect(expenseSchema.safeParse({ category: "Catering", amount: 25000, date: "2026-11-01" }).success).toBe(true);
  });
});