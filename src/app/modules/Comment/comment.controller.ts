import { Request, Response } from "express";
import httpStatus from "http-status";

import { CommentService } from "./comment.service";

import catchAsync from "../../../share/catchAsync";
import sendResponse from "../../../share/sendResponse";

import { IAuthUser } from "../../interfaces/common";

const createComment = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const userEmail = req.user?.email;

		const { text } = req.body;
		const { postId } = req.params;

		const result = await CommentService.createComment(userEmail!, postId, text);

		sendResponse(res, {
			success: true,
			status: httpStatus.CREATED,
			message: "Comment Created successfully!",
			data: result,
		});
	}
);

const getPostComments = catchAsync(async (req: Request, res: Response) => {
	const { postId } = req.params;
	const result = await CommentService.getCommentsByPostId(postId);
	sendResponse(res, {
		success: true,
		status: httpStatus.OK,
		message: "Post retrieved successfully!",
		data: result,
	});
});

export const CommentController = {
	createComment,
	getPostComments,
};
