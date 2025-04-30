import { z } from "zod";

const createCategorySchema = z.object({
	name: z
		.string()
		.min(1, { message: "Category name is required." })
		.max(255, { message: "Category name is too long." })
		.regex(/^[a-zA-Z0-9 ]+$/, {
			message:
				"Category name can only contain alphanumeric characters and spaces.",
		}),
});

export const CategoryValidations = {
	createCategorySchema,
};
