"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRoutes = void 0;
const express_1 = __importDefault(require("express"));
const post_controller_1 = require("./post.controller");
const post_validation_1 = require("./post.validation");
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const multer_config_1 = require("../../../config/multer.config");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), multer_config_1.multerUpload.single("file"), (req, res, next) => {
    const data = JSON.parse(req.body.data);
    req.body = post_validation_1.PostValidations.createPostValidation.parse(data);
    return post_controller_1.PostController.createPost(req, res, next);
});
router.patch("/updateByUser/:id", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER), multer_config_1.multerUpload.single("file"), (req, res, next) => {
    const data = JSON.parse(req.body.data);
    req.body = post_validation_1.PostValidations.updatePostValidation.parse(data);
    return post_controller_1.PostController.updatePostByUser(req, res, next);
});
router.patch("/update/:id", (0, auth_1.default)(client_1.UserRole.ADMIN), post_controller_1.PostController.updatePost);
router.get("/postById/:id", post_controller_1.PostController.getPostById);
// router.patch(
//   "/updateByUser",
//   auth(UserRole.USER, UserRole.PREMIUM_USER),
//   PostController.updatePostByUser
// );
router.get("/", post_controller_1.PostController.getPosts);
router.get("/admin-posts", (0, auth_1.default)(client_1.UserRole.ADMIN), post_controller_1.PostController.getAdminPosts);
router.get("/user-posts", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER), post_controller_1.PostController.getUserPosts);
router.get("/user-stats", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER), post_controller_1.PostController.getUserDashboardStats);
router.get("/admin-stats", (0, auth_1.default)(client_1.UserRole.ADMIN), post_controller_1.PostController.getAdminDashboardStats);
router.delete("/delete/:postId", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), post_controller_1.PostController.deletePostById);
exports.PostRoutes = router;
