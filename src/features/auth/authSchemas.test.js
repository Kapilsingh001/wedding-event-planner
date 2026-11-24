import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './authSchemas';

describe('authSchemas validation', () => {
  it('loginSchema fails for "abc" as email, passes for a correct login', () => {
    const invalidResult = loginSchema.safeParse({ email: 'abc', password: 'password123' });
    expect(invalidResult.success).toBe(false);

    const validResult = loginSchema.safeParse({ email: 'user@example.com', password: 'password123' });
    expect(validResult.success).toBe(true);
  });

  it('registerSchema fails when confirm differs from password and when the password has 5 characters; passes for correct data', () => {
    // Fails when confirm differs from password
    const mismatchResult = registerSchema.safeParse({
      name: 'Kanishk',
      email: 'user@example.com',
      password: 'password123',
      confirm: 'different123',
    });
    expect(mismatchResult.success).toBe(false);

    // Fails when password has 5 characters
    const shortPasswordResult = registerSchema.safeParse({
      name: 'Kanishk',
      email: 'user@example.com',
      password: '12345',
      confirm: '12345',
    });
    expect(shortPasswordResult.success).toBe(false);

    // Passes for correct data
    const validResult = registerSchema.safeParse({
      name: 'Kanishk',
      email: 'user@example.com',
      password: 'password123',
      confirm: 'password123',
    });
    expect(validResult.success).toBe(true);
  });
});
