// The loading screen is plain HTML inside index.html (the element with
// id="splash"), so it shows before React is ready. This file does three things:
//   hideSplash         fades it out once the page has been drawn, then removes it
//   playSplash         shows it again later, for example after a login
//   playSplashOnLogin  watches the login state and calls playSplash at each login

// how long the loading screen stays, so the logo animation can be seen
export const SPLASH_MIN_MS = 3300
// how long the fade takes. It must match the transition in public/splash.css
export const SPLASH_FADE_MS = 500

// a copy of the loading screen, kept so it can be shown again after it was removed
let savedSplash = null

// elapsed = how long the page has been open already. If the page took longer
// to load than the minimum time, the loading screen goes away at once.
export function hideSplash({ minVisible = SPLASH_MIN_MS, fade = SPLASH_FADE_MS, elapsed = performance.now() } = {}) {
  const splash = document.getElementById('splash')
  if (!splash) return

  // people who switched off animations in their system settings do not wait
  const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const wait = calm ? 0 : Math.max(0, minVisible - elapsed)

  setTimeout(() => {
    splash.classList.add('splash-hide')
    // after the fade, take the element out so it cannot cover the page
    setTimeout(() => splash.remove(), fade)
  }, wait)
}

// Keeps a copy of the loading screen. Call it once at the start, while the
// loading screen from index.html is still on the page.
export function rememberSplash() {
  const splash = document.getElementById('splash')
  savedSplash = splash ? splash.cloneNode(true) : null
}

// Shows the loading screen again and lets it play from the beginning.
// Returns true when it started, false when there was nothing to show.
export function playSplash(options = {}) {
  // nothing was saved, or a loading screen is already showing
  if (!savedSplash || document.getElementById('splash')) return false

  const splash = savedSplash.cloneNode(true)
  // The drawn logo and the drawn name are SVG pictures with their own animation.
  // The browser would show a picture it already knows at the END of its
  // animation. A new address makes it load the picture again and draw from the start.
  splash.querySelectorAll('img').forEach((picture) => {
    const address = picture.getAttribute('src') || ''
    if (address.endsWith('.svg')) picture.setAttribute('src', `${address}?play=${Date.now()}`)
  })

  document.body.appendChild(splash)
  // elapsed: 0 means "it has only just appeared", so it stays for the full time
  hideSplash({ ...options, elapsed: 0 })
  return true
}

// Plays the loading screen each time someone logs in. It watches the Redux
// store: "no user" followed by "a user" is a login. A change of the name or
// the photo is "a user" followed by "a user", so that does not count.
// The store calls us inside the login itself, before the next page is drawn,
// so the dashboard never flashes before the loading screen covers it.
export function playSplashOnLogin(store, options) {
  let wasLoggedIn = Boolean(store.getState().auth.user)
  return store.subscribe(() => {
    const isLoggedIn = Boolean(store.getState().auth.user)
    if (isLoggedIn && !wasLoggedIn) playSplash(options)
    wasLoggedIn = isLoggedIn
  })
}
