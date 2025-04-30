import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";

import auth from "../../middlewares/auth";

import { usersControllers } from "./user.controller";
import { userValidation } from "./user.validation";
import { fileUploader } from "../../../helpers/fileUploader";
import { multerUpload } from "../../../config/multer.config";

const router = express.Router();

router.post(
	"/register",
	multerUpload.single("file"),
	(req: Request, res: Response, next: NextFunction) => {
		const data = JSON.parse(req.body);
		req.body = userValidation.createUserValidation.parse(data.data);
		return usersControllers.createUser(req, res, next);
	}
);

router.get("/", auth(UserRole.ADMIN), usersControllers.getAllUsers);

router.get(
	"/my-profile",
	auth(UserRole.ADMIN, UserRole.USER, UserRole.PREMIUM_USER),
	usersControllers.getMyProfile
);

router.get("/:userId", usersControllers.getSpecificUser);

router.put(
	"/update",
	auth(UserRole.ADMIN, UserRole.USER, UserRole.PREMIUM_USER),
	multerUpload.single("file"),
	(req: Request, res: Response, next: NextFunction) => {
		req.body = JSON.parse(req.body.data);
		return usersControllers.updateAUser(req, res, next);
	}
);

router.delete(
	"/delete/:userId",
	auth(UserRole.ADMIN),
	usersControllers.deleteAUser
);

router.delete(
	"/block/:userId",
	auth(UserRole.ADMIN),
	usersControllers.blockAUser
);

export const UsersRoutes = router;
