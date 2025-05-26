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
exports.GroupService = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma = new client_1.PrismaClient();
const createGroup = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const creatorId = userData.id;
    console.log(payload);
    // Ensure the creator is included in the group members
    const allMemberIds = Array.from(new Set([...payload.memberIds, creatorId]));
    console.log("Creating group with members:", allMemberIds);
    const group = yield prisma.group.create({
        data: {
            name: payload.name,
            owner: {
                connect: { id: creatorId },
            },
            members: {
                create: allMemberIds.map((id) => ({
                    user: {
                        connect: { id },
                    },
                })),
            },
        },
        include: {
            members: { include: { user: true } },
        },
    });
    return group;
});
const getUserGroups = (user) => __awaiter(void 0, void 0, void 0, function* () {
    // USER DATA
    const userData = yield prisma.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const userId = userData.id;
    return yield prisma.group.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        include: {
            members: {
                include: { user: true },
            },
        },
    });
});
const addMemberToGroup = (groupId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the user is already a member of the group
    const existingMember = yield prisma.groupMember.findFirst({
        where: {
            groupId,
            userId,
        },
    });
    if (existingMember) {
        return {
            success: false,
            message: "User is already a member of the group.",
        };
    }
    // Add new member to the group
    const newMember = yield prisma.groupMember.create({
        data: {
            groupId,
            userId,
        },
    });
    return {
        success: true,
        message: "Member added successfully.",
        data: newMember,
    };
});
const removeMemberFromGroup = (groupId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.groupMember.deleteMany({
        where: {
            groupId,
            userId,
        },
    });
});
const deleteGroup = (groupId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.groupMember.deleteMany({ where: { groupId } });
    return yield prisma.group.delete({ where: { id: groupId } });
});
exports.GroupService = {
    createGroup,
    getUserGroups,
    addMemberToGroup,
    removeMemberFromGroup,
    deleteGroup,
};
