import { Request, Response } from "express";

import httpStatus from "http-status";

import sendResponse from "../../../share/sendResponse";
import catchAsync from "../../../share/catchAsync";
import { SubscriptionServices } from "./subscription.service";
import { IAuthUser } from "../../interfaces/common";

const createSubscription = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    // console.log(req.user);
    const userEmail = req.user?.email;
    const clientIp = req.ip;

    const checkoutUrl = await SubscriptionServices.createSubscription(
      userEmail!,
      clientIp!
    );

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Subscription initiated successfully",
      data: checkoutUrl,
    });
  }
);

const verifySubscription = catchAsync(async (req: Request, res: Response) => {
  const { sp_order_id } = req.body;

  const verifiedData = await SubscriptionServices.verifyPayment(sp_order_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Payment verification complete",
    data: verifiedData,
  });
});

export const SubscriptionController = {
  createSubscription,
  verifySubscription,
};
