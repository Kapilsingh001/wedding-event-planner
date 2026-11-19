// Small pure functions (no React) so they are easy to test.

// Returns true if the price falls inside the selected budget range
export function matchesPriceRange(range, price) {
  const p = Number(price);
  switch (range) {
    case 'under50':
      return p < 50000;
    case '50to100':
      return p >= 50000 && p <= 100000;
    case '100to200':
      return p > 100000 && p <= 200000;
    case 'above200':
      return p > 200000;
    default:
      return true;
  }
}

// Number of pages needed. Always at least 1, even for an empty list.
export function getTotalPages(totalItems, perPage) {
  return Math.max(1, Math.ceil(totalItems / perPage));
}

// Returns only the items that belong to the given page (page 1 is the first).
export function paginate(items, page, perPage) {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}