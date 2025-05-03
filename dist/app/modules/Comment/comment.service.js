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
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../share/prisma"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
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
const getCommentsByPostId = (options, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = postId ? { postId } : {}; // IF POSTID IS PROVIDED, FILTER BY IT, OTHERWISE GET ALL
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const [comments, total] = yield Promise.all([
        prisma_1.default.comment.findMany({
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
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip,
            take: limit,
        }),
        prisma_1.default.comment.count({ where: whereClause }),
    ]);
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: comments,
    };
});
const deleteCommentById = (commentId, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!commentId)
        throw new Error("Comment ID is required.");
    // GET THE USER TRYING TO DELETE THE COMMENT
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: { email },
    });
    // FIND THE COMMENT
    const comment = yield prisma_1.default.comment.findUnique({
        where: { id: commentId },
    });
    if (!comment)
        throw new Error("Comment not found.");
    // IF NOT ADMIN, ONLY ALLOW THE COMMENT OWNER TO DELETE
    if (userData.role !== client_1.UserRole.ADMIN && comment.userId !== userData.id)
        throw new Error("You are not authorized to delete this comment.");
    // DELETE THE COMMENT
    yield prisma_1.default.comment.delete({
        where: { id: commentId },
    });
    return { message: "Comment deleted successfully." };
});
exports.CommentService = {
    createComment,
    getCommentsByPostId,
    deleteCommentById,
};
