"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const createVoteSchema = zod_1.z.object({
    type: zod_1.z.enum([client_1.VoteType.UPVOTE, client_1.VoteType.DOWNVOTE]),
});
exports.VoteValidation = { createVoteSchema };
