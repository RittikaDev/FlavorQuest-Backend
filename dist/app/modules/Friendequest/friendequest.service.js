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
exports.FriendequestService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../share/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const sendFriendRequest = (user, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    let senderId = userData.id;
    if (senderId === receiverId)
        throw new Error("Cannot send request to yourself");
    const existing = yield prisma_1.default.friendRequest.findUnique({
        where: {
            senderId_receiverId: { senderId, receiverId },
        },
    });
    if (existing)
        throw new Error("Request already sent");
    return prisma_1.default.friendRequest.create({
        data: { senderId, receiverId },
    });
});
const getMyFriendRequests = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const userId = userData.id;
    const incoming = yield prisma_1.default.friendRequest.findMany({
        where: { receiverId: userId, status: "PENDING" },
        include: { sender: true },
    });
    const outgoing = yield prisma_1.default.friendRequest.findMany({
        where: { senderId: userId, status: "PENDING" },
        include: { receiver: true },
    });
    return { incoming, outgoing };
});
const respondToRequest = (requestId, user, action) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const userId = userData.id;
    const request = yield prisma_1.default.friendRequest.findUnique({
        where: { id: requestId },
    });
    console.log(request);
    if (!request)
        throw new Error("Request not found");
    if (request.receiverId !== userId)
        throw new Error("Not authorized");
    return prisma_1.default.friendRequest.update({
        where: { id: requestId },
        data: { status: action },
    });
});
const getFriendSuggestions = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const userId = userData.id;
    const allUsers = yield prisma_1.default.user.findMany({
        where: {
            id: {
                not: userId,
            },
            status: "ACTIVE",
        },
        select: {
            id: true,
            name: true,
            // other fields if needed
        },
    });
    const friendRequests = yield prisma_1.default.friendRequest.findMany({
        where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
        },
    });
    const requestMap = new Map();
    friendRequests.forEach((req) => {
        const otherUserId = req.senderId === userId ? req.receiverId : req.senderId;
        const isSender = req.senderId === userId;
        requestMap.set(otherUserId, {
            status: req.status,
            isSender,
        });
    });
    const suggestions = allUsers
        .filter((user) => {
        const relation = requestMap.get(user.id);
        return !relation || relation.status !== "ACCEPTED";
    })
        .map((user) => {
        var _a;
        const relation = requestMap.get(user.id);
        return {
            id: user.id,
            name: user.name,
            friendRequestStatus: (relation === null || relation === void 0 ? void 0 : relation.status) || null,
            isSender: (_a = relation === null || relation === void 0 ? void 0 : relation.isSender) !== null && _a !== void 0 ? _a : false,
        };
    });
    return suggestions;
});
const getFriendList = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const userId = userData.id;
    // FIND ALL ACCEPTED FRIEND REQUESTS WHERE USER IS SENDER OR RECEIVER
    const acceptedFriendRequests = yield prisma_1.default.friendRequest.findMany({
        where: {
            status: "ACCEPTED",
            OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
            sender: {
                select: { id: true, name: true, email: true, profilePhoto: true },
            },
            receiver: {
                select: { id: true, name: true, email: true, profilePhoto: true },
            },
        },
    });
    // MAP TO LIST OF FRIENDS (THE OTHER USER IN EACH REQUEST)
    const friends = acceptedFriendRequests.map((fr) => {
        // IF CURRENT USER IS SENDER, FRIEND IS RECEIVER, ELSE FRIEND IS SENDER
        return fr.senderId === userId ? fr.receiver : fr.sender;
    });
    return friends;
});
const removeFriend = (user, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const userId = userData.id;
    const existingRequest = yield prisma_1.default.friendRequest.findFirst({
        where: {
            status: "ACCEPTED",
            OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId },
            ],
        },
    });
    if (!existingRequest)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Friend relationship not found");
    yield prisma_1.default.friendRequest.delete({
        where: { id: existingRequest.id },
    });
    return { message: "Friend removed successfully" };
});
exports.FriendequestService = {
    sendFriendRequest,
    getMyFriendRequests,
    respondToRequest,
    getFriendSuggestions,
    getFriendList,
    removeFriend,
};
