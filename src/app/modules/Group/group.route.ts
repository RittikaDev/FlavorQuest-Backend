import express from "express";
import { GroupController } from "./group.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
	"/",
	auth(UserRole.ADMIN, UserRole.PREMIUM_USER, UserRole.USER),
	GroupController.createGroup
);
router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.PREMIUM_USER, UserRole.USER),
	GroupController.getMyGroups
);
router.post(
	"/:groupId/members",
	auth(UserRole.ADMIN, UserRole.PREMIUM_USER, UserRole.USER),
	GroupController.addMember
);
router.delete(
	"/:groupId/members/:userId",
	auth(UserRole.ADMIN, UserRole.PREMIUM_USER, UserRole.USER),
	GroupController.removeMember
);
router.delete(
	"/:groupId",
	auth(UserRole.ADMIN, UserRole.PREMIUM_USER, UserRole.USER),
	GroupController.deleteGroup
);

export const GroupRoutes = router;
