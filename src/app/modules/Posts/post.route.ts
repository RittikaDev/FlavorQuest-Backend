import express, { NextFunction, Request, Response } from "express";
import { PostController } from "./post.controller";
import { PostValidations } from "./post.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { multerUpload } from "../../../config/multer.config";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.PREMIUM_USER),
  multerUpload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    const data = JSON.parse(req.body.data);
    req.body = PostValidations.createPostValidation.parse(data);
    return PostController.createPost(req, res, next);
  }
);
router.patch(
  "/updateByUser/:id",
  auth(UserRole.USER, UserRole.PREMIUM_USER),
  multerUpload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    const data = JSON.parse(req.body.data);
    req.body = PostValidations.updatePostValidation.parse(data);
    return PostController.updatePostByUser(req, res, next);
  }
);

router.patch("/update/:id", auth(UserRole.ADMIN), PostController.updatePost);
router.get("/postById/:id", PostController.getPostById);
// router.patch(
//   "/updateByUser",
//   auth(UserRole.USER, UserRole.PREMIUM_USER),
//   PostController.updatePostByUser
// );

router.get(
  "/",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  PostController.getPosts
);
router.get(
  "/user-posts",
  auth(UserRole.USER, UserRole.PREMIUM_USER),
  PostController.getUserPosts
);

router.get(
  "/user-stats",
  auth(UserRole.USER, UserRole.PREMIUM_USER),
  PostController.getUserDashboardStats
);
router.get(
  "/admin-stats",
  auth(UserRole.ADMIN),
  PostController.getAdminDashboardStats
);

export const PostRoutes = router;
