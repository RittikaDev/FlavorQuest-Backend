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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createShare = (senderId, receiverId, groupId, postId, message) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.share.create({
        data: {
            senderId,
            receiverId,
            groupId,
            postId,
            message,
        },
    });
});
const getSharesByUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.share.findMany({
        where: {
            senderId: userId,
            groupId: null,
        },
        include: {
            sender: true,
            post: {
                include: {
                    user: true,
                },
            },
        },
    });
});
const getSharesByGroup = (groupId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.share.findMany({
        where: {
            groupId,
        },
        include: {
            sender: true,
            post: true,
        },
    });
});
exports.ShareService = {
    createShare,
    getSharesByUser,
    getSharesByGroup,
};
