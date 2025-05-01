import httpStatus from "http-status";
import prisma from "../../../share/prisma";
import ApiError from "../../errors/ApiError";
import { subscriptionUtils } from "./subscription.utils";
import { UserRole } from "@prisma/client";

const createSubscription = async (userEmail: string, clientIp: string) => {
  const userDetails = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!userDetails) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const amount = 500; // PREMIUM SUBSCRIPTION PRICE


  const subscription = await prisma.subscription.create({
    data: {
      userId: userDetails.id,
      status: "PENDING",
      transactionId: "",
      expiryDate: null,
    },
  });

  console.log(subscription.id);

  const shurjopayPayload = {
    amount: amount,
    order_id: subscription.id,
    currency: "BDT",
    customer_name: userDetails.name,
    customer_address: "N/A",
    customer_email: userDetails.email,
    customer_phone: userDetails.contactNumber || "N/A",
    customer_city: "N/A",
    client_ip: clientIp,
  };

  const payment = await subscriptionUtils.makePaymentAsync(shurjopayPayload);
  console.log(payment);

  if (!payment?.checkout_url)
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment failed to initiate");

  if (payment.sp_order_id) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        transactionId: payment.sp_order_id,
        status: "PENDING",
      },
    });
  }

  return payment.checkout_url;
};

const verifyPayment = async (orderId: string) => {
  const verifiedPayment = await subscriptionUtils.verifyPaymentAsync(orderId);
  console.log(verifiedPayment);

  if (!verifiedPayment?.length)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Payment not found or not verified"
    );

  const payment = verifiedPayment[0];
  console.log(payment);

  const result = await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { transactionId: orderId },
      data: {
        // spCode: payment.sp_code,
        // spMessage: payment.sp_message,
        // method: payment.method,
        // dateTime: new Date(payment.date_time),
        status:
          payment.bank_status === "Success"
            ? "ACTIVE"
            : payment.bank_status === "Failed"
            ? "PENDING"
            : payment.bank_status === "Cancel"
            ? "CANCELLED"
            : "EXPIRED",
        expiryDate:
          payment.bank_status === "Success"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
            : null,
      },
    });

    if (payment.bank_status === "Success") {
      const sub = await tx.subscription.findFirst({
        where: { transactionId: orderId },
      });

      if (!sub) throw new Error("Subscription not found during transaction");

      await tx.user.update({
        where: { id: sub.userId },
        data: { role: UserRole.PREMIUM_USER },
      });
    }
  });

  // await prisma.subscription.updateMany({
  //   where: { transactionId: orderId },
  //   data: {
  //     // spCode: payment.sp_code,
  //     // spMessage: payment.sp_message,
  //     // method: payment.method,
  //     // dateTime: new Date(payment.date_time),
  //     status:
  //       payment.bank_status === "Success"
  //         ? "ACTIVE"
  //         : payment.bank_status === "Failed"
  //         ? "PENDING"
  //         : payment.bank_status === "Cancel"
  //         ? "CANCELLED"
  //         : "EXPIRED",
  //     expiryDate:
  //       payment.bank_status === "Success"
  //         ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
  //         : null,
  //   },
  // });

  // if (payment.bank_status === "Success") {
  //   await prisma.user.update({
  //     where: { id: subscription.userId },
  //     data: { isPremium: true },
  //   });
  // }

  return payment;
};

export const SubscriptionServices = {
  createSubscription,
  verifyPayment,
};
