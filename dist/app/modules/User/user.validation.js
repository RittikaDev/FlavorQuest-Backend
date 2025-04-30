"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = exports.updateUserValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const createUserValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    profilePhoto: zod_1.z.string().url().optional(),
    contactNumber: zod_1.z.string().optional(),
    role: zod_1.z
        .enum([client_1.UserRole.ADMIN, client_1.UserRole.PREMIUM_USER, client_1.UserRole.USER])
        .default(client_1.UserRole.USER),
    status: zod_1.z
        .enum([client_1.UserStatus.ACTIVE, client_1.UserStatus.BLOCKED, client_1.UserStatus.DELETED])
        .default(client_1.UserStatus.ACTIVE),
});
exports.updateUserValidation = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6).optional(),
    profilePhoto: zod_1.z.string().url().optional(),
    contactNumber: zod_1.z.string().optional(),
    role: zod_1.z
        .enum([client_1.UserRole.ADMIN, client_1.UserRole.PREMIUM_USER, client_1.UserRole.USER])
        .optional(),
    status: zod_1.z
        .enum([client_1.UserStatus.ACTIVE, client_1.UserStatus.BLOCKED, client_1.UserStatus.DELETED])
        .optional(),
    needPasswordChange: zod_1.z.boolean().optional(),
});
exports.userValidation = {
    createUserValidation,
    updateUserValidation: exports.updateUserValidation,
};
