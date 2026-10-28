import { getUser } from '../auth/auth';

// Each logged-in user gets their own key, e.g. "shortlist_u1".
// If nobody is logged in we use "shortlist_guest".
function getKey() {
  const user = getUser();
  return user && user.id ? `shortlist_${user.id}` : 'shortlist_guest';
}

// Returns an array of vendor ids (strings), e.g. ["1", "5"]
export function getShortlist() {
  try {
    const raw = localStorage.getItem(getKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

// Adds the id if it is not saved, removes it if it is. Returns the new array.
export function toggleShortlist(vendorId) {
  const id = String(vendorId);
  const current = getShortlist();
  const updated = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];

  try {
    localStorage.setItem(getKey(), JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save shortlist');
  }

  return updated;
}