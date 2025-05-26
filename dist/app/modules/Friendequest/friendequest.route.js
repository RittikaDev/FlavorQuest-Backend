"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const friendequest_controller_1 = require("./friendequest.controller");
const router = (0, express_1.Router)();
router.post("/request", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), friendequest_controller_1.FriendequestController.sendRequest);
router.get("/requests/me", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), friendequest_controller_1.FriendequestController.getMyRequests);
router.patch("/request/:requestId/respond", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), friendequest_controller_1.FriendequestController.respond);
router.get("/suggestions", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), friendequest_controller_1.FriendequestController.getSuggestions);
router.get("/list", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), friendequest_controller_1.FriendequestController.getFriendList);
router.delete("/:friendId", (0, auth_1.default)(), friendequest_controller_1.FriendequestController.removeFriendHandler);
exports.FriendRoutes = router;
