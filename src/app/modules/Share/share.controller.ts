import catchAsync from "../../../share/catchAsync";
import { Request, Response } from "express";
import { ShareService } from "./share.service";

const sharePost = catchAsync(async (req: Request, res: Response) => {
	const { senderId, receiverId, groupId, postId, message } = req.body;

	console.log(req.body);

	try {
		const result = await ShareService.createShare(
			senderId,
			receiverId,
			groupId,
			postId,
			message
		);
		res.status(201).json(result);
	} catch (error) {
		console.error("Error sharing post:", error);
		res.status(500).json({ error: "Failed to share post" });
	}
});

const getUserShares = catchAsync(async (req: Request, res: Response) => {
	const { userId } = req.params;

	console.log(userId);

	try {
		const shares = await ShareService.getSharesByUser(userId);
		res.status(200).json(shares);
	} catch (error) {
		console.error("Error retrieving user shares:", error);
		res.status(500).json({ error: "Failed to retrieve shares" });
	}
});

const getGroupShares = catchAsync(async (req: Request, res: Response) => {
	const { groupId } = req.params;

	try {
		const shares = await ShareService.getSharesByGroup(groupId);
		res.status(200).json(shares);
	} catch (error) {
		console.error("Error retrieving group shares:", error);
		res.status(500).json({ error: "Failed to retrieve shares" });
	}
});

export const ShareController = {
	sharePost,
	getUserShares,
	getGroupShares,
};
