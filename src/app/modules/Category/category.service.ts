import { Category, UserRole } from "@prisma/client";
import prisma from "../../../share/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

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

const deleteCategoryById = async (categoryId: string, email: string) => {
  const userData = await prisma.user.findUnique({
    where: { email },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  if (userData.role !== UserRole.ADMIN)
    throw new Error("Only admins can delete categories.");

  // OPTIONAL: CHECK IF THE CATEGORY EXISTS
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) throw new Error("Category not found.");

  // OPTIONAL: CHECK IF ANY POSTS ARE USING THIS CATEGORY BEFORE DELETION
  const hasPosts = await prisma.foodPost.findFirst({
    where: { categoryId },
  });

  if (hasPosts)
    throw new Error("Cannot delete category with associated posts.");

  // DELETE THE CATEGORY
  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: "Category deleted successfully." };
};

export const CategoryService = {
  createCategory,
  getCategories,

  deleteCategoryById,
};
