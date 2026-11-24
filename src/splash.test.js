import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { hideSplash, rememberSplash, playSplash, playSplashOnLogin } from './splash'

describe('hideSplash', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="splash"></div><div id="root"></div>'
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('keeps the loading screen for the minimum time, then fades it', () => {
    hideSplash({ minVisible: 1000, fade: 300, elapsed: 0 })
    const splash = document.getElementById('splash')

    vi.advanceTimersByTime(999)
    expect(splash.classList.contains('splash-hide')).toBe(false)

    vi.advanceTimersByTime(1)
    expect(splash.classList.contains('splash-hide')).toBe(true)
  })

  it('removes the loading screen from the page after the fade', () => {
    hideSplash({ minVisible: 1000, fade: 300, elapsed: 0 })

    vi.advanceTimersByTime(1000 + 299)
    expect(document.getElementById('splash')).not.toBeNull()

    vi.advanceTimersByTime(1)
    expect(document.getElementById('splash')).toBeNull()
  })

  it('only waits for the time that is left', () => {
    // the page has already been open for 700 ms, so 300 ms are left
    hideSplash({ minVisible: 1000, fade: 300, elapsed: 700 })
    const splash = document.getElementById('splash')

    vi.advanceTimersByTime(299)
    expect(splash.classList.contains('splash-hide')).toBe(false)

    vi.advanceTimersByTime(1)
    expect(splash.classList.contains('splash-hide')).toBe(true)
  })

  it('fades at once when the page took longer than the minimum time', () => {
    hideSplash({ minVisible: 1000, fade: 300, elapsed: 5000 })

    vi.advanceTimersByTime(0)
    expect(document.getElementById('splash').classList.contains('splash-hide')).toBe(true)
  })

  it('does nothing when there is no loading screen', () => {
    document.body.innerHTML = '<div id="root"></div>'
    expect(() => hideSplash({ elapsed: 0 })).not.toThrow()
  })
})

// The page as it is after the first loading screen has finished:
// a copy was saved, and the loading screen itself is gone.
function pageAfterFirstLoad() {
  document.body.innerHTML =
    '<div id="splash"><img src="/logo-sketch.svg"><img src="/logo.webp"></div><div id="root"></div>'
  rememberSplash()
  document.getElementById('splash').remove()
}

const quick = { minVisible: 1000, fade: 300 }

describe('playSplash', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    pageAfterFirstLoad()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('shows the loading screen again', () => {
    expect(playSplash(quick)).toBe(true)
    expect(document.getElementById('splash')).not.toBeNull()
  })

  it('gives the drawn pictures a new address so they are drawn again', () => {
    playSplash(quick)
    const addresses = [...document.querySelectorAll('#splash img')].map((img) => img.getAttribute('src'))
    expect(addresses[0]).toMatch(/^\/logo-sketch\.svg\?play=\d+$/)
    // a normal picture has no animation, so its address stays the same
    expect(addresses[1]).toBe('/logo.webp')
  })

  it('stays for the full time, then fades and is removed', () => {
    playSplash(quick)
    const splash = document.getElementById('splash')

    vi.advanceTimersByTime(999)
    expect(splash.classList.contains('splash-hide')).toBe(false)

    vi.advanceTimersByTime(1)
    expect(splash.classList.contains('splash-hide')).toBe(true)

    vi.advanceTimersByTime(300)
    expect(document.getElementById('splash')).toBeNull()
  })

  it('does not start a second one while one is showing', () => {
    playSplash(quick)
    expect(playSplash(quick)).toBe(false)
    expect(document.querySelectorAll('#splash')).toHaveLength(1)
  })

  it('does nothing when no loading screen was saved', () => {
    document.body.innerHTML = '<div id="root"></div>'
    rememberSplash()
    expect(playSplash(quick)).toBe(false)
    expect(document.getElementById('splash')).toBeNull()
  })
})

describe('playSplashOnLogin', () => {
  // a small stand-in for the Redux store: it holds the user and tells its listeners about changes
  function fakeStore(user) {
    let state = { auth: { user } }
    const listeners = []
    return {
      getState: () => state,
      subscribe: (listener) => listeners.push(listener),
      setUser(next) {
        state = { auth: { user: next } }
        listeners.forEach((listener) => listener())
      },
    }
  }

  beforeEach(() => {
    vi.useFakeTimers()
    pageAfterFirstLoad()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('plays the loading screen when someone logs in', () => {
    const store = fakeStore(null)
    playSplashOnLogin(store, quick)
    expect(document.getElementById('splash')).toBeNull()

    store.setUser({ id: '1', name: 'Kapil' })
    expect(document.getElementById('splash')).not.toBeNull()
  })

  it('does not play when the user only changes their name or photo', () => {
    const store = fakeStore({ id: '1', name: 'Kapil' })
    playSplashOnLogin(store, quick)

    store.setUser({ id: '1', name: 'Kapil Singh', photo: 'data:image/jpeg;base64,abc' })
    expect(document.getElementById('splash')).toBeNull()
  })

  it('does not play on logout, and plays again at the next login', () => {
    const store = fakeStore({ id: '1', name: 'Kapil' })
    playSplashOnLogin(store, quick)

    store.setUser(null)
    expect(document.getElementById('splash')).toBeNull()

    store.setUser({ id: '1', name: 'Kapil' })
    expect(document.getElementById('splash')).not.toBeNull()
  })
})
