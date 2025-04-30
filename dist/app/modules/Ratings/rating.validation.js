"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingValidations = void 0;
const zod_1 = require("zod");
const createOrUpdateRatingSchema = zod_1.z.object({
    score: zod_1.z.number().int().min(1).max(5),
});
exports.RatingValidations = {
    createOrUpdateRatingSchema,
};
