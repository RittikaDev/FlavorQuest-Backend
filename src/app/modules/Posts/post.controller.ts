import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../share/catchAsync";
import sendResponse from "../../../share/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { PostService } from "./post.service";
import { PostStatus } from "@prisma/client";

const createPost = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;

		const result = await PostService.createPost(user as IAuthUser, req);

		sendResponse(res, {
			success: true,
			status: httpStatus.CREATED,
			message: "Appointment booked successfully!",
			data: result,
		});
	}
);

// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
const updatePost = catchAsync(async (req: Request, res: Response) => {
	const postId = req.params.id;
	const { status, isPremium } = req.body;

	const updateData: Partial<{ status: PostStatus; isPremium: boolean }> = {};
	if (status) updateData.status = status;
	if (typeof isPremium === "boolean") updateData.isPremium = isPremium;

	const result = await PostService.updatePostStatus(postId, updateData);

	sendResponse(res, {
		success: true,
		status: httpStatus.OK,
		message: "Post updated successfully!",
		data: result,
	});
});

export const PostController = {
	createPost,
	updatePost,
};
