import { describe, it, expect, beforeEach } from 'vitest'
import { getTheme, applyTheme } from './theme.js'

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
})
