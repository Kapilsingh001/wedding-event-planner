import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  type: z.string().min(1, "Event type is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().trim().min(2, "Please select a venue"),
  budget: z.coerce.number().gt(0, "Budget must be more than 0"),
});

export const expenseSchema = z
  .object({
    category: z.string().min(1, "Category is required"),
    amount: z.coerce.number().gt(0, "Amount must be more than 0"),
    date: z.string().min(1, "Date is required"),
    status: z.enum(["Paid", "Pending"]).default("Paid"),
    dueDate: z.string().optional(),
  })
  .refine((data) => data.status !== "Pending" || Boolean(data.dueDate), {
    message: "Choose a due date for a pending payment",
    path: ["dueDate"],
  });