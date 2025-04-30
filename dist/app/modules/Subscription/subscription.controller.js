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
exports.SubscriptionController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../../share/sendResponse"));
const catchAsync_1 = __importDefault(require("../../../share/catchAsync"));
const subscription_service_1 = require("./subscription.service");
const createSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // console.log(req.user);
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const clientIp = req.ip;
    const checkoutUrl = yield subscription_service_1.SubscriptionServices.createSubscription(userEmail, clientIp);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Subscription initiated successfully",
        data: checkoutUrl,
    });
}));
const verifySubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sp_order_id } = req.body;
    const verifiedData = yield subscription_service_1.SubscriptionServices.verifyPayment(sp_order_id);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Payment verification complete",
        data: verifiedData,
    });
}));
exports.SubscriptionController = {
    createSubscription,
    verifySubscription,
};
