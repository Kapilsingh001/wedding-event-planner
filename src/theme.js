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

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // ignore, the theme still changes for this visit
  }
}
