import { z } from "zod";

const createCommentSchema = z.object({
	text: z.string().min(1, "Comment cannot be empty"),
});

export const CommentValidations = {
	createCommentSchema,
};
