import { z } from "zod";

const createOrUpdateRatingSchema = z.object({
	score: z.number().int().min(1).max(5),
});

export const RatingValidations = {
	createOrUpdateRatingSchema,
};
