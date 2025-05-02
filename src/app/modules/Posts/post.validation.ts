import { z } from "zod";

const createPostValidation = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  minPrice: z.number().min(10, "Price must be a positive number"),
  maxPrice: z.number().min(20, "Price must be a positive number"),
  categoryId: z.string().min(1, "Category is required"),
});
const updatePostValidation = z.object({
  id: z.string().min(1, "Id is required").optional(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  location: z.string().min(1, "Location is required").optional(),
  minPrice: z.number().min(10, "Price must be a positive number").optional(),
  maxPrice: z.number().min(20, "Price must be a positive number").optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
});
export const PostValidations = {
  createPostValidation,
  updatePostValidation,
};
