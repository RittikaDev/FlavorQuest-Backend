import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";

import auth from "../../middlewares/auth";
import { SubscriptionController } from "./subscription.controller";

const router = express.Router();

router
  .route("/")
  .post(auth(UserRole.USER), SubscriptionController.createSubscription);

router.post(
  "/verify",
  auth(UserRole.USER),
  SubscriptionController.verifySubscription
);

export const SubscriptionRoutes = router;
