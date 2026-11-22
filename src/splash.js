// The loading screen is plain HTML inside index.html (the element with
// id="splash"), so it shows before React is ready. This file fades it out
// once the page has been drawn, and then removes it from the page.

// how long the loading screen stays, so the logo animation can be seen
export const SPLASH_MIN_MS = 2400
// how long the fade takes. It must match the transition in public/splash.css
export const SPLASH_FADE_MS = 500

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
