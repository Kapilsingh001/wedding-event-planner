import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTheme, applyTheme, THEME_FADE_MS } from './theme.js'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    // jsdom has no matchMedia, so we give it a simple light-mode version
    window.matchMedia = () => ({ matches: false })
  })

  it('uses light when nothing is saved', () => {
    expect(getTheme()).toBe('light')
  })

  it('saves and applies the dark theme', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(getTheme()).toBe('dark')
  })

  it('fades the colours for a moment when the theme changes', () => {
    vi.useFakeTimers()
    const root = document.documentElement
    applyTheme('light')
    root.classList.remove('theme-switching')

    applyTheme('dark')
    expect(root.classList.contains('theme-switching')).toBe(true)

    vi.advanceTimersByTime(THEME_FADE_MS)
    expect(root.classList.contains('theme-switching')).toBe(false)
    vi.useRealTimers()
  })

  it('does not fade when the same theme is applied again', () => {
    const root = document.documentElement
    applyTheme('dark')
    root.classList.remove('theme-switching')

    applyTheme('dark')
    expect(root.classList.contains('theme-switching')).toBe(false)
  })
})
