import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { hideSplash } from './splash'

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
