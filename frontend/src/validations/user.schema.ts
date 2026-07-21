import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPERADMIN", "OWNER", "MARKETING", "API"], {
    message: "Role is required",
  }),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  role: z.enum(["SUPERADMIN", "OWNER", "MARKETING", "API"], {
    message: "Role is required",
  }),
  isActive: z.boolean(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
