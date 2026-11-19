import { describe, it, expect } from 'vitest';
import authReducer, { loginSuccess, logoutSuccess } from './authSlice';

describe('authSlice reducer', () => {
  it('loginSuccess puts the user in state', () => {
    const initialState = { user: null };
    const mockUser = { id: '1', name: 'Kanishk', email: 'kanishk@example.com' };
    const state = authReducer(initialState, loginSuccess(mockUser));
    expect(state.user).toEqual(mockUser);
  });

  it('logoutSuccess sets it to null', () => {
    const initialState = { user: { id: '1', name: 'Kanishk' } };
    const state = authReducer(initialState, logoutSuccess());
    expect(state.user).toBeNull();
  });
});
