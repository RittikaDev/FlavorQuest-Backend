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
  // multerUpload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    // Validate the body directly, no need to use JSON.parse()
    req.body = userValidation.createUserValidation.parse(req.body);
    return usersControllers.createUser(req, res, next);
  }
);

router.get("/", auth(UserRole.ADMIN), usersControllers.getAllUsers);

router.get(
  "/my-profile",
  auth(UserRole.ADMIN, UserRole.USER, UserRole.PREMIUM_USER),
  usersControllers.getMyProfileFromDb
);

router.get("/:userId", usersControllers.getAUsers);

router.put(
  "/update",
  auth(UserRole.ADMIN, UserRole.USER, UserRole.PREMIUM_USER),
  usersControllers.updateAUser
);

router.delete(
  "/delete/:userId",
  auth(UserRole.ADMIN),
  usersControllers.deleteAUserFromDB
);

router.delete(
  "/suspend/:userId",
  auth(UserRole.ADMIN),
  usersControllers.suspendAUser
);

export const UsersRoutes = router;
