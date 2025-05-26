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
exports.ShareController = void 0;
const catchAsync_1 = __importDefault(require("../../../share/catchAsync"));
const share_service_1 = require("./share.service");
const sharePost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId, groupId, postId, message } = req.body;
    console.log(req.body);
    try {
        const result = yield share_service_1.ShareService.createShare(senderId, receiverId, groupId, postId, message);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error sharing post:", error);
        res.status(500).json({ error: "Failed to share post" });
    }
}));
const getUserShares = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    console.log(userId);
    try {
        const shares = yield share_service_1.ShareService.getSharesByUser(userId);
        res.status(200).json(shares);
    }
    catch (error) {
        console.error("Error retrieving user shares:", error);
        res.status(500).json({ error: "Failed to retrieve shares" });
    }
}));
const getGroupShares = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    try {
        const shares = yield share_service_1.ShareService.getSharesByGroup(groupId);
        res.status(200).json(shares);
    }
    catch (error) {
        console.error("Error retrieving group shares:", error);
        res.status(500).json({ error: "Failed to retrieve shares" });
    }
}));
exports.ShareController = {
    sharePost,
    getUserShares,
    getGroupShares,
};
