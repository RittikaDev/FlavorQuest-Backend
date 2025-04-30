import { Request, Response } from "express";
import catchAsync from "../../../share/catchAsync";
import { IAuthUser } from "../../interfaces/common";
import { VoteServices } from "./vote.service";
import httpStatus from "http-status";
import sendResponse from "../../../share/sendResponse";

const vote = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const { postId } = req.params;

		const userEmail = req.user?.email;
		const { type } = req.body;

		const result = await VoteServices.upsertVote(userEmail!, postId, type);
		sendResponse(res, {
			success: true,
			status: httpStatus.OK,
			message: "Voted successfully!",
			data: result,
		});
	}
);

const unvote = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const userEmail = req.user?.email;
		console.log(userEmail);
		const { postId } = req.params;

		const result = await VoteServices.removeVote(userEmail!, postId);
		sendResponse(res, {
			success: true,
			status: httpStatus.OK,
			message: "Vote Removed!",
			data: result,
		});
	}
);

// const getCounts = catchAsync(
// async (req: Request & { user?: IAuthUser }, res: Response) => {
// 	const { postId } = req.params;

// 	try {
// 		const counts = await voteService.getVoteCounts(postId);
// 		res.status(200).json(counts);
// 	} catch (err) {
// 		res.status(500).json({ error: "Failed to fetch vote counts" });
// 	}
// });

export const VoteController = {
	vote,
	unvote,
};
