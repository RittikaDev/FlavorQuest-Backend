import { Category } from "@prisma/client";
import prisma from "../../../share/prisma";

// Service to create a new category
const createCategory = async (name: string) => {
	return prisma.category.create({
		data: {
			name,
		},
	});
};

// Service to get all categories
const getCategories = async () => {
	return prisma.category.findMany();
};

export const CategoryService = {
	createCategory,
	getCategories,
};
