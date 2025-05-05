import express, { NextFunction, Request, Response } from "express";

import { CommentController } from "./comment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { CommentValidations } from "./comment.validation";

const router = express.Router();

router.post(
  "/:postId",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = CommentValidations.createCommentSchema.parse(req.body);
    return CommentController.createComment(req, res, next);
  }
);
router.get("/:postId", CommentController.getPostComments);
router.get("/", CommentController.getPostComments);

router.delete(
  "/delete/:commentId",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  CommentController.deleteCommentById
);

export const CommentRoutes = router;
