"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("./comment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const comment_validation_1 = require("./comment.validation");
const router = express_1.default.Router();
router.post("/:postId", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER), (req, res, next) => {
    req.body = comment_validation_1.CommentValidations.createCommentSchema.parse(req.body);
    return comment_controller_1.CommentController.createComment(req, res, next);
});
router.get("/:postId", comment_controller_1.CommentController.getPostComments);
router.get("/", comment_controller_1.CommentController.getPostComments);
router.delete("/delete/:commentId", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), comment_controller_1.CommentController.deleteCommentById);
exports.CommentRoutes = router;
