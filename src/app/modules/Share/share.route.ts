import express from "express";
import { ShareController } from "./share.controller";
const router = express.Router();

router.post("/", ShareController.sharePost);
router.get("/user/:userId", ShareController.getUserShares);
router.get("/group/:groupId", ShareController.getGroupShares);

export const ShareRoutes = router;
