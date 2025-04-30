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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteServices = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const upsertVote = (userEmail, postId, type) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });
    yield prisma.foodPost.findUniqueOrThrow({
        where: { id: postId },
    });
    const existingVote = yield prisma.vote.findFirst({
        where: { userId: userData.id, postId },
    });
    if (existingVote) {
        if (existingVote.type === type)
            return existingVote;
        else {
            return yield prisma.vote.update({
                where: { id: existingVote.id },
                data: { type },
                include: {
                    user: { select: { id: true, email: true } },
                    post: true,
                },
            });
        }
    }
    else
        return yield prisma.vote.create({
            data: { userId: userData.id, postId, type },
            include: {
                user: { select: { id: true, email: true } },
                post: true,
            },
        });
});
const removeVote = (userEmail, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });
    yield prisma.foodPost.findUniqueOrThrow({
        where: { id: postId },
    });
    return yield prisma.vote.deleteMany({
        where: { userId: userData.id, postId },
    });
});
// const getVoteCounts = async (postId: string) => {
// 	const [upvotes, downvotes] = await Promise.all([
// 		prisma.vote.count({ where: { postId, type: VoteType.UPVOTE } }),
// 		prisma.vote.count({ where: { postId, type: VoteType.DOWNVOTE } }),
// 	]);
// 	return { upvotes, downvotes };
// };
exports.VoteServices = {
    upsertVote,
    removeVote,
    // getVoteCounts,
};
