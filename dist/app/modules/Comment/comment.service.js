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
exports.CommentService = void 0;
const prisma_1 = __importDefault(require("../../../share/prisma"));
const createComment = (userEmail, postId, text) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: { email: userEmail },
    });
    // console.log("User Data: ", userData);
    // console.log("post Data: ", postId);
    return yield prisma_1.default.comment.create({
        data: {
            text,
            post: { connect: { id: postId } },
            user: { connect: { id: userData.id } },
        },
    });
});
const getCommentsByPostId = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = postId ? { postId } : {}; // IF POSTID IS PROVIDED, FILTER BY IT, OTHERWISE GET ALL
    return yield prisma_1.default.comment.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
});
exports.CommentService = {
    createComment,
    getCommentsByPostId,
};
