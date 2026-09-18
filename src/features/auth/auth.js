export const API_URL = 'http://localhost:3001';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function saveUser(user) {
  const { password, ...safeUser } = user;
  localStorage.setItem('user', JSON.stringify(safeUser));
}

export function logout() {
  localStorage.removeItem('user');
}

export function isLoggedIn() {
  return getUser() !== null;
}
