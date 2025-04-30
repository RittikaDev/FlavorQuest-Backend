import { Request, Response } from "express";
import { RatingServices } from "./rating.service";
import catchAsync from "../../../share/catchAsync";
import { IAuthUser } from "../../interfaces/common";
import sendResponse from "../../../share/sendResponse";
import httpStatus from "http-status";

const ratePost = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const userEmail = req.user?.email;

		const { postId } = req.params;
		const { score } = req.body;

		const result = await RatingServices.upsertRating(userEmail!, postId, score);
		sendResponse(res, {
			success: true,
			status: httpStatus.CREATED,
			message: "Ratings Created successfully!",
			data: result,
		});
	}
);

const getPostRatings = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const { postId } = req.params;

		const result = await RatingServices.getRatingsByPostId(postId);
		sendResponse(res, {
			success: true,
			status: httpStatus.OK,
			message: "Ratings retrieved successfully!",
			data: result,
		});
	}
);

export const RatingController = {
	ratePost,
	getPostRatings,
};
