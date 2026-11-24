import { describe, it, expect } from 'vitest';
import { matchesPriceRange, getTotalPages, paginate } from './vendorUtils';

describe('matchesPriceRange', () => {
  it("'any' accepts every price", () => {
    expect(matchesPriceRange('any', 30000)).toBe(true);
    expect(matchesPriceRange('any', 300000)).toBe(true);
  });

  it("'under50' accepts 30000 and rejects 50000", () => {
    expect(matchesPriceRange('under50', 30000)).toBe(true);
    expect(matchesPriceRange('under50', 50000)).toBe(false);
  });

  it("'above200' accepts 250000 and rejects 200000", () => {
    expect(matchesPriceRange('above200', 250000)).toBe(true);
    expect(matchesPriceRange('above200', 200000)).toBe(false);
  });
});

describe('getTotalPages', () => {
  it('gives 2 pages for 15 items with 8 per page', () => {
    expect(getTotalPages(15, 8)).toBe(2);
  });

  it('gives at least 1 page for 0 items', () => {
    expect(getTotalPages(0, 8)).toBe(1);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 15 }, (_, index) => index + 1); // [1..15]

  it('page 1 gives the first 8 items', () => {
    const page1 = paginate(items, 1, 8);
    expect(page1).toHaveLength(8);
    expect(page1[0]).toBe(1);
  });

  it('page 2 gives the last 7 items', () => {
    const page2 = paginate(items, 2, 8);
    expect(page2).toHaveLength(7);
    expect(page2[0]).toBe(9);
  });
});