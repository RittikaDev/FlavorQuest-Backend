"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareRoutes = void 0;
const express_1 = __importDefault(require("express"));
const share_controller_1 = require("./share.controller");
const router = express_1.default.Router();
router.post("/", share_controller_1.ShareController.sharePost);
router.get("/user/:userId", share_controller_1.ShareController.getUserShares);
router.get("/group/:groupId", share_controller_1.ShareController.getGroupShares);
exports.ShareRoutes = router;
