import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  summary: z
    .string()
    .max(500, "Summary must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published"]),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
