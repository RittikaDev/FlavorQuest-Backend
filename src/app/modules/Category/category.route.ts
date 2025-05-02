import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";

import { CategoryController } from "./category.controller";
import { CategoryValidations } from "./category.validation";

import validateRequest from "../../middlewares/validateRequests";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = CategoryValidations.createCategorySchema.parse(req.body);
    return CategoryController.createCategory(req, res, next);
  }
);

router.get("/", CategoryController.getCategories);

router.delete(
  "/delete/:catId",
  auth(UserRole.ADMIN),
  CategoryController.deleteCategoryById
);

export const CategoryRoutes = router;
