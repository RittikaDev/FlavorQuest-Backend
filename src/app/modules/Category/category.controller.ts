import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import httpStatus from "http-status";
import catchAsync from "../../../share/catchAsync";
import sendResponse from "../../../share/sendResponse";
import { IAuthUser } from "../../interfaces/common";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;

  // console.log(name);

  try {
    const category = await CategoryService.createCategory(name);
    return sendResponse(res, {
      success: true,
      status: httpStatus.CREATED,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Something went wrong",
    });
  }
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getCategories();
    return sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Something went wrong",
    });
  }
});

const deleteCategoryById = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userEmail = req.user?.email;
    const catId = req.params.id;

    const result = await CategoryService.deleteCategoryById(catId, userEmail!);
    if (!result)
      return sendResponse(res, {
        success: false,
        status: httpStatus.NOT_FOUND,
        message: "No post found with this ID!",
        data: null,
      });

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Post deleted successfully!",
      data: null,
    });
  }
);

export const CategoryController = {
  createCategory,
  getCategories,
  deleteCategoryById,
};
