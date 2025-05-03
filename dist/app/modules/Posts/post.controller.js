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
exports.PostController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../share/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../share/sendResponse"));
const post_service_1 = require("./post.service");
const pick_1 = __importDefault(require("../../../share/pick"));
const post_constants_1 = require("./post.constants");
// CREATE A POST
const createPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield post_service_1.PostService.createPost(user, req);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.CREATED,
        message: "Post Created successfully!",
        data: result,
    });
}));
// UPDATE POST BY USER
const updatePostByUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const postId = req.params.id;
    const result = yield post_service_1.PostService.updatePostByUser(user, req, postId);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Post updated successfully!",
        data: result,
    });
}));
// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
const updatePost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const { status, isPremium, adminComment } = req.body;
    // console.log(status);
    const updateData = {};
    if (status)
        updateData.status = status;
    if (adminComment)
        updateData.adminComment = adminComment;
    if (typeof isPremium === "boolean")
        updateData.isPremium = isPremium;
    const result = yield post_service_1.PostService.updatePostStatus(postId, updateData);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Post updated successfully!",
        data: result,
    });
}));
const getPosts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const filters = (0, pick_1.default)(req.query, post_constants_1.postFilterableFields);
    const options = (0, pick_1.default)(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    if (!user)
        throw new Error("User is not authenticated");
    const result = yield post_service_1.PostService.getPosts(user, filters, options);
    const isFiltering = Object.values(filters).some((val) => val !== undefined && val !== "");
    if (result.data.length === 0) {
        if (!isFiltering) {
            // NO FILTERS AND NO DATA → RETURN 404
            return (0, sendResponse_1.default)(res, {
                success: false,
                status: http_status_1.default.NOT_FOUND,
                message: "No posts found!",
                data: null,
            });
        }
        else {
            // FILTERS APPLIED BUT NO MATCH → RETURN 200 WITH EMPTY DATA
            return (0, sendResponse_1.default)(res, {
                success: true,
                status: http_status_1.default.OK,
                message: "No posts found matching your filters.",
                data: {
                    meta: {
                        total: 0,
                        page: options.page || 1,
                        limit: options.limit || 10,
                    },
                    data: [],
                },
            });
        }
    }
    // DATA EXISTS
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Posts retrieved successfully",
        data: result,
    });
}));
const getPostById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const result = yield post_service_1.PostService.getPostById(postId);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Specific post retrieved successfully",
        data: result,
    });
}));
// UPDATE POST BY USER
const getUserPosts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const filters = (0, pick_1.default)(req.query, post_constants_1.postFilterableFields);
    const options = (0, pick_1.default)(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = yield post_service_1.PostService.getUserPosts(userEmail, filters, options);
    const isFiltering = Object.values(filters).some((val) => val !== undefined && val !== "");
    if (result.data.length === 0) {
        if (!isFiltering) {
            // INITIAL LOAD (NO FILTERS/SEARCH APPLIED), RETURN 404
            return (0, sendResponse_1.default)(res, {
                success: false,
                status: http_status_1.default.NOT_FOUND,
                message: "No posts found for this user!",
                data: null,
            });
        }
        else {
            // FILTERS/SEARCH APPLIED, BUT NO MATCHING RESULT FOUND — RETURN SUCCESS WITH EMPTY DATA
            return (0, sendResponse_1.default)(res, {
                success: true,
                status: http_status_1.default.OK,
                message: "No posts found matching your filters.",
                data: {
                    meta: {
                        total: 0,
                        page: options.page || 1,
                        limit: options.limit || 10,
                    },
                    data: [],
                },
            });
        }
    }
    // DATA EXISTS
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Post retrieved successfully!",
        data: result,
    });
}));
const getUserDashboardStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    console.log(req.user);
    const result = yield post_service_1.PostService.getUserDashboardStats(userEmail);
    if (!result)
        return (0, sendResponse_1.default)(res, {
            success: false,
            status: http_status_1.default.NOT_FOUND,
            message: "No status found for this user!",
            data: null,
        });
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "User statistics retrieved successfully!",
        data: result,
    });
}));
const getAdminDashboardStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_1.PostService.getAdminDashboardStats();
    if (!result)
        return (0, sendResponse_1.default)(res, {
            success: false,
            status: http_status_1.default.NOT_FOUND,
            message: "No status found for Admin!",
            data: null,
        });
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Admin statistics retrieved successfully!",
        data: result,
    });
}));
const deletePostById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const postId = req.params.postId;
    const result = yield post_service_1.PostService.deletePostById(postId, userEmail);
    if (!result)
        return (0, sendResponse_1.default)(res, {
            success: false,
            status: http_status_1.default.NOT_FOUND,
            message: "No post found with this ID!",
            data: null,
        });
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Post deleted successfully!",
        data: null,
    });
}));
exports.PostController = {
    createPost,
    updatePostByUser,
    getPostById,
    updatePost,
    getPosts,
    getUserPosts,
    getUserDashboardStats,
    getAdminDashboardStats,
    deletePostById,
};
