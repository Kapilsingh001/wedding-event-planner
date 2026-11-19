import { describe, it, expect, beforeEach } from 'vitest';
import { getShortlist, toggleShortlist } from './shortlist';

describe('shortlist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getShortlist returns an empty array when nothing is saved', () => {
    expect(getShortlist()).toEqual([]);
  });

  it('toggleShortlist adds an id', () => {
    const result = toggleShortlist('1');
    expect(result).toEqual(['1']);
    expect(getShortlist()).toEqual(['1']);
  });

  it('calling toggleShortlist again removes the id', () => {
    toggleShortlist('1');
    const result = toggleShortlist('1');
    expect(result).toEqual([]);
    expect(getShortlist()).toEqual([]);
  });
});