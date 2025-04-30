"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../share/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const subscription_utils_1 = require("./subscription.utils");
const client_1 = require("@prisma/client");
const createSubscription = (userEmail, clientIp) => __awaiter(void 0, void 0, void 0, function* () {
    const userDetails = yield prisma_1.default.user.findUnique({
        where: { email: userEmail },
    });
    if (!userDetails)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    const amount = 500; // PREMIUM SUBSCRIPTION PRICE
    //  PENDING SUBSCRIPTION IN DB
    const subscription = yield prisma_1.default.subscription.create({
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
    const payment = yield subscription_utils_1.subscriptionUtils.makePaymentAsync(shurjopayPayload);
    console.log(payment);
    if (!(payment === null || payment === void 0 ? void 0 : payment.checkout_url))
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Payment failed to initiate");
    if (payment.sp_order_id) {
        yield prisma_1.default.subscription.update({
            where: { id: subscription.id },
            data: {
                transactionId: payment.sp_order_id,
                status: "PENDING",
            },
        });
    }
    return payment.checkout_url;
});
const verifyPayment = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedPayment = yield subscription_utils_1.subscriptionUtils.verifyPaymentAsync(orderId);
    console.log(verifiedPayment);
    if (!(verifiedPayment === null || verifiedPayment === void 0 ? void 0 : verifiedPayment.length))
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Payment not found or not verified");
    const payment = verifiedPayment[0];
    console.log(payment);
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.subscription.updateMany({
            where: { transactionId: orderId },
            data: {
                // spCode: payment.sp_code,
                // spMessage: payment.sp_message,
                // method: payment.method,
                // dateTime: new Date(payment.date_time),
                status: payment.bank_status === "Success"
                    ? "ACTIVE"
                    : payment.bank_status === "Failed"
                        ? "PENDING"
                        : payment.bank_status === "Cancel"
                            ? "CANCELLED"
                            : "EXPIRED",
                expiryDate: payment.bank_status === "Success"
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
                    : null,
            },
        });
        if (payment.bank_status === "Success") {
            const sub = yield tx.subscription.findFirst({
                where: { transactionId: orderId },
            });
            if (!sub)
                throw new Error("Subscription not found during transaction");
            yield tx.user.update({
                where: { id: sub.userId },
                data: { role: client_1.UserRole.PREMIUM_USER },
            });
        }
    }));
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
});
exports.SubscriptionServices = {
    createSubscription,
    verifyPayment,
};
