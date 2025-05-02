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
// CREATE A POST
const createPost = (user, req) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, location, minPrice, maxPrice, categoryId } = req.body;
    // USER DATA
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    // CHECK IF THE CATEGORYID EXISTS IN THE CATEGORY TABLE
    const categoryExists = yield prisma_1.default.category.findUnique({
        where: { id: categoryId },
    });
    if (!categoryExists)
        throw new Error("Invalid category ID");
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
    console.log(postId);
    // USER DATA
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    // GET THE EXISTING POST
    const existingPost = yield prisma_1.default.foodPost.findUniqueOrThrow({
        where: { id: postId },
    });
    // ENSURE THE LOGGED-IN USER OWNS THE POST
    if (existingPost.userId !== userData.id)
        throw new Error("Unauthorized: You cannot update this post");
    //  CHECK IF CATEGORY ID EXISTS IF UPDATED
    if (categoryId) {
        const categoryExists = yield prisma_1.default.category.findUnique({
            where: { id: categoryId },
        });
        if (!categoryExists)
            throw new Error("Invalid category ID");
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
            ratings: true,
            votes: true,
        },
    });
    if (!post)
        throw new Error("Post not found");
    return post;
});
// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
const updatePostStatus = (postId, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.isPremium && data.status !== client_1.PostStatus.APPROVED)
        throw new Error("Post must be approved before it can be marked as premium.");
    return prisma_1.default.foodPost.update({
        where: { id: postId },
        data: Object.assign(Object.assign({}, data), { status: data.status, adminComment: data.adminComment, isPremium: data.isPremium }),
    });
});
const getPosts = (user, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: { email: user === null || user === void 0 ? void 0 : user.email },
    });
    // ONLY APPLY STATUS FILTER IF NOT ADMIN
    if ((userData === null || userData === void 0 ? void 0 : userData.role) !== client_1.UserRole.ADMIN) {
        andConditions.push({ status: "APPROVED" });
        // FILTER OUT PREMIUM POSTS IF USER IS NOT PREMIUM
        if ((userData === null || userData === void 0 ? void 0 : userData.role) !== client_1.UserRole.PREMIUM_USER) {
            andConditions.push({ isPremium: false });
        }
    }
    console.log(filters.searchTerm);
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
    // PRICE RANGE FILTER
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
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: { email },
    });
    const andConditions = [{ userId: userData.id }];
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
    const whereCondition = {
        AND: andConditions,
    };
    const posts = yield prisma_1.default.foodPost.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            category: true,
            user: true,
        },
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
        data: posts,
    };
});
// USER DASHBOARD STATISTICS
const getUserDashboardStats = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: { email: userEmail },
    });
    console.log(userData);
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
exports.PostService = {
    createPost,
    updatePostByUser,
    getPostById,
    updatePostStatus,
    getPosts,
    getUserPosts,
    getUserDashboardStats,
    getAdminDashboardStats,
};
