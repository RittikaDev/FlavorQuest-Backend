"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRoutes = void 0;
const express_1 = __importDefault(require("express"));
const group_controller_1 = require("./group.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.PREMIUM_USER, client_1.UserRole.USER), group_controller_1.GroupController.createGroup);
router.get("/", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.PREMIUM_USER, client_1.UserRole.USER), group_controller_1.GroupController.getMyGroups);
router.post("/:groupId/members", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.PREMIUM_USER, client_1.UserRole.USER), group_controller_1.GroupController.addMember);
router.delete("/:groupId/members/:userId", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.PREMIUM_USER, client_1.UserRole.USER), group_controller_1.GroupController.removeMember);
router.delete("/:groupId", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.PREMIUM_USER, client_1.UserRole.USER), group_controller_1.GroupController.deleteGroup);
exports.GroupRoutes = router;
