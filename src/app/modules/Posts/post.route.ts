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

router.patch("/update/:id", auth(UserRole.ADMIN), PostController.updatePost);

router.get(
	"/",
	auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
	PostController.getPosts
);

export const PostRoutes = router;
