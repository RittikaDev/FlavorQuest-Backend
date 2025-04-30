"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentValidations = void 0;
const zod_1 = require("zod");
const createCommentSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, "Comment cannot be empty"),
});
exports.CommentValidations = {
    createCommentSchema,
};
