import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { FriendequestController } from "./friendequest.controller";

const router = Router();

router.post(
  "/request",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  FriendequestController.sendRequest
);
router.get(
  "/requests/me",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  FriendequestController.getMyRequests
);
router.patch(
  "/request/:requestId/respond",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  FriendequestController.respond
);

router.get(
  "/suggestions",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  FriendequestController.getSuggestions
);
router.get(
  "/list",
  auth(UserRole.USER, UserRole.PREMIUM_USER, UserRole.ADMIN),
  FriendequestController.getFriendList
);

router.delete("/:friendId", auth(), FriendequestController.removeFriendHandler);

export const FriendRoutes = router;
