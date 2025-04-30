"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryValidations = void 0;
const zod_1 = require("zod");
const createCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, { message: "Category name is required." })
        .max(255, { message: "Category name is too long." })
        .regex(/^[a-zA-Z0-9 ]+$/, {
        message: "Category name can only contain alphanumeric characters and spaces.",
    }),
});
exports.CategoryValidations = {
    createCategorySchema,
};
