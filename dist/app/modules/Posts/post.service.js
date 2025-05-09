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
exports.PostService = void 0;
const prisma_1 = __importDefault(require("../../../share/prisma"));
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
// CREATE A POST
const createPost = (user, req) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, location, minPrice, maxPrice, categoryId } = req.body;
    // USER DATA
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    // CHECK IF THE CATEGORYID EXISTS IN THE CATEGORY TABLE
    const categoryExists = yield prisma_1.default.category.findUnique({
        where: { id: categoryId },
    });
    if (!categoryExists)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid category ID");
    // FILE UPLOAD
    const file = req.file;
    let imagetoUpload = "";
    if (file)
        imagetoUpload = file.path;
    const post = yield prisma_1.default.foodPost.create({
        data: {
            title,
            description,
            location,
            minPrice,
            maxPrice,
            image: imagetoUpload,
            categoryId: categoryId,
            userId: userData.id,
        },
        select: {
            id: true,
            title: true,
            location: true,
            minPrice: true,
            maxPrice: true,
            status: true,
            isPremium: true,
            createdAt: true,
        },
    });
    return post;
});
// UPDATE POST
const updatePostByUser = (user, req, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, location, minPrice, maxPrice, categoryId } = req.body;
    // console.log(postId);
    // USER DATA
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    // GET THE EXISTING POST
    const existingPost = yield prisma_1.default.foodPost.findUnique({
        where: { id: postId },
    });
    if (!existingPost)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Post not found!");
    // ENSURE THE LOGGED-IN USER OWNS THE POST
    if (userData.role !== client_1.UserRole.ADMIN && existingPost.userId !== userData.id)
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You cannot update this post");
    //  CHECK IF CATEGORY ID EXISTS IF UPDATED
    if (categoryId) {
        const categoryExists = yield prisma_1.default.category.findUnique({
            where: { id: categoryId },
        });
        if (!categoryExists)
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid category ID");
    }
    // FILE UPLOAD
    const file = req.file;
    let updatedImage = existingPost.image;
    if (file)
        updatedImage = file.path;
    const updatedPost = yield prisma_1.default.foodPost.update({
        where: { id: postId },
        data: {
            title,
            description,
            location,
            minPrice,
            maxPrice,
            image: updatedImage,
            categoryId,
        },
        select: {
            id: true,
            title: true,
            location: true,
            minPrice: true,
            maxPrice: true,
            status: true,
            isPremium: true,
            updatedAt: true,
        },
    });
    return updatedPost;
});
// GET POST BY ID
const getPostById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield prisma_1.default.foodPost.findUnique({
        where: { id },
        include: {
            user: true,
            category: true,
            ratings: {
                include: {
                    user: {
                        select: {
                            name: true,
                            profilePhoto: true,
                        },
                    },
                },
            },
            votes: true,
            comments: {
                include: {
                    user: {
                        select: {
                            name: true,
                            profilePhoto: true,
                        },
                    },
                },
            },
        },
    });
    if (!post)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    // Compute average rating
    const averageRating = post.ratings.reduce((sum, rating) => sum + rating.score, 0) /
        (post.ratings.length || 1);
    // Compute vote counts
    const upvoteCount = post.votes.filter((vote) => vote.type === "UPVOTE").length;
    const downvoteCount = post.votes.filter((vote) => vote.type === "DOWNVOTE").length;
    const totalVoteCount = post.votes.length;
    // Compute comment count
    const commentCount = post.comments.length;
    return Object.assign(Object.assign({}, post), { averageRating,
        upvoteCount,
        downvoteCount,
        totalVoteCount,
        commentCount });
});
// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
const updatePostStatus = (postId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existingPost = yield prisma_1.default.foodPost.findUnique({
        where: { id: postId },
    });
    if (!existingPost)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Post not found!");
    // DETERMINE THE FINAL STATUS TO USE (NEW ONE FROM `DATA`, OR EXISTING)
    const finalStatus = (_a = data.status) !== null && _a !== void 0 ? _a : existingPost.status;
    console.log(finalStatus);
    // IF TRYING TO SET ISPREMIUM TO TRUE, MAKE SURE POST IS APPROVED
    if (data.isPremium && finalStatus !== client_1.PostStatus.APPROVED) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Post must be approved before it can be marked as premium.");
    }
    return prisma_1.default.foodPost.update({
        where: { id: postId },
        data: {
            status: data.status,
            isPremium: data.isPremium,
            adminComment: data.adminComment,
        },
    });
});
const getPosts = (user, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    // console.log(user);
    if (user) {
        // console.log(user);
        const userData = yield prisma_1.default.user.findUnique({
            where: { email: user.email },
        });
        if (!userData)
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
        if (userData.role === client_1.UserRole.ADMIN) {
            // Admins see everything (no extra filters)
        }
        else if (userData.role === client_1.UserRole.PREMIUM_USER)
            andConditions.push({ status: "APPROVED" });
        else if (userData.role === client_1.UserRole.USER) {
            andConditions.push({ status: "APPROVED" });
            andConditions.push({ isPremium: false });
        }
    }
    else {
        // ANONYMOUS USERS: SHOW ONLY PUBLIC, APPROVED, NON-PREMIUM POSTS
        andConditions.push({ status: "APPROVED" });
        andConditions.push({ isPremium: false });
    }
    // console.log(filters.searchTerm);
    // SEARCHTERM FILTER (title or category name)
    if (filters.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: filters.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    category: {
                        is: {
                            name: {
                                contains: filters.searchTerm,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            ],
        });
    }
    // console.log(filters.category);
    // CATEGORY FILTER
    if (filters.category) {
        andConditions.push({
            category: {
                name: {
                    contains: filters.category,
                    mode: "insensitive",
                },
            },
        });
    }
    if (filters.role) {
        andConditions.push({
            user: {
                role: filters.role,
            },
        });
    }
    // console.log(filters);
    if (filters.status &&
        Object.values(client_1.PostStatus).includes(filters.status)) {
        andConditions.push({
            status: filters.status,
        });
    }
    // console.log(filters.minPrice, filters.maxPrice);
    // PRICE RANGE FILTER
    if (filters.minPrice || filters.maxPrice) {
        // Check if minPrice and maxPrice are valid and apply them in the where condition
        andConditions.push({
            AND: [
                filters.minPrice
                    ? { minPrice: { gte: parseFloat(filters.minPrice.toString()) } }
                    : {},
                filters.maxPrice
                    ? { maxPrice: { lte: parseFloat(filters.maxPrice.toString()) } }
                    : {},
            ],
        });
    }
    const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};
    const isSortByRating = sortBy === "rating";
    const isSortByUpvotes = sortBy === "upvotes";
    const isSortByNewest = sortBy === "newest";
    // Get the posts
    const posts = yield prisma_1.default.foodPost.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: {
            user: true,
            category: true,
            ratings: true,
            votes: true,
        },
    });
    // Calculate the average rating and upvotes for each post
    const postsWithRatingAndUpvotes = yield Promise.all(posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
        // Calculate average rating
        const ratings = yield prisma_1.default.rating.findMany({
            where: { postId: post.id },
            select: { score: true },
        });
        const averageRating = ratings.reduce((sum, rating) => sum + rating.score, 0) /
            (ratings.length || 1); // Avoid division by zero
        // Calculate upvotes (assuming VoteType.UPVOTE represents upvotes)
        const upvotesCount = post.votes.filter((vote) => vote.type === "UPVOTE").length;
        return Object.assign(Object.assign({}, post), { averageRating,
            upvotesCount });
    })));
    // Sort the posts based on the sort criteria (rating, upvotes, or newest)
    const sortedPosts = postsWithRatingAndUpvotes.sort((a, b) => {
        if (isSortByRating) {
            return (b.averageRating || 0) - (a.averageRating || 0); // Sort by average rating
        }
        if (isSortByUpvotes) {
            return b.upvotesCount - a.upvotesCount; // Sort by upvotes count
        }
        if (isSortByNewest) {
            // Sort by createdAt to get the most recent post first
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0; // Default sorting if none of the criteria match
    });
    const total = yield prisma_1.default.foodPost.count({
        where: whereCondition,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: sortedPosts,
    };
});
const getUserPosts = (email, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip, sortBy } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const userData = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const andConditions = [{ userId: userData.id }];
    console.log(userData.role);
    if (userData.role == client_1.UserRole.USER)
        andConditions.push({ isPremium: false });
    console.log(userData, andConditions);
    // SEARCHTERM FILTER (title or category name)
    if (filters.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: filters.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    category: {
                        is: {
                            name: {
                                contains: filters.searchTerm,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            ],
        });
    }
    if (filters.category) {
        andConditions.push({
            category: {
                name: {
                    contains: filters.category,
                    mode: "insensitive",
                },
            },
        });
    }
    if (filters.role) {
        andConditions.push({
            user: {
                role: filters.role,
            },
        });
    }
    if (filters.status &&
        Object.values(client_1.PostStatus).includes(filters.status)) {
        andConditions.push({
            status: filters.status,
        });
    }
    // PRICE RANGE FILTER
    if (filters.minPrice || filters.maxPrice) {
        andConditions.push({
            AND: [
                filters.minPrice
                    ? { minPrice: { gte: parseFloat(filters.minPrice.toString()) } }
                    : {},
                filters.maxPrice
                    ? { maxPrice: { lte: parseFloat(filters.maxPrice.toString()) } }
                    : {},
            ],
        });
    }
    const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};
    const isSortByRating = sortBy === "rating";
    const isSortByUpvotes = sortBy === "upvotes";
    const isSortByNewest = sortBy === "newest";
    const posts = yield prisma_1.default.foodPost.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: {
            category: true,
            user: true,
            ratings: true,
            votes: true,
            comments: true,
        },
    });
    // Calculate the average rating and upvotes for each post
    const postsWithRatingAndUpvotes = yield Promise.all(posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
        // Calculate average rating
        const ratings = yield prisma_1.default.rating.findMany({
            where: { postId: post.id },
            select: { score: true },
        });
        const averageRating = ratings.reduce((sum, rating) => sum + rating.score, 0) /
            (ratings.length || 1); // Avoid division by zero
        // Calculate upvotes (assuming VoteType.UPVOTE represents upvotes)
        const upvotesCount = post.votes.filter((vote) => vote.type === "UPVOTE").length;
        return Object.assign(Object.assign({}, post), { averageRating,
            upvotesCount });
    })));
    // Sort the posts based on the sort criteria (rating, upvotes, or newest)
    const sortedPosts = postsWithRatingAndUpvotes.sort((a, b) => {
        if (isSortByRating) {
            return (b.averageRating || 0) - (a.averageRating || 0); // Sort by average rating
        }
        if (isSortByUpvotes) {
            return b.upvotesCount - a.upvotesCount; // Sort by upvotes count
        }
        if (isSortByNewest) {
            // Sort by createdAt to get the most recent post first
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0; // Default sorting if none of the criteria match
    });
    const total = yield prisma_1.default.foodPost.count({
        where: whereCondition,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: sortedPosts,
    };
});
// USER DASHBOARD STATISTICS
const getUserDashboardStats = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: userEmail },
    });
    // console.log(userData);
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    // 1. GET ALL THE USER'S POSTS (ONLY IDS TO REDUCE LOAD)
    const posts = yield prisma_1.default.foodPost.findMany({
        where: { userId: userData.id },
        select: { id: true },
    });
    const postIds = posts.map((post) => post.id);
    if (postIds.length === 0) {
        return {
            totalPosts: 0,
            totalUpvotes: 0,
            totalDownvotes: 0,
            totalRatings: 0,
            averageRating: 0,
        };
    }
    // 2. GET TOTAL UPVOTES AND DOWNVOTES ACROSS THESE POSTS
    const votes = yield prisma_1.default.vote.findMany({
        where: { postId: { in: postIds } },
        select: { type: true },
    });
    const totalUpvotes = votes.filter((v) => v.type === "UPVOTE").length;
    const totalDownvotes = votes.filter((v) => v.type === "DOWNVOTE").length;
    // 3. GET ALL RATINGS ACROSS THESE POSTS
    const ratings = yield prisma_1.default.rating.findMany({
        where: { postId: { in: postIds } },
        select: { score: true },
    });
    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.score, 0) / (totalRatings || 1);
    return {
        totalPosts: postIds.length,
        totalUpvotes,
        totalDownvotes,
        totalRatings,
        averageRating: Number(averageRating.toFixed(2)),
    };
});
const getAdminDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [postCount, userCount, ratingData, commentCount] = yield Promise.all([
        prisma_1.default.foodPost.count(),
        prisma_1.default.user.count(),
        prisma_1.default.rating.aggregate({
            _sum: {
                score: true,
            },
            _avg: {
                score: true,
            },
        }),
        prisma_1.default.comment.count(),
    ]);
    return {
        postCount,
        userCount,
        totalRating: (_a = ratingData._sum.score) !== null && _a !== void 0 ? _a : 0,
        averageRating: (_b = ratingData._avg.score) !== null && _b !== void 0 ? _b : 0,
        commentCount,
    };
});
// DELETE POST
const deletePostById = (postId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield prisma_1.default.foodPost.findUnique({
        where: { id: postId },
    });
    if (!post)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Post not found.");
    const userData = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    if (userData.role !== client_1.UserRole.ADMIN && post.userId !== userData.id)
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized to delete this post.");
    // Run all deletions in a transaction
    yield prisma_1.default.$transaction([
        prisma_1.default.comment.deleteMany({ where: { postId } }),
        prisma_1.default.vote.deleteMany({ where: { postId } }),
        prisma_1.default.rating.deleteMany({ where: { postId } }),
        prisma_1.default.foodPost.delete({ where: { id: postId } }),
    ]);
    return { message: "Post deleted successfully." };
});
exports.PostService = {
    createPost,
    updatePostByUser,
    getPostById,
    updatePostStatus,
    getPosts,
    getUserPosts,
    getUserDashboardStats,
    getAdminDashboardStats,
    deletePostById,
};
