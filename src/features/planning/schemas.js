import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  type: z.string().min(1, "Event type is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().trim().min(2, "Venue must be at least 2 characters"),
  budget: z.coerce.number().gt(0, "Budget must be more than 0"),
});

export const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().gt(0, "Amount must be more than 0"),
  date: z.string().min(1, "Date is required"),
});