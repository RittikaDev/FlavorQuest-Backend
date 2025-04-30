import { z } from "zod";
import { VoteType } from "@prisma/client";

const createVoteSchema = z.object({
	type: z.enum([VoteType.UPVOTE, VoteType.DOWNVOTE]),
});

export const VoteValidation = { createVoteSchema };
