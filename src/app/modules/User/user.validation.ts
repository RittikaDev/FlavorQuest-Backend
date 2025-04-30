import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";

const createUserValidation = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profilePhoto: z.string().url().optional(),
  contactNumber: z.string().optional(),
  role: z
    .enum([UserRole.ADMIN, UserRole.PREMIUM_USER, UserRole.USER])
    .default(UserRole.USER),
  status: z
    .enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED])
    .default(UserStatus.ACTIVE),
});

export const updateUserValidation = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  profilePhoto: z.string().url().optional(),
  contactNumber: z.string().optional(),
  role: z
    .enum([UserRole.ADMIN, UserRole.PREMIUM_USER, UserRole.USER])
    .optional(),
  status: z
    .enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED])
    .optional(),
  needPasswordChange: z.boolean().optional(),
});

export const userValidation = {
  createUserValidation,
  updateUserValidation,
};
