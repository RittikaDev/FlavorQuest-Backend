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
exports.CategoryService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../share/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
// Service to create a new category
const createCategory = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.category.create({
        data: {
            name,
        },
    });
});
// Service to get all categories
const getCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.category.findMany();
});
const deleteCategoryById = (categoryId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    if (userData.role !== client_1.UserRole.ADMIN)
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Only admins can delete categories.");
    // OPTIONAL: CHECK IF THE CATEGORY EXISTS
    const category = yield prisma_1.default.category.findUnique({
        where: { id: categoryId },
    });
    if (!category)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Category not found.");
    // OPTIONAL: CHECK IF ANY POSTS ARE USING THIS CATEGORY BEFORE DELETION
    const hasPosts = yield prisma_1.default.foodPost.findFirst({
        where: { categoryId },
    });
    if (hasPosts)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot delete category with associated posts.");
    // DELETE THE CATEGORY
    yield prisma_1.default.category.delete({
        where: { id: categoryId },
    });
    return { message: "Category deleted successfully." };
});
exports.CategoryService = {
    createCategory,
    getCategories,
    deleteCategoryById,
};
