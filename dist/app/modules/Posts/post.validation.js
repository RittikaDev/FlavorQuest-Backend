"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidations = void 0;
const zod_1 = require("zod");
const createPostValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    location: zod_1.z.string().min(1, "Location is required"),
    minPrice: zod_1.z.number().min(10, "Price must be a positive number"),
    maxPrice: zod_1.z.number().min(20, "Price must be a positive number"),
    categoryId: zod_1.z.string().min(1, "Category is required"),
});
exports.PostValidations = {
    createPostValidation,
};
