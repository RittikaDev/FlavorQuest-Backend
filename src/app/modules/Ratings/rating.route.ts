import express, { NextFunction, Request, Response } from "express";

import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { RatingController } from "./rating.controller";
import { RatingValidations } from "./rating.validation";

const router = express.Router();

router.post(
  "/:postId",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = RatingValidations.createOrUpdateRatingSchema.parse(req.body);
    return RatingController.ratePost(req, res, next);
  }
);
router.get("/:postId", RatingController.getPostRatings);

export const RatingRoutes = router;
