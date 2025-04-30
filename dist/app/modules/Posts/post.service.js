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
// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
const updatePostStatus = (postId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.foodPost.update({
        where: { id: postId },
        data: Object.assign(Object.assign({}, data), { status: data.status, adminComment: data.adminComment, isPremium: data.isPremium }),
    });
});
const getPosts = (user, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    // ONLY APPROVED POSTS
    andConditions.push({ status: "APPROVED" });
    // IF USER IS NOT PREMIUM, HIDE PREMIUM POSTS
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    if ((userData === null || userData === void 0 ? void 0 : userData.role) !== client_1.UserRole.PREMIUM_USER)
        andConditions.push({ isPremium: false });
    // FILTER BY TITLE (CASE-INSENSITIVE, PARTIAL MATCH)
    if (filters.title) {
        andConditions.push({
            title: {
                contains: filters.title,
                mode: "insensitive",
            },
        });
    }
    // FILTER BY CATEGORY
    if (filters.category) {
        // FIND THE CATEGORYID BASED ON THE CATEGORY NAME
        const category = yield prisma_1.default.category.findUnique({
            where: {
                name: filters.category,
            },
        });
        if (category) {
            andConditions.push({
                categoryId: category.id,
            });
        }
    }
    // FILTER BY PRICE RANGE
    if (filters.minPrice || filters.maxPrice) {
        const priceRangeCondition = {
            OR: [
                {
                    minPrice: {
                        gte: Number(filters.minPrice) || undefined,
                        lte: Number(filters.maxPrice) || undefined,
                    },
                },
                {
                    maxPrice: {
                        gte: Number(filters.minPrice) || undefined,
                        lte: Number(filters.maxPrice) || undefined,
                    },
                },
            ],
        };
        andConditions.push(priceRangeCondition);
    }
    const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};
    const posts = yield prisma_1.default.foodPost.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
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
exports.PostService = {
    createPost,
    updatePostStatus,
    getPosts,
};
