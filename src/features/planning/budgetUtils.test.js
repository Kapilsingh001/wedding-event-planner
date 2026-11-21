import { describe, it, expect } from "vitest";
import { getSpentByCategory, buildPlannedVsActual, getTotalPlanned } from "./budgetUtils";

describe("getSpentByCategory", () => {
  it("adds up two Catering expenses", () => {
    const expenses = [
      { category: "Catering", amount: 25000 },
      { category: "Catering", amount: 15000 },
    ];
    expect(getSpentByCategory(expenses)).toEqual({ Catering: 40000 });
  });
});

describe("buildPlannedVsActual", () => {
  it("marks a category over when spent is more than planned", () => {
    const result = buildPlannedVsActual({ Catering: 50000 }, [{ category: "Catering", amount: 60000 }]);
    expect(result).toEqual([{ category: "Catering", planned: 50000, spent: 60000, over: true }]);
  });

  it("does not mark a category over when spent is equal or less", () => {
    const equal = buildPlannedVsActual({ Music: 10000 }, [{ category: "Music", amount: 10000 }]);
    const less = buildPlannedVsActual({ Music: 10000 }, [{ category: "Music", amount: 8000 }]);
    expect(equal[0].over).toBe(false);
    expect(less[0].over).toBe(false);
  });
});

describe("getTotalPlanned", () => {
  it("returns 0 for an empty or missing plan", () => {
    expect(getTotalPlanned({})).toBe(0);
    expect(getTotalPlanned(undefined)).toBe(0);
  });
});