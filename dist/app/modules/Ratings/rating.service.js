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
exports.RatingServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../share/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const upsertRating = (userEmail, postId, score) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: userEmail },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    return yield prisma_1.default.rating.upsert({
        where: {
            userId_postId: {
                userId: userData.id,
                postId,
            },
        },
        update: { score },
        create: {
            userId: userData.id,
            postId,
            score,
        },
        include: {
            post: true,
            user: true,
        },
    });
});
const getRatingsByPostId = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.rating.findMany({
        where: { postId },
        include: {
            post: true,
            user: true,
        },
    });
});
exports.RatingServices = {
    upsertRating,
    getRatingsByPostId,
};
