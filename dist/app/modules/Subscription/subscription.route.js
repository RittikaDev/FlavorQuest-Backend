"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const subscription_controller_1 = require("./subscription.controller");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.default)(client_1.UserRole.USER), subscription_controller_1.SubscriptionController.createSubscription);
router.post("/verify", (0, auth_1.default)(client_1.UserRole.USER), subscription_controller_1.SubscriptionController.verifySubscription);
exports.SubscriptionRoutes = router;
