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
exports.FriendequestController = exports.removeFriendHandler = void 0;
const friendequest_service_1 = require("./friendequest.service");
const catchAsync_1 = __importDefault(require("../../../share/catchAsync"));
const sendRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId } = req.body;
    const senderId = req.user;
    try {
        const result = yield friendequest_service_1.FriendequestService.sendFriendRequest(senderId, receiverId);
        res.status(201).json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
const getMyRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user;
    const requests = yield friendequest_service_1.FriendequestService.getMyFriendRequests(userId);
    res.json(requests);
}));
const respond = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user;
    const { status } = req.body;
    const { requestId } = req.params;
    console.log("Responding to request", requestId, "with status", status);
    console.log("User ID:", userId);
    try {
        const updated = yield friendequest_service_1.FriendequestService.respondToRequest(requestId, userId, status);
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
const getSuggestions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentUser = req.user;
    if (!currentUser)
        res.status(401).json({ message: "Unauthorized" });
    try {
        const suggestions = yield friendequest_service_1.FriendequestService.getFriendSuggestions(currentUser);
        res.status(200).json({ suggestions });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
const getFriendList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentUser = req.user;
    if (!currentUser)
        res.status(401).json({ message: "Unauthorized" });
    try {
        const friends = yield friendequest_service_1.FriendequestService.getFriendList(currentUser);
        res.status(200).json({ friends });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
exports.removeFriendHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { friendId } = req.params;
    const result = yield friendequest_service_1.FriendequestService.removeFriend(user, friendId);
    res.status(200).json({
        success: true,
        message: result.message,
    });
}));
exports.FriendequestController = {
    sendRequest,
    getMyRequests,
    respond,
    getSuggestions,
    getFriendList,
    removeFriendHandler: exports.removeFriendHandler,
};
