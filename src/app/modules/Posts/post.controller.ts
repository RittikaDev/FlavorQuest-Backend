import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../share/catchAsync";
import sendResponse from "../../../share/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { PostService } from "./post.service";
import { PostStatus } from "@prisma/client";
import pick from "../../../share/pick";
import { postFilterableFields } from "./post.constants";

const createPost = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;

		const result = await PostService.createPost(user as IAuthUser, req);

		sendResponse(res, {
			success: true,
			status: httpStatus.CREATED,
			message: "Post Created successfully!",
			data: result,
		});
	}
);

// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
const updatePost = catchAsync(async (req: Request, res: Response) => {
	const postId = req.params.id;
	const { status, isPremium, adminComment } = req.body;

	const updateData: Partial<{
		status: PostStatus;
		adminComment: string;
		isPremium: boolean;
	}> = {};
	if (status) updateData.status = status;
	if (adminComment) updateData.adminComment = adminComment;
	if (typeof isPremium === "boolean") updateData.isPremium = isPremium;

	const result = await PostService.updatePostStatus(postId, updateData);

	sendResponse(res, {
		success: true,
		status: httpStatus.OK,
		message: "Post updated successfully!",
		data: result,
	});
});

const getPosts = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const filters = pick(req.query, postFilterableFields);
		const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

		if (!user) throw new Error("User is not authenticated");

		const result = await PostService.getPosts(user, filters, options);

		sendResponse(res, {
			success: true,
			status: httpStatus.OK,
			message: "Posts retrieved successfully",
			data: result,
		});
	}
);

export const PostController = {
	createPost,
	updatePost,
	getPosts,
};
