import { z } from "zod";

const createPostValidation = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	location: z.string().min(1, "Location is required"),
	minPrice: z.number().min(10, "Price must be a positive number"),
	maxPrice: z.number().min(20, "Price must be a positive number"),
	categoryId: z.string().min(1, "Category is required"),
});
export const PostValidations = {
	createPostValidation,
};
