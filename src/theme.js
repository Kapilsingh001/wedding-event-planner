// Light / dark theme. The choice is saved in localStorage so it stays after a refresh.
// index.css has a second set of colour variables under [data-theme='dark'].

export function getTheme() {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage can be blocked; fall back to the system setting
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// how long the colours take to fade when the theme is switched
export const THEME_FADE_MS = 350

export function applyTheme(theme) {
  const root = document.documentElement
  // Only when the theme really changes: put a class on <html> for a moment.
  // src/dark.css uses it to fade the colours instead of letting them jump.
  if (root.dataset.theme && root.dataset.theme !== theme) {
    root.classList.add('theme-switching')
    setTimeout(() => root.classList.remove('theme-switching'), THEME_FADE_MS)
  }
  root.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // ignore, the theme still changes for this visit
  }
}
