import { z } from 'zod';

export const guestSchema = z.object({
  name: z.string().min(2, 'Guest name must be at least 2 characters.'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val), {
      message: 'Phone number must be exactly 10 digits.',
    }),
  side: z.enum(['Bride', 'Groom']),
});
