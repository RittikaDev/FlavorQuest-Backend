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
exports.CommentController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const comment_service_1 = require("./comment.service");
const catchAsync_1 = __importDefault(require("../../../share/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../share/sendResponse"));
const pick_1 = __importDefault(require("../../../share/pick"));
const createComment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const { text } = req.body;
    const { postId } = req.params;
    const result = yield comment_service_1.CommentService.createComment(userEmail, postId, text);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.CREATED,
        message: "Comment Created successfully!",
        data: result,
    });
}));
const getPostComments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const options = (0, pick_1.default)(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = yield comment_service_1.CommentService.getCommentsByPostId(options, postId);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Comment retrieved successfully!",
        data: result,
    });
}));
const deleteCommentById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const commentId = req.params.commentId;
    const result = yield comment_service_1.CommentService.deleteCommentById(commentId, userEmail);
    if (!result)
        return (0, sendResponse_1.default)(res, {
            success: false,
            status: http_status_1.default.NOT_FOUND,
            message: "No comment found with this ID!",
            data: null,
        });
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Comment deleted successfully!",
        data: null,
    });
}));
exports.CommentController = {
    createComment,
    getPostComments,
    deleteCommentById,
};
