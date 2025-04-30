import express, { NextFunction, Request, Response } from "express";

import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

import { VoteController } from "./vote.controller";
import { VoteValidation } from "./vote.validation";

const router = express.Router();

router.post(
	"/:postId",
	auth(UserRole.USER, UserRole.PREMIUM_USER),
	(req: Request, res: Response, next: NextFunction) => {
		req.body = VoteValidation.createVoteSchema.parse(req.body);
		return VoteController.vote(req, res, next);
	}
);
router.delete(
	"/:postId",
	auth(UserRole.USER, UserRole.PREMIUM_USER),
	VoteController.unvote
);

export const VoteRoutes = router;
