import { describe, it, expect } from 'vitest'
import { getShareOrigin } from './siteUrl'

describe('getShareOrigin', () => {
  it('turns localhost into the local domain name and keeps the port', () => {
    expect(getShareOrigin('http://localhost:5173')).toBe('http://kalyanam.localtest.me:5173')
  })

  it('turns the number address into the local domain name too', () => {
    expect(getShareOrigin('http://127.0.0.1:5173')).toBe('http://kalyanam.localtest.me:5173')
  })

  it('leaves a real website address as it is', () => {
    expect(getShareOrigin('https://kalyanam.vercel.app')).toBe('https://kalyanam.vercel.app')
  })

  it('can use a different local name', () => {
    expect(getShareOrigin('http://localhost:5173', 'invite.lvh.me')).toBe('http://invite.lvh.me:5173')
  })

  it('uses the address of the open page when none is given', () => {
    // the test browser (jsdom) runs on http://localhost:3000
    expect(getShareOrigin()).toBe('http://kalyanam.localtest.me:3000')
  })
})
